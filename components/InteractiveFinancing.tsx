'use client'

import { useMemo, useState } from 'react'
import { useSettings } from '@/lib/settings'
import Term from '@/components/Term'

type Props = {
  price: number
  livingArea: number
  annualRent: number
  units: number
}

// Bewirtschaftung
const VERSICHERUNG_PRO_QM = 0.5
const NEBENKOSTEN_PCT = 0.1057 // 10.57% Niedersachsen
const AFA_RATE = 0.02
const GEBAEUDE_ANTEIL = 0.8

const eur = (v: number, d = 0) =>
  new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: d,
  }).format(v)

export default function InteractiveFinancing({ price, livingArea, annualRent, units }: Props) {
  const [globalSettings] = useSettings()

  // Lokale Override-Werte (initial = global)
  const [equity, setEquity] = useState(globalSettings.equity)
  const [rate, setRate] = useState(globalSettings.interest_rate)
  const [tilg, setTilg] = useState(globalSettings.amortization_rate)
  const [houseHack, setHouseHack] = useState(false)
  const [taxRate] = useState(globalSettings.tax_rate)

  const result = useMemo(() => {
    const closingCosts = price * NEBENKOSTEN_PCT
    const totalInvestment = price + closingCosts
    const loan = Math.max(0, totalInvestment - equity)

    // Bewirtschaftung
    const ih = annualRent * (globalSettings.maintenance_rate / 100)
    const verw = annualRent * (globalSettings.management_rate / 100)
    const ausfall = annualRent * (globalSettings.vacancy_rate / 100)
    const versich = livingArea * VERSICHERUNG_PRO_QM
    const yearlyOperating = ih + verw + ausfall + versich

    // Mietreduktion bei House Hacking (1 Einheit selbst)
    const rentMultiplier = houseHack && units >= 2 ? (units - 1) / units : 1
    const effectiveRent = annualRent * rentMultiplier
    const effectiveOperating = yearlyOperating * rentMultiplier
    const netRent = Math.max(0, effectiveRent - effectiveOperating)

    // Annuität
    const monthlyRate = (loan * (rate / 100 + tilg / 100)) / 12
    const yearlyInterest = loan * (rate / 100)
    const yearlyTilg = loan * (tilg / 100)

    // Cashflow
    const cashflowYearly = netRent - (yearlyInterest + yearlyTilg)
    const cashflowMonthly = cashflowYearly / 12

    // Steuer
    const afa = price * GEBAEUDE_ANTEIL * AFA_RATE
    // Bei House Hacking nur Anteil der vermieteten Einheiten
    const taxableAfa = houseHack && units >= 2 ? afa * rentMultiplier : afa
    const taxableInterest = houseHack && units >= 2 ? yearlyInterest * rentMultiplier : yearlyInterest
    const taxableLoss = netRent - taxableInterest - taxableAfa
    const taxSavings = taxableLoss < 0 ? Math.abs(taxableLoss) * (taxRate / 100) : 0
    const cashflowAfterTax = (cashflowYearly + taxSavings) / 12

    // Wohnkosten bei House Hacking
    const ownLivingCost = houseHack && units >= 2 ? -cashflowAfterTax : 0

    // Vermögensaufbau
    const wealthBuildup = yearlyTilg + taxSavings

    // Renditen
    const bruttoYield = price > 0 ? (annualRent / price) * 100 : 0
    const nettoYield = price > 0 ? ((annualRent - yearlyOperating) / price) * 100 : 0

    // Break-Even Jahre
    let breakEvenYears: number | null = null
    if (cashflowMonthly < 0 && yearlyTilg > 0) {
      const shiftPerYear = yearlyTilg * (rate / 100)
      breakEvenYears = shiftPerYear > 0 ? Math.round(Math.abs(cashflowYearly) / shiftPerYear) : null
      if (breakEvenYears && (breakEvenYears <= 0 || breakEvenYears > 50)) breakEvenYears = null
    }

    return {
      closingCosts,
      totalInvestment,
      loan,
      monthlyRate,
      cashflowMonthly,
      cashflowAfterTax,
      taxSavings,
      wealthBuildup,
      bruttoYield,
      nettoYield,
      breakEvenYears,
      ownLivingCost,
      ltv: totalInvestment > 0 ? (loan / totalInvestment) * 100 : 0,
    }
  }, [price, livingArea, annualRent, units, equity, rate, tilg, taxRate, houseHack, globalSettings])

  const cfPositive = result.cashflowAfterTax > 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold text-slate-900 text-sm">🎚️ Interaktive Finanzierung</h2>
        <span className="text-xs text-slate-500">Werte ändern → sofort neu berechnen</span>
      </div>
      <p className="text-xs text-slate-500 mb-5">
        Defaults aus deinem Profil. Hier kannst du für DIESES Objekt anders rechnen.
      </p>

      <div className="grid md:grid-cols-3 gap-4 mb-5">
        <Slider
          termKey="equity"
          label="Eigenkapital"
          value={equity}
          unit="€"
          min={0}
          max={Math.max(300000, price * 0.5)}
          step={5000}
          onChange={setEquity}
          formatter={(v) => eur(v)}
        />
        <Slider
          termKey="interest_rate"
          label="Zinssatz"
          value={rate}
          unit="%"
          min={1.5}
          max={6.5}
          step={0.1}
          onChange={setRate}
          formatter={(v) => v.toFixed(1) + '%'}
        />
        <Slider
          termKey="amortization"
          label="Tilgung"
          value={tilg}
          unit="%"
          min={1}
          max={5}
          step={0.5}
          onChange={setTilg}
          formatter={(v) => v.toFixed(1) + '%'}
        />
      </div>

      {units >= 2 && (
        <label className="flex items-center gap-2 mb-5 text-sm cursor-pointer p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
          <input
            type="checkbox"
            checked={houseHack}
            onChange={(e) => setHouseHack(e.target.checked)}
            className="w-4 h-4 accent-slate-900"
          />
          <span className="flex items-center gap-1">
            <strong><Term k="house_hacking">House Hacking</Term></strong> — eine Einheit selbst bewohnen, andere {units - 1} vermieten
          </span>
        </label>
      )}

      {/* Headline-Ergebnisse */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Stat
          termKey="annuity"
          label="Monatsrate"
          value={eur(result.monthlyRate)}
          hint={`${result.ltv.toFixed(0)}% LTV`}
        />
        <Stat
          termKey={houseHack ? 'house_hacking' : 'cashflow_after_tax'}
          label={houseHack ? 'Wohnkosten/Mo' : 'Cashflow/Mo'}
          value={houseHack ? eur(result.ownLivingCost) : eur(result.cashflowAfterTax)}
          accent={houseHack ? 'primary' : cfPositive ? 'positive' : 'negative'}
          hint={houseHack ? 'effektiv für dich' : 'nach Steuer'}
        />
        <Stat
          termKey="wealth_buildup"
          label="Vermögensaufbau/J"
          value={`+${eur(result.wealthBuildup)}`}
          accent="positive"
          hint="Tilgung + AfA-Vorteil"
        />
        <Stat
          termKey="break_even"
          label="Break-Even"
          value={result.breakEvenYears ? `${result.breakEvenYears} Jahre` : cfPositive ? 'sofort' : '—'}
          hint="ab dann CF positiv"
        />
      </div>

      {/* Details */}
      <details className="border-t border-slate-100 pt-4">
        <summary className="text-sm font-medium text-slate-700 cursor-pointer hover:text-slate-900">
          Details anzeigen
        </summary>
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-1 mt-3 text-sm">
          <Row label="Kaufpreis" value={eur(price)} />
          <Row label="Nebenkosten (10,57%)" value={eur(result.closingCosts)} />
          <Row label="Gesamtinvestition" value={eur(result.totalInvestment)} bold />
          <Row label="Darlehen" value={eur(result.loan)} bold />
          <Row label="Cashflow vor Steuer" value={eur(result.cashflowMonthly) + '/Mo'} />
          <Row label="Steuerersparnis" value={`+${eur(result.taxSavings)}/J`} className="text-emerald-700" />
          <Row label="Brutto-Rendite" value={result.bruttoYield.toFixed(2) + '%'} />
          <Row label="Netto-Rendite" value={result.nettoYield.toFixed(2) + '%'} bold />
        </div>
      </details>
    </div>
  )
}

