import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const eur = (v: number | null | undefined) =>
  v == null
    ? '–'
    : new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(v)

const num = (v: number | null | undefined, unit = '', d = 1) =>
  v == null
    ? '–'
    : `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: d }).format(v)}${unit}`

const ratingClass: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  B: 'bg-sky-100 text-sky-800 border-sky-200',
  C: 'bg-amber-100 text-amber-800 border-amber-200',
  D: 'bg-rose-100 text-rose-800 border-rose-200',
}

export default async function ObjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = supabaseAdmin()

  const { data: object } = await sb.from('objects').select('*').eq('id', id).single()
  if (!object) notFound()

  const { data: analyses } = await sb
    .from('analyses')
    .select('*')
    .eq('object_id', id)
    .order('analyzed_at', { ascending: false })

  const { data: checks } = await sb
    .from('check_history')
    .select('*')
    .eq('object_id', id)
    .order('checked_at', { ascending: false })
    .limit(10)

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
            ← Zurück zur Übersicht
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{object.title ?? object.url}</h1>
              <p className="text-sm text-slate-500 mt-1">
                {object.address ?? ''} {object.city ?? ''} {object.postal_code ?? ''}
              </p>
            </div>
            {object.rating && (
              <span
                className={`px-3 py-1 text-sm font-bold rounded-full border ${ratingClass[object.rating]}`}
              >
                {object.rating} · Score {object.score}/100
              </span>
            )}
          </div>

          <a
            href={object.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-sky-700 hover:text-sky-900 font-medium"
          >
            Original-Inserat ansehen →
          </a>

          {object.description && (
            <p className="mt-4 text-slate-700 text-sm leading-relaxed">{object.description}</p>
          )}

          {/* Status Badge */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Badge label={`Status: ${object.status}`} />
            {object.is_rented && <Badge label="Vermietet" />}
            {object.year_built && <Badge label={`Bj. ${object.year_built}`} />}
            {object.energy_class && <Badge label={`Energie ${object.energy_class}`} />}
            <Badge label={object.source} />
          </div>
        </div>

        {/* Kennzahlen */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card title="Stammdaten">
            <Row label="Kaufpreis" value={eur(object.price)} bold />
            <Row label="Wohnfläche" value={num(object.living_area, ' m²')} />
            <Row label="Grundstück" value={num(object.plot_area, ' m²')} />
            <Row label="Wohneinheiten" value={object.units?.toString() ?? '–'} />
            <Row label="Zimmer" value={object.rooms?.toString() ?? '–'} />
            <Row label="Preis/m²" value={eur(object.price_per_sqm)} />
          </Card>

          <Card title="Cashflow & Rendite">
            <Row label="Jahres-Kaltmiete" value={eur(object.annual_rent)} />
            <Row label="Mietfaktor" value={num(object.factor, 'x')} />
            <Row label="Brutto-Rendite" value={num(object.brutto_yield, '%')} />
            <Row label="Netto-Rendite" value={num(object.netto_yield, '%')} bold />
            <Row label="Monatsrate" value={eur(object.monthly_rate)} />
            <Row
              label="Cashflow/Monat"
              value={eur(object.cashflow_monthly)}
              bold
              className={
                object.cashflow_monthly && object.cashflow_monthly > 0
                  ? 'text-emerald-700'
                  : 'text-rose-700'
              }
            />
          </Card>
        </div>

        {/* Analyse-Verlauf */}
        <Card title={`Analyse-Verlauf (${analyses?.length ?? 0})`} className="mb-6">
          {!analyses || analyses.length === 0 ? (
            <p className="text-sm text-slate-500">Noch keine Analysen.</p>
          ) : (
            <div className="space-y-2">
              {analyses.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-500">
                    {new Date(a.analyzed_at).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                  <div className="flex gap-4">
                    <span>{eur(a.price)}</span>
                    <span className="text-slate-500">CF {eur(a.cashflow_monthly)}</span>
                    <span className="font-semibold">Score {a.score}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Status-Checks (24h)">
          {!checks || checks.length === 0 ? (
            <p className="text-sm text-slate-500">Noch keine Checks gelaufen.</p>
          ) : (
            <div className="space-y-1 text-sm">
              {checks.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-1">
                  <span className="text-slate-500">
                    {new Date(c.checked_at).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                  <span className={c.is_alive ? 'text-emerald-700' : 'text-rose-700'}>
                    {c.is_alive ? '✓ aktiv' : `✗ tot (${c.status_code})`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  )
}

function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 ${className}`}>
      <h2 className="font-semibold text-slate-900 mb-3">{title}</h2>
      {children}
    </div>
  )
}

function Row({
  label,
  value,
  bold = false,
  className = '',
}: {
  label: string
  value: string
  bold?: boolean
  className?: string
}) {
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`${bold ? 'font-semibold' : ''} text-slate-900 ${className}`}>{value}</span>
    </div>
  )
}

function Badge({ label }: { label: string }) {
  return (
    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">{label}</span>
  )
}
