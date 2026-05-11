import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { calcScoring } from '@/lib/scoring'

export const runtime = 'nodejs'

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const body = await req.json()
  const sb = supabaseAdmin()

  // Update + neu rechnen
  const { data: current, error: fetchErr } = await sb.from('objects').select('*').eq('id', id).single()
  if (fetchErr || !current) return NextResponse.json({ error: 'Objekt nicht gefunden' }, { status: 404 })

  const merged = { ...current, ...body }

  const scoring = calcScoring({
    price: merged.price ?? 0,
    living_area: merged.living_area,
    plot_area: merged.plot_area,
    annual_rent: merged.annual_rent,
    warm_rent: merged.warm_rent,
    units: merged.units,
    year_built: merged.year_built,
    city: merged.city,
    is_rented: merged.is_rented,
    commercial_share: merged.commercial_share,
    energy_kwh: merged.energy_kwh,
  })

  // Integer-Felder runden vor Insert (Schema-Spalten sind 'integer')
  const INT_FIELDS = ['units', 'rooms', 'year_built', 'year_renovated', 'last_major_renovation', 'heating_year']
  for (const f of INT_FIELDS) {
    if (body[f] !== undefined && body[f] !== null && body[f] !== '') {
      const n = Number(body[f])
      body[f] = isNaN(n) ? null : Math.round(n)
    }
  }

  const update = {
    ...body,
    price_per_sqm: scoring.price_per_sqm,
    factor: scoring.factor,
    brutto_yield: scoring.brutto_yield,
    netto_yield: scoring.netto_yield,
    monthly_rate: scoring.monthly_rate,
    cashflow_monthly: scoring.cashflow_monthly,
    score: scoring.score,
    rating: scoring.rating,
  }

  const { data, error } = await sb.from('objects').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // History
  await sb.from('analyses').insert({
    object_id: id,
    price: merged.price,
    annual_rent: merged.annual_rent,
    score: scoring.score,
    cashflow_monthly: scoring.cashflow_monthly,
    raw_data: { source: 'manual_edit', scoring },
  })

  return NextResponse.json({ object: data })
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const sb = supabaseAdmin()
  const { error } = await sb.from('objects').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