function Slider({
  label,
  value,
  unit,
  min,
  max,
  step,
  onChange,
  formatter,
  termKey,
}: {
  label: string
  value: number
  unit: string
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  formatter: (v: number) => string
  termKey?: string
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
          {termKey ? <Term k={termKey}>{label}</Term> : label}
        </label>
        <span className="text-sm font-bold text-slate-900">{formatter(value)}</span>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full accent-slate-900 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
        <span>{unit === '€' ? eur(min) : min + unit}</span>
        <span>{unit === '€' ? eur(max) : max + unit}</span>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  hint,
  accent,
  termKey,
}: {
  label: string
  value: string
  hint?: string
  accent?: 'positive' | 'negative' | 'primary'
  termKey?: string
}) {
  const valCls =
    accent === 'positive'
      ? 'text-emerald-700'
      : accent === 'negative'
      ? 'text-rose-700'
      : 'text-slate-900'
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <div className="text-xs uppercase tracking-wide text-slate-500 font-medium flex items-center gap-1">
        {termKey ? <Term k={termKey}>{label}</Term> : label}
      </div>
      <div className={`text-lg font-bold mt-0.5 ${valCls}`}>{value}</div>
      {hint && <div className="text-xs text-slate-500 mt-0.5">{hint}</div>}
    </div>
  )
}

function Row({
  label,
  value,
  bold,
  className = '',
}: {
  label: string
  value: string
  bold?: boolean
  className?: string
}) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-slate-500">{label}</span>
      <span className={`${bold ? 'font-semibold' : ''} text-slate-900 ${className}`}>{value}</span>
    </div>
  )
}
