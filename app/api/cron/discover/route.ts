// Täglicher Cron: crawlt Quellen, findet neue Inserate, analysiert sie
import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { fetchUrl } from '@/lib/fetcher'
import { extractFromText } from '@/lib/extractor'
import { calcScoring } from '@/lib/scoring'
import { supabaseAdmin } from '@/lib/supabase'

export const maxDuration = 300
export const runtime = 'nodejs'

// Quellen-Suchseiten die wir crawlen (verifiziert fetchbar)
const SEARCH_PAGES = [
  // Stegeberg (lokaler Makler Zeven) - sehr zuverlässig
  'https://www.stegeberg-immobilien.de/de/objekte.html',
  // Grimberg (lokaler Makler Zeven)
  'https://www.grimberg-immobilien.de/objekte/kaufen/zeven/',
  // Immowelt MFH Zeven
  'https://www.immowelt.de/suche/kaufen/haus/mehrfamilienhaus/guenstig/niedersachsen/rotenburg-wumme-03357/ad06de41',
  'https://www.immowelt.de/suche/kaufen/haus/zweifamilienhaus/niedersachsen/rotenburg-wumme-03357',
]

function extractLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html)
  const links = new Set<string>()

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')
    if (!href) return

    try {
      const abs = new URL(href, baseUrl).toString()
      // Nur Detail-/Exposé-URLs (Heuristik)
      const isExpose =
        /\/expose\//i.test(abs) ||
        /\/objekt(e)?\//i.test(abs) ||
        /\/anzeige\//i.test(abs) ||
        /\/immobilie\//i.test(abs) ||
        /\/expose\?/i.test(abs)
      if (isExpose) links.add(abs.split('#')[0])
    } catch {
      /* ignore */
    }
  })

  return Array.from(links)
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const sb = supabaseAdmin()

  // 1) Bekannte URLs aus DB ziehen
  const { data: known } = await sb.from('objects').select('url')
  const knownSet = new Set((known ?? []).map((k) => k.url))

  // 2) Suchseiten crawlen → Detail-URLs sammeln
  const newUrls = new Set<string>()
  for (const search of SEARCH_PAGES) {
    const r = await fetchUrl(search)
    if (!r.ok || !r.html) continue
    extractLinks(r.html, search).forEach((u) => {
      if (!knownSet.has(u)) newUrls.add(u)
    })
  }

  // 3) Limit für API-Kosten (max 5 neue/Tag)
  const candidates = Array.from(newUrls).slice(0, 5)

  // 4) Jede neue URL analysieren
  const results: Array<{ url: string; ok: boolean; error?: string; score?: number }> = []
  for (const url of candidates) {
    try {
      const fetched = await fetchUrl(url)
      if (!fetched.ok || !fetched.cleanText) {
        results.push({ url, ok: false, error: `Fetch ${fetched.status}` })
        continue
      }
      const extracted = await extractFromText(fetched.cleanText)
      if (!extracted.price) {
        results.push({ url, ok: false, error: 'Kein Preis erkannt' })
        continue
      }
      const scoring = calcScoring({
        price: extracted.price,
        living_area: extracted.living_area,
        annual_rent: extracted.annual_rent,
        units: extracted.units,
        year_built: extracted.year_built,
        city: extracted.city,
        is_rented: extracted.is_rented,
      })

      const { data } = await sb
        .from('objects')
        .upsert(
          {
            url: fetched.finalUrl,
            source: new URL(url).hostname.replace('www.', ''),
            status: 'active',
            ...extracted,
            ...{
              price_per_sqm: scoring.price_per_sqm,
              factor: scoring.factor,
              brutto_yield: scoring.brutto_yield,
              netto_yield: scoring.netto_yield,
              monthly_rate: scoring.monthly_rate,
              cashflow_monthly: scoring.cashflow_monthly,
              score: scoring.score,
              rating: scoring.rating,
            },
            raw_data: { extracted, scoring, source: 'discover' },
            last_checked_at: new Date().toISOString(),
          },
          { onConflict: 'url' }
        )
        .select()
        .single()

      if (data) {
        await sb.from('analyses').insert({
          object_id: data.id,
          price: extracted.price,
          annual_rent: extracted.annual_rent,
          score: scoring.score,
          cashflow_monthly: scoring.cashflow_monthly,
          raw_data: { extracted, scoring },
        })
      }

      results.push({ url, ok: true, score: scoring.score })
    } catch (err) {
      results.push({
        url,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return NextResponse.json({
    discovered: newUrls.size,
    analyzed: candidates.length,
    results,
  })
}
