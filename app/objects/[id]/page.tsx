import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { calcScoring, type ScoringResult } from '@/lib/scoring'
import EditObjectForm from '@/components/EditObjectForm'
import DeleteObjectButton from '@/components/DeleteObjectButton'

export const dynamic = 'force-dynamic'

const eur = (v: number | null | undefined, d = 0) =>
  v == null
    ? '—'
    : new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: d,
        minimumFractionDigits: d,
      }).format(v)

const num = (v: number | null | undefined, unit = '', d = 1) =>
  v == null
    ? '—'
    : `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: d, minimumFractionDigits: d }).format(v)}${unit}`

const pct = (v: number | null | undefined, d = 1) =>
  v == null ? '—' : `${v > 0 ? '+' : ''}${num(v, '%', d)}`

const ratingClass: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  B: 'bg-sky-100 text-sky-800 border-sky-200',
  C: 'bg-amber-100 text-amber-800 border-amber-200',
  D: 'bg-rose-100 text-rose-800 border-rose-200',
}

const verdictClass: Record<string, string> = {
  KAUFEN: 'bg-emerald-600 text-white',
  PRÜFEN: 'bg-sky-600 text-white',
  VERHANDELN: 'bg-amber-600 text-white',
  ÜBERSPRINGEN: 'bg-rose-600 text-white',
}

