import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import AnalyzeForm from '@/components/AnalyzeForm'
import ObjectGrid from '@/components/ObjectGrid'

export const revalidate = 60
export const dynamic = 'force-dynamic'

export default async function Home() {
  const sb = supabaseAdmin()
  const { data: objects } = await sb
    .from('objects')
    .select('*')
    .in('status', ['active', 'reserved'])
    .order('score', { ascending: false, nullsFirst: false })
    .limit(100)

  const stats = {
    total: objects?.length ?? 0,
    a: objects?.filter((o) => o.rating === 'A').length ?? 0,
    cfPos: objects?.filter((o) => (o.cashflow_monthly ?? -999) > 0).length ?? 0,
    avgPrice:
      objects && objects.length > 0
        ? Math.round(
            objects.reduce((s, o) => s + (o.price ?? 0), 0) / objects.length
          )
        : 0,
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">ImmoAgent Pro</h1>
            <p className="text-xs text-slate-500">Live-Marktanalyse Zeven + Umkreis</p>
          </div>
          <nav className="flex gap-3 text-sm">
            <Link href="/" className="text-slate-700 hover:text-slate-900">Übersicht</Link>
            <Link href="/expired" className="text-slate-500 hover:text-slate-900">Archiv</Link>
            <Link href="/about" className="text-slate-500 hover:text-slate-900">Methodik</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Stat label="Aktive Objekte" value={stats.total.toString()} />
          <Stat label="A-Rated" value={stats.a.toString()} accent="green" />
          <Stat label="Cashflow positiv" value={stats.cfPos.toString()} accent="blue" />
          <Stat
            label="Ø Kaufpreis"
            value={
              stats.avgPrice
                ? new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                    maximumFractionDigits: 0,
                  }).format(stats.avgPrice)
                : '–'
            }
          />
        </div>

        {/* Analyze Form */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="text-base font-semibold text-slate-900 mb-1">
            Inserat analysieren
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Exposé-URL einfügen. KI extrahiert die Daten und bewertet das Objekt.
          </p>
          <AnalyzeForm />
        </section>

        {/* Objects */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            Aktuelle Objekte ({stats.total})
          </h2>
          {!objects || objects.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <p className="text-slate-600">
                Noch keine Objekte analysiert. Füge oben einen Exposé-Link ein um zu starten.
              </p>
            </div>
          ) : (
            <ObjectGrid objects={objects} />
          )}
        </section>
      </div>
    </main>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: 'green' | 'blue'
}) {
  const accentClass =
    accent === 'green'
      ? 'text-emerald-600'
      : accent === 'blue'
      ? 'text-sky-600'
      : 'text-slate-900'
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 font-medium">
        {label}
      </div>
      <div className={`text-2xl font-bold mt-1 ${accentClass}`}>{value}</div>
    </div>
  )
}
