'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { ObjectRow } from '@/lib/supabase'

type SortKey = 'score' | 'cashflow' | 'price_asc' | 'yield'
type FilterKey = 'all' | 'cf_positive' | 'a_rated' | 'zeven'

const eur = (v: number | null | undefined) =>
  v == null
    ? '–'
    : new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(v)

const num = (v: number | null | undefined, unit = '') =>
  v == null ? '–' : `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(v)}${unit}`

const ratingClass: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  B: 'bg-sky-100 text-sky-800 border-sky-200',
  C: 'bg-amber-100 text-amber-800 border-amber-200',
  D: 'bg-rose-100 text-rose-800 border-rose-200',
}

export default function ObjectGrid({ objects }: { objects: ObjectRow[] }) {
  const [sort, setSort] = useState<SortKey>('score')
  const [filter, setFilter] = useState<FilterKey>('all')

  let list = [...objects]

  if (filter === 'cf_positive') list = list.filter((o) => (o.cashflow_monthly ?? -999) > 0)
  if (filter === 'a_rated') list = list.filter((o) => o.rating === 'A')
  if (filter === 'zeven') list = list.filter((o) => o.city?.toLowerCase().includes('zeven'))

  list.sort((a, b) => {
    if (sort === 'score') return (b.score ?? 0) - (a.score ?? 0)
    if (sort === 'cashflow') return (b.cashflow_monthly ?? -9999) - (a.cashflow_monthly ?? -9999)
    if (sort === 'price_asc') return (a.price ?? Infinity) - (b.price ?? Infinity)
    if (sort === 'yield') return (b.netto_yield ?? 0) - (a.netto_yield ?? 0)
    return 0
  })

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label={`Alle (${objects.length})`} />
        <FilterButton active={filter === 'cf_positive'} onClick={() => setFilter('cf_positive')} label="Cashflow positiv" />
        <FilterButton active={filter === 'a_rated'} onClick={() => setFilter('a_rated')} label="Nur A-Rating" />
        <FilterButton active={filter === 'zeven'} onClick={() => setFilter('zeven')} label="Zeven" />

        <div className="ml-auto">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white"
          >
            <option value="score">Score ↓</option>
            <option value="cashflow">Cashflow ↓</option>
            <option value="yield">Netto-Rendite ↓</option>
            <option value="price_asc">Preis ↑</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((o) => (
          <Link
            key={o.id}
            href={`/objects/${o.id}`}
            className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-slate-900 leading-tight line-clamp-2">
                  {o.title ?? o.url}
                </h3>
                {o.rating && (
                  <span
                    className={`shrink-0 px-2 py-0.5 text-xs font-bold rounded-full border ${ratingClass[o.rating] ?? ''}`}
                  >
                    {o.rating} {o.score ?? ''}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mb-4">
                {o.city ?? ''} {o.postal_code ? `· ${o.postal_code}` : ''}
                {o.units ? ` · ${o.units} Einheiten` : ''}
              </p>

              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                <Field label="Kaufpreis" value={eur(o.price)} bold />
                <Field
                  label="Cashflow/Mo"
                  value={eur(o.cashflow_monthly)}
                  className={o.cashflow_monthly && o.cashflow_monthly > 0 ? 'text-emerald-700' : 'text-rose-700'}
                  bold
                />
                <Field label="m²" value={num(o.living_area, ' m²')} />
                <Field label="Preis/m²" value={eur(o.price_per_sqm)} />
                <Field label="Netto-Rendite" value={num(o.netto_yield, '%')} />
                <Field label="Faktor" value={num(o.factor, 'x')} />
              </div>

              {o.annual_rent ? (
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  Jahres-Kaltmiete: <strong>{eur(o.annual_rent)}</strong>
                  {o.is_rented ? ' · vermietet' : ''}
                </div>
              ) : null}

              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-400">{o.source}</span>
                <span className="text-slate-700 group-hover:text-slate-900 font-medium">
                  Details →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {list.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500">
          Keine Objekte mit diesen Filtern.
        </div>
      )}
    </div>
  )
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition border ${
        active
          ? 'bg-slate-900 text-white border-slate-900'
          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
      }`}
    >
      {label}
    </button>
  )
}

function Field({
  label,
  value,
  className = '',
  bold = false,
}: {
  label: string
  value: string
  className?: string
  bold?: boolean
}) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`${bold ? 'font-semibold' : ''} text-slate-900 ${className}`}>{value}</div>
    </div>
  )
}
