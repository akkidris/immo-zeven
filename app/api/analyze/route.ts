import { NextRequest, NextResponse } from 'next/server'
import { fetchUrl, detectSource } from '@/lib/fetcher'
import { extractFromText } from '@/lib/extractor'
import { calcScoring } from '@/lib/scoring'
import { supabaseAdmin } from '@/lib/supabase'

export const maxDuration = 60
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL fehlt' }, { status: 400 })
    }

    // 1) Fetch
    const fetched = await fetchUrl(url)
    if (!fetched.ok || !fetched.cleanText) {
      return NextResponse.json(
        {
          error: 'URL konnte nicht geladen werden',
          status: fetched.status,
          detail: fetched.error,
        },
        { status: 422 }
      )
    }

    // 2) Extract via Claude
    const extracted = await extractFromText(fetched.cleanText)

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

    // 5) Upsert in DB
    const sb = supabaseAdmin()
    const payload = {
      url: fetched.finalUrl,
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
      units: extracted.units ?? null,
      rooms: extracted.rooms ?? null,
      year_built: extracted.year_built ?? null,
      year_renovated: extracted.year_renovated ?? null,
      last_major_renovation: extracted.last_major_renovation ?? null,
      energy_class: extracted.energy_class ?? null,
      energy_kwh: extracted.energy_kwh ?? null,
      heating_type: extracted.heating_type ?? null,
      heating_year: extracted.heating_year ?? null,
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
      raw_data: { extracted, scoring },
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
