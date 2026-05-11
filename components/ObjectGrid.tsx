'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { ObjectRow } from '@/lib/supabase'

type SortKey = 'score' | 'cashflow' | 'price_asc' | 'yield'
type FilterKey = 'all' | 'cf_positive' | 'a_rated' | 'zeven' | 'mfh'

const eur = (v: number | null | undefined) =>
  v == null
    ? '—'
    : new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(v)

const num = (v: number | null | undefined, unit = '', d = 1) =>
  v == null
    ? '—'
    : `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: d }).format(v)}${unit}`

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
  if (filter === 'mfh') list = list.filter((o) => (o.units ?? 0) >= 3)

  list.sort((a, b) => {
    if (sort === 'score') return (b.score ?? 0) - (a.score ?? 0)
    if (sort === 'cashflow') return (b.cashflow_monthly ?? -9999) - (a.cashflow_monthly ?? -9999)
    if (sort === 'price_asc') return (a.price ?? Infinity) - (b.price ?? Infinity)
    if (sort === 'yield') return (b.netto_yield ?? 0) - (a.netto_yield ?? 0)
    return 0
  })

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label={`Alle (${objects.length})`} />
        <FilterButton active={filter === 'cf_positive'} onClick={() => setFilter('cf_positive')} label="💰 CF positiv" />
        <FilterButton active={filter === 'a_rated'} onClick={() => setFilter('a_rated')} label="🏆 A-Rating" />
        <FilterButton active={filter === 'mfh'} onClick={() => setFilter('mfh')} label="🏘 3+ Einheiten" />
        <FilterButton active={filter === 'zeven'} onClick={() => setFilter('zeven')} label="📍 Zeven" />

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
            className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition overflow-hidden flex flex-col"
          >
            {o.og_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={o.og_image}
                alt={o.title ?? ''}
                className="w-full h-40 object-cover bg-slate-100"
              />
            ) : (
              <div className="w-full h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <span className="text-slate-400 text-4xl">🏠</span>
              </div>
            )}

            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-slate-900 leading-tight line-clamp-2 text-sm">
                  {o.title ?? o.url}
                </h3>
                {o.rating && (
                  <span className={`shrink-0 px-2 py-0.5 text-xs font-bold rounded-full border ${ratingClass[o.rating] ?? ''}`}>
                    {o.rating} {o.score ?? ''}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 mb-3 line-clamp-1">
                {[o.city, o.units ? `${o.units} Einheiten` : null, o.year_built ? `Bj. ${o.year_built}` : null]
                  .filter(Boolean)
                  .join(' · ')}
              </p>

              <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-sm mb-3">
                <div>
                  <div className="text-xs text-slate-500">Kaufpreis</div>
                  <div className="font-semibold text-slate-900">{eur(o.price)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Cashflow/Mo</div>
                  <div className={`font-semibold ${o.cashflow_monthly && o.cashflow_monthly > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {eur(o.cashflow_monthly)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Preis/m²</div>
                  <div className="text-slate-900">{eur(o.price_per_sqm)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Netto-Rendite</div>
                  <div className={`${o.netto_yield && o.netto_yield > 5 ? 'text-emerald-700 font-medium' : 'text-slate-900'}`}>
                    {num(o.netto_yield, '%')}
                  </div>
                </div>
              </div>

              {o.annual_rent ? (
                <div className="pt-3 mt-auto border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Miete: <strong className="text-slate-900">{eur(o.annual_rent)}</strong>/J
                    {o.factor ? <span className="text-slate-400"> · {o.factor.toFixed(1)}×</span> : null}
                  </span>
                  <span className="text-slate-700 group-hover:text-slate-900 font-medium">→</span>
                </div>
              ) : (
                <div className="pt-3 mt-auto border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Keine Mietdaten</span>
                  <span className="text-slate-700 group-hover:text-slate-900 font-medium">→</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {list.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
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
