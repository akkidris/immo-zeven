import { NextRequest, NextResponse } from 'next/server'
import { fetchUrl, detectSource } from '@/lib/fetcher'
import { extractFromText } from '@/lib/extractor'
import { calcScoring } from '@/lib/scoring'
import { supabaseAdmin } from '@/lib/supabase'

export const maxDuration = 60
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { url, pastedText } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL fehlt' }, { status: 400 })
    }

    // Wenn pastedText vorhanden → fetch überspringen, direkt analysieren
    let textForAnalysis: string
    let finalUrl = url
    let fetchStrategy = 'paste'

    if (pastedText && typeof pastedText === 'string' && pastedText.length > 100) {
      textForAnalysis = pastedText.slice(0, 30000)
    } else {
      // 1) Fetch mit Multi-Strategy
      const fetched = await fetchUrl(url)
      if (!fetched.ok || !fetched.cleanText) {
        return NextResponse.json(
          {
            error: 'URL konnte nicht geladen werden — Portal blockt Server-Anfragen',
            status: fetched.status,
            attempts: fetched.attempts,
            hint: 'Wechsle zum Paste-Modus: Öffne das Inserat im Browser → Cmd+A → Cmd+C → in Paste-Feld einfügen',
          },
          { status: 422 }
        )
      }
      textForAnalysis = fetched.cleanText
      finalUrl = fetched.finalUrl
      fetchStrategy = fetched.strategy
    }

    // 2) Extract via Claude
    const extracted = await extractFromText(textForAnalysis)

    if (!extracted.price) {
      return NextResponse.json(
        { error: 'Kein Kaufpreis erkannt — manuelle Eingabe nötig?', extracted },
        { status: 422 }
      )
    }

    // 3) Score berechnen
    const scoring = calcScoring({
      price: extracted.price,
      living_area: extracted.living_area,
      plot_area: extracted.plot_area,
      annual_rent: extracted.annual_rent,
      warm_rent: extracted.warm_rent,
      units: extracted.units,
      year_built: extracted.year_built,
      city: extracted.city,
      is_rented: extracted.is_rented,
      commercial_share: extracted.commercial_share,
      energy_kwh: extracted.energy_kwh,
    })

    // 4) Status aus Text ableiten
    const statusText = extracted.status_text?.toLowerCase()
    let status = 'active'
    if (statusText?.includes('verkauft') || statusText?.includes('sold')) status = 'sold'
    else if (statusText?.includes('reserv')) status = 'reserved'
    else if (statusText?.includes('anfragestop')) status = 'reserved'

    // Integer-Felder runden (DB-Spalten sind 'integer', KI gibt manchmal Dezimalzahlen)
    const toInt = (v: number | null | undefined): number | null =>
      v == null || isNaN(Number(v)) ? null : Math.round(Number(v))

    // 5) Upsert in DB
    const sb = supabaseAdmin()
    const payload = {
      url: finalUrl,
      source: detectSource(url),
      status,
      title: extracted.title ?? null,
      description: extracted.description ?? null,
      city: extracted.city ?? null,
      postal_code: extracted.postal_code ?? null,
      address: extracted.address ?? null,
      price: extracted.price ?? null,
      living_area: extracted.living_area ?? null,
      plot_area: extracted.plot_area ?? null,
      units: toInt(extracted.units),
      rooms: toInt(extracted.rooms),
      year_built: toInt(extracted.year_built),
      year_renovated: toInt(extracted.year_renovated),
      last_major_renovation: toInt(extracted.last_major_renovation),
      heating_year: toInt(extracted.heating_year),
      energy_class: extracted.energy_class ?? null,
      energy_kwh: extracted.energy_kwh ?? null,
      heating_type: extracted.heating_type ?? null,
      annual_rent: extracted.annual_rent ?? null,
      warm_rent: extracted.warm_rent ?? null,
      is_rented: extracted.is_rented ?? null,
      commercial_share: extracted.commercial_share ?? null,
      features: extracted.features ?? null,
      og_image: extracted.og_image ?? null,
      price_per_sqm: scoring.price_per_sqm,
      factor: scoring.factor,
      brutto_yield: scoring.brutto_yield,
      netto_yield: scoring.netto_yield,
      monthly_rate: scoring.monthly_rate,
      cashflow_monthly: scoring.cashflow_monthly,
      score: scoring.score,
      rating: scoring.rating,
      raw_data: { extracted, scoring, fetchStrategy },
      last_checked_at: new Date().toISOString(),
    }

    const { data, error } = await sb
      .from('objects')
      .upsert(payload, { onConflict: 'url' })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // History-Eintrag
    await sb.from('analyses').insert({
      object_id: data.id,
      price: extracted.price ?? null,
      annual_rent: extracted.annual_rent ?? null,
      score: scoring.score,
      cashflow_monthly: scoring.cashflow_monthly,
      raw_data: { extracted, scoring },
    })

    return NextResponse.json({ object: data, scoring, extracted })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unbekannter Fehler' },
      { status: 500 }
    )
  }
}