export default async function ObjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sb = supabaseAdmin()

  const { data: object } = await sb.from('objects').select('*').eq('id', id).single()
  if (!object) notFound()

  const scoring: ScoringResult = calcScoring({
    price: object.price ?? 0,
    living_area: object.living_area,
    plot_area: object.plot_area,
    annual_rent: object.annual_rent,
    warm_rent: object.warm_rent,
    units: object.units,
    year_built: object.year_built,
    city: object.city,
    is_rented: object.is_rented,
    commercial_share: object.commercial_share,
    energy_kwh: object.energy_kwh,
  })

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
    .limit(5)

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
            ← Übersicht
          </Link>
          <div className="flex items-center gap-3">
            <a
              href={object.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-sky-700 hover:text-sky-900 font-medium"
            >
              Original ↗
            </a>
            <DeleteObjectButton id={object.id} />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">
        {/* Hero */}
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {object.og_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={object.og_image} alt={object.title ?? ''} className="w-full h-64 object-cover" />
          )}
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span>{object.source}</span>
                  <span>·</span>
                  <span>{object.status}</span>
                  {object.is_rented && <><span>·</span><span className="text-emerald-700 font-medium">vermietet</span></>}
                </div>
                <h1 className="text-2xl font-bold text-slate-900 leading-tight">{object.title ?? 'Ohne Titel'}</h1>
                <p className="text-sm text-slate-500 mt-1">
                  {[object.address, object.postal_code, object.city].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className={`px-3 py-1.5 text-sm font-bold rounded-full border ${ratingClass[scoring.rating]}`}>
                  {scoring.rating} · Score {scoring.score}/100
                </div>
                <div className={`px-3 py-1 text-xs font-bold rounded-full ${verdictClass[scoring.verdict]}`}>
                  {scoring.verdict}
                </div>
              </div>
            </div>

            {object.description && (
              <p className="mt-3 text-sm text-slate-700 leading-relaxed">{object.description}</p>
            )}

            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              <QuickStat label="Kaufpreis" value={eur(object.price)} accent="primary" />
              <QuickStat
                label="Cashflow / Mo (0€ EK)"
                value={eur(scoring.cashflow_monthly)}
                accent={scoring.cashflow_monthly > 0 ? 'positive' : 'negative'}
              />
              <QuickStat label="Netto-Rendite" value={num(scoring.netto_yield, '%')} accent={(scoring.netto_yield ?? 0) > 5 ? 'positive' : undefined} />
              <QuickStat label="Mietfaktor" value={scoring.factor ? `${scoring.factor.toFixed(1)}×` : '—'} accent={(scoring.factor ?? 99) < 15 ? 'positive' : undefined} />
            </div>
          </div>
        </section>

        {/* Pro/Contra */}
        <section className="grid md:grid-cols-2 gap-4">
          <Card title="✅ Pluspunkte" tone="positive">
            {scoring.pros.length === 0 ? (
              <p className="text-sm text-slate-500">Keine erkannten Stärken.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {scoring.pros.map((p, i) => (
                  <li key={i} className="flex gap-2 text-slate-700">
                    <span className="text-emerald-600 shrink-0">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="⚠️ Risiken" tone="negative">
            {scoring.cons.length === 0 ? (
              <p className="text-sm text-slate-500">Keine kritischen Punkte erkannt.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {scoring.cons.map((c, i) => (
                  <li key={i} className="flex gap-2 text-slate-700">
                    <span className="text-rose-600 shrink-0">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        {/* Finanzierungs-Szenarien */}
        <Card title="💰 Finanzierungs-Szenarien">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="py-2 pr-3 font-medium">Eigenkapital</th>
                  <th className="py-2 px-3 font-medium">Darlehen</th>
                  <th className="py-2 px-3 font-medium">LTV</th>
                  <th className="py-2 px-3 font-medium">Rate/Mo</th>
                  <th className="py-2 px-3 font-medium">CF /Mo</th>
                  <th className="py-2 px-3 font-medium">CF nach Steuer</th>
                  <th className="py-2 px-3 font-medium">Tilg+AfA/Jahr</th>
                </tr>
              </thead>
              <tbody>
                {scoring.scenarios.map((s, i) => (
                  <tr key={i} className={`border-b border-slate-100 ${i === 0 ? 'bg-amber-50/50' : ''}`}>
                    <td className="py-2.5 pr-3 font-medium">
                      {eur(s.equity)}
                      {i === 0 && <span className="ml-1 text-xs text-amber-700">(deine Situation)</span>}
                    </td>
                    <td className="py-2.5 px-3">{eur(s.loan)}</td>
                    <td className="py-2.5 px-3">{s.loan_to_value.toFixed(0)}%</td>
                    <td className="py-2.5 px-3">{eur(s.monthly_rate)}</td>
                    <td className={`py-2.5 px-3 font-semibold ${s.cashflow_monthly > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {eur(s.cashflow_monthly)}
                    </td>
                    <td className={`py-2.5 px-3 font-semibold ${s.cashflow_after_tax > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {eur(s.cashflow_after_tax)}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-700">+{eur(s.yearly_buildup)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Zins 3,8% · Tilgung 2% · Steuersatz 42% · CF nach Steuer berücksichtigt Verlustverrechnung mit AfA
          </p>
        </Card>

        {/* House Hacking */}
        {scoring.house_hacking && object.units && object.units >= 2 && (
          <Card title="🏠 House Hacking — eine Einheit selbst bewohnen">
            <div className="grid md:grid-cols-3 gap-4">
              <Stat label="Effektive Wohnkosten/Monat" value={eur(scoring.house_hacking.own_living_cost)} accent="primary" />
              <Stat label="Entgangene Miete/Jahr" value={eur(scoring.house_hacking.rent_lost)} />
              <Stat label="Rest-Cashflow/Mo" value={eur(scoring.house_hacking.cashflow_monthly)} />
            </div>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Du wohnst in einer Einheit, vermietest die anderen {object.units - 1}. Die Mieter zahlen quasi deine Rate ab.
              Bei 0€ EK rechnet sich das oft besser als gleich teuer mieten in derselben Lage.
            </p>
          </Card>
        )}

        {/* Mietsteigerung */}
        {scoring.rent_upside_pct && scoring.rent_upside_yearly && scoring.rent_upside_pct > 5 && (
          <Card title="📈 Mietsteigerungspotenzial" tone="positive">
            <div className="grid md:grid-cols-3 gap-4">
              <Stat label="IST-Miete €/m²" value={num(scoring.rent_per_sqm, ' €', 2)} />
              <Stat label="Markt-Miete €/m²" value={`${scoring.market_rent_per_sqm.toFixed(2)} €`} />
              <Stat label="Upside / Jahr" value={`+${eur(scoring.rent_upside_yearly)}`} accent="positive" />
            </div>
            <p className="text-sm text-slate-700 mt-4 leading-relaxed">
              Aktuelle Mieter zahlen <strong>{scoring.rent_upside_pct.toFixed(0)}% unter Marktniveau</strong>.
              Bei Mieterwechsel oder Modernisierung lassen sich Mieten anpassen — klarer Wertsteigerungs-Hebel.
            </p>
          </Card>
        )}

        {/* Sensitivity */}
        <Card title="🔬 Sensitivity — Was wenn?">
          <div className="grid md:grid-cols-3 gap-3">
            <SensitivityRow label="Miete −10%" value={scoring.sensitivity.rent_minus_10} />
            <SensitivityRow label="Standard (Basis)" value={scoring.cashflow_monthly} highlight />
            <SensitivityRow label="Miete +10%" value={scoring.sensitivity.rent_plus_10} />
            <SensitivityRow label="Zins 3,0%" value={scoring.sensitivity.rate_3_0} />
            <SensitivityRow label="Zins 3,8% (Basis)" value={scoring.cashflow_monthly} highlight />
            <SensitivityRow label="Zins 4,5%" value={scoring.sensitivity.rate_4_5} />
          </div>
          <p className="text-xs text-slate-500 mt-3">Werte: Cashflow / Monat. Alle bei Vollfinanzierung (0€ EK).</p>
        </Card>

        {/* Kennzahlen */}
        <section className="grid md:grid-cols-2 gap-4">
          <Card title="📊 Stammdaten">
            <Row label="Kaufpreis" value={eur(object.price)} bold />
            <Row label="Nebenkosten (10,57%)" value={eur(scoring.closing_costs)} />
            <Row label="Gesamtinvestition" value={eur(scoring.total_investment)} bold />
            <Divider />
            <Row label="Wohnfläche" value={num(object.living_area, ' m²')} />
            <Row label="Grundstück" value={num(object.plot_area, ' m²')} />
            <Row label="Preis/m² Wohnen" value={eur(scoring.price_per_sqm)} />
            <Row label="vs. Markt (2.184€)" value={pct(scoring.price_vs_market_pct, 0)} className={(scoring.price_vs_market_pct ?? 0) < 0 ? 'text-emerald-700' : 'text-rose-700'} />
            <Divider />
            <Row label="Wohneinheiten" value={object.units?.toString() ?? '—'} />
            <Row label="Zimmer" value={object.rooms?.toString() ?? '—'} />
            <Row label="Baujahr" value={object.year_built?.toString() ?? '—'} />
            <Row label="Letzte Sanierung" value={(object.last_major_renovation ?? object.year_renovated)?.toString() ?? '—'} />
            <Row label="Heizung" value={object.heating_type ?? '—'} />
            <Row label="Energiekennwert" value={object.energy_kwh ? `${object.energy_kwh} kWh/m²a` : (object.energy_class ?? '—')} />
          </Card>

          <Card title="💵 Cashflow-Aufbau (Jahr)">
            <Row label="Jahres-Kaltmiete" value={eur(object.annual_rent)} bold />
            <Row label="− Instandhaltung (8%)" value={`−${eur((object.annual_rent ?? 0) * 0.08)}`} className="text-rose-700" />
            <Row label="− Verwaltung (5%)" value={`−${eur((object.annual_rent ?? 0) * 0.05)}`} className="text-rose-700" />
            <Row label="− Mietausfall (3%)" value={`−${eur((object.annual_rent ?? 0) * 0.03)}`} className="text-rose-700" />
            <Row label="− Versicherung" value={`−${eur((object.living_area ?? 0) * 0.5)}`} className="text-rose-700" />
            <Row label="= Netto-Miete / Jahr" value={eur(scoring.yearly_net_rent)} bold />
            <Divider />
            <Row label="Brutto-Rendite" value={num(scoring.brutto_yield, '%')} />
            <Row label="Netto-Rendite" value={num(scoring.netto_yield, '%')} bold />
            <Row label="Mietfaktor" value={scoring.factor ? `${scoring.factor.toFixed(1)}×` : '—'} />
            <Row label="IST-Miete €/m²" value={scoring.rent_per_sqm ? `${scoring.rent_per_sqm.toFixed(2)} €` : '—'} />
            <Divider />
            <Row label="AfA-Vorteil / Jahr" value={`+${eur(scoring.tax_savings_yearly)}`} className="text-emerald-700" />
          </Card>
        </section>

        {/* Override */}
        <Card title="✏️ Daten korrigieren">
          <p className="text-sm text-slate-600 mb-4">
            Falls die KI etwas falsch erkannt hat oder du genauere Zahlen vom Makler hast, passe sie hier an —
            die Analyse rechnet sich automatisch neu.
          </p>
          <EditObjectForm object={object} />
        </Card>

        {/* Verlauf */}
        <section className="grid md:grid-cols-2 gap-4">
          <Card title={`📜 Analyse-Verlauf (${analyses?.length ?? 0})`}>
            {!analyses || analyses.length === 0 ? (
              <p className="text-sm text-slate-500">Noch keine Analysen.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analyses.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                    <span className="text-slate-500 text-xs">
                      {new Date(a.analyzed_at).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    <div className="flex gap-3 text-xs">
                      <span>{eur(a.price)}</span>
                      <span className={a.cashflow_monthly > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                        {eur(a.cashflow_monthly)}
                      </span>
                      <span className="font-semibold">{a.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title={`🟢 Status-Checks`}>
            {!checks || checks.length === 0 ? (
              <p className="text-sm text-slate-500">Cron startet morgen 06:00 UTC.</p>
            ) : (
              <div className="space-y-1.5 text-sm">
                {checks.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-1">
                    <span className="text-slate-500 text-xs">
                      {new Date(c.checked_at).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    <span className={`text-xs font-medium ${c.is_alive ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {c.is_alive ? `✓ ${c.status_code}` : `✗ ${c.status_code}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      </div>
    </main>
  )
}

function Card({ title, children, tone, className = '' }: {
  title: string
  children: React.ReactNode
  tone?: 'positive' | 'negative'
  className?: string
}) {
  const toneClass =
    tone === 'positive' ? 'border-emerald-200' :
    tone === 'negative' ? 'border-rose-200' :
    'border-slate-200'
  return (
    <div className={`bg-white rounded-2xl border ${toneClass} p-5 ${className}`}>
      <h2 className="font-semibold text-slate-900 mb-3 text-sm">{title}</h2>
      {children}
    </div>
  )
}

function Row({ label, value, bold = false, className = '' }: {
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

function Divider() {
  return <div className="my-2 border-t border-slate-100" />
}

function QuickStat({ label, value, accent }: {
  label: string
  value: string
  accent?: 'primary' | 'positive' | 'negative'
}) {
  const cls =
    accent === 'positive' ? 'text-emerald-700' :
    accent === 'negative' ? 'text-rose-700' :
    'text-slate-900'
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <div className="text-xs uppercase tracking-wide text-slate-500 font-medium">{label}</div>
      <div className={`text-lg font-bold mt-0.5 ${cls}`}>{value}</div>
    </div>
  )
}

function Stat({ label, value, accent }: {
  label: string
  value: string
  accent?: 'positive' | 'primary'
}) {
  const cls =
    accent === 'positive' ? 'text-emerald-700' :
    'text-slate-900'
  return (
    <div>
      <div className="text-xs text-slate-500 font-medium">{label}</div>
      <div className={`text-lg font-bold mt-0.5 ${cls}`}>{value}</div>
    </div>
  )
}

function SensitivityRow({ label, value, highlight = false }: {
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? 'bg-slate-100' : 'bg-slate-50'}`}>
      <div className="text-xs text-slate-500 font-medium">{label}</div>
      <div className={`text-base font-bold mt-0.5 ${value > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
        {eur(value)}
      </div>
    </div>
  )
}
