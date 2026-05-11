// Profi-Cashflow & Score-Berechnung v2
// Mit Finanzierungs-Szenarien, House Hacking, Sensitivity, AfA

export type ScoringInput = {
  price: number
  living_area?: number | null
  plot_area?: number | null
  annual_rent?: number | null
  warm_rent?: number | null
  units?: number | null
  year_built?: number | null
  city?: string | null
  is_rented?: boolean | null
  commercial_share?: number | null
  energy_kwh?: number | null
}

export type FinancingScenario = {
  equity: number
  loan: number
  loan_to_value: number
  monthly_rate: number
  cashflow_monthly: number
  cashflow_after_tax: number
  yearly_buildup: number
  breakeven_years: number | null
}

export type ScoringResult = {
  price_per_sqm: number | null
  factor: number | null
  brutto_yield: number | null
  netto_yield: number | null
  rent_per_sqm: number | null
  rent_upside_pct: number | null
  rent_upside_yearly: number | null
  closing_costs: number
  total_investment: number
  yearly_operating_costs: number
  yearly_net_rent: number
  afa_yearly: number
  tax_savings_yearly: number
  scenarios: FinancingScenario[]
  house_hacking: {
    rent_lost: number
    own_living_cost: number
    cashflow_monthly: number
  } | null
  sensitivity: {
    rent_minus_10: number
    rent_plus_10: number
    vacancy_extra: number
    rate_4_5: number
    rate_3_0: number
  }
  score: number
  rating: 'A' | 'B' | 'C' | 'D'
  pros: string[]
  cons: string[]
  verdict: 'KAUFEN' | 'PRÜFEN' | 'VERHANDELN' | 'ÜBERSPRINGEN'
  market_price_per_sqm: number
  market_rent_per_sqm: number
  price_vs_market_pct: number | null
  // Compat-Felder fürs alte Schema (werden in objects gespeichert)
  monthly_rate: number
  cashflow_monthly: number
}

// Niedersachsen Kaufnebenkosten
const GRESt = 0.05
const NOTAR = 0.015
const GRUNDBUCH = 0.005
const MAKLER = 0.0357

const ZINSSATZ = 0.038
const TILGUNG = 0.02

const IH_RATE = 0.08
const VERWALTUNG = 0.05
const MIETAUSFALL = 0.03
const VERSICHERUNG_PRO_QM = 0.5

const AFA_RATE = 0.02
const GEBAEUDE_ANTEIL = 0.8
const STEUERSATZ = 0.42

const MARKET_PRICE_PER_SQM = 2184
const MARKET_RENT_PER_SQM = 8.69

function annuity(loan: number, ratePct: number, tilgPct: number): number {
  return (loan * (ratePct + tilgPct)) / 12
}

function calcScenario(
  totalInvestment: number,
  netRentYearly: number,
  afaYearly: number,
  equity: number,
  rate = ZINSSATZ,
  tilg = TILGUNG
): FinancingScenario {
  const loan = Math.max(0, totalInvestment - equity)
  const monthlyRate = annuity(loan, rate, tilg)

  const yearlyInterest = loan * rate
  const yearlyTilgung = loan * tilg
  const cashflowYearly = netRentYearly - (yearlyInterest + yearlyTilgung)

  const taxableLoss = netRentYearly - yearlyInterest - afaYearly
  const taxSavings = taxableLoss < 0 ? Math.abs(taxableLoss) * STEUERSATZ : 0

  const cashflowAfterTax = (cashflowYearly + taxSavings) / 12

  const yearlyBuildup = yearlyTilgung + (afaYearly * STEUERSATZ)

  const cashflowMonthly = cashflowYearly / 12
  let breakeven: number | null = null
  if (cashflowMonthly < 0 && yearlyTilgung > 0) {
    const shiftPerYear = yearlyTilgung * rate
    breakeven = shiftPerYear > 0 ? Math.abs(cashflowYearly) / shiftPerYear : null
    breakeven = breakeven && breakeven > 0 && breakeven < 50 ? Math.round(breakeven) : null
  }

  return {
    equity,
    loan,
    loan_to_value: totalInvestment > 0 ? (loan / totalInvestment) * 100 : 0,
    monthly_rate: monthlyRate,
    cashflow_monthly: cashflowMonthly,
    cashflow_after_tax: cashflowAfterTax,
    yearly_buildup: yearlyBuildup,
    breakeven_years: breakeven,
  }
}

export function calcScoring(input: ScoringInput): ScoringResult {
  const price = input.price
  const area = input.living_area ?? 0
  const rent = input.annual_rent ?? 0
  const units = input.units ?? 1

  const closing_costs = price * (GRESt + NOTAR + GRUNDBUCH + MAKLER)
  const total_investment = price + closing_costs

  const price_per_sqm = area > 0 ? price / area : null
  const factor = rent > 0 ? price / rent : null
  const brutto_yield = price > 0 && rent > 0 ? (rent / price) * 100 : null
  const rent_per_sqm = rent > 0 && area > 0 ? rent / 12 / area : null

  let rent_upside_pct: number | null = null
  let rent_upside_yearly: number | null = null
  if (rent_per_sqm && rent_per_sqm < MARKET_RENT_PER_SQM) {
    rent_upside_pct = ((MARKET_RENT_PER_SQM - rent_per_sqm) / rent_per_sqm) * 100
    rent_upside_yearly = (MARKET_RENT_PER_SQM - rent_per_sqm) * area * 12
  }

  const ih = rent * IH_RATE
  const verwaltung = rent * VERWALTUNG
  const ausfall = rent * MIETAUSFALL
  const versicherung = area * VERSICHERUNG_PRO_QM
  const yearly_operating_costs = ih + verwaltung + ausfall + versicherung
  const yearly_net_rent = Math.max(0, rent - yearly_operating_costs)
  const netto_yield = price > 0 && rent > 0 ? (yearly_net_rent / price) * 100 : null

  const afa_yearly = price * GEBAEUDE_ANTEIL * AFA_RATE
  const tax_savings_yearly = afa_yearly * STEUERSATZ

  const scenarios: FinancingScenario[] = [
    calcScenario(total_investment, yearly_net_rent, afa_yearly, 0),
    calcScenario(total_investment, yearly_net_rent, afa_yearly, 25000),
    calcScenario(total_investment, yearly_net_rent, afa_yearly, 50000),
    calcScenario(total_investment, yearly_net_rent, afa_yearly, 100000),
  ]

  let house_hacking: ScoringResult['house_hacking'] = null
  if (units && units >= 2 && rent > 0 && area > 0) {
    const rent_per_unit = rent / units
    const rent_lost = rent_per_unit
    const reduced_rent = rent - rent_lost
    const reduced_net = Math.max(0, reduced_rent - yearly_operating_costs * (reduced_rent / rent))
    const baseRate = annuity(total_investment, ZINSSATZ, TILGUNG)
    const cashflow_monthly_hh = (reduced_net - baseRate * 12) / 12
    const own_share = 1 / units
    const yearlyInterest = total_investment * ZINSSATZ
    const taxableLoss = reduced_net - yearlyInterest * (1 - own_share) - afa_yearly * (1 - own_share)
    const taxSavingsHH = taxableLoss < 0 ? Math.abs(taxableLoss) * STEUERSATZ : 0
    const own_living_cost = -(cashflow_monthly_hh + taxSavingsHH / 12)

    house_hacking = {
      rent_lost,
      own_living_cost,
      cashflow_monthly: cashflow_monthly_hh,
    }
  }

  const baseRate = annuity(total_investment, ZINSSATZ, TILGUNG) * 12
  const sensitivity = {
    rent_minus_10: (yearly_net_rent * 0.9 - baseRate) / 12,
    rent_plus_10: (yearly_net_rent * 1.1 - baseRate) / 12,
    vacancy_extra: (Math.max(0, rent * 0.9 - yearly_operating_costs) - baseRate) / 12,
    rate_4_5: (yearly_net_rent - annuity(total_investment, 0.045, TILGUNG) * 12) / 12,
    rate_3_0: (yearly_net_rent - annuity(total_investment, 0.03, TILGUNG) * 12) / 12,
  }

  const price_vs_market_pct = price_per_sqm
    ? ((price_per_sqm - MARKET_PRICE_PER_SQM) / MARKET_PRICE_PER_SQM) * 100
    : null

  // Score
  let score = 50
  const pros: string[] = []
  const cons: string[] = []

  if (price_per_sqm && price_vs_market_pct !== null) {
    if (price_vs_market_pct < -20) {
      score += 20
      pros.push(`Preis ${Math.abs(price_vs_market_pct).toFixed(0)}% unter Markt`)
    } else if (price_vs_market_pct < -10) {
      score += 12
      pros.push(`Preis ${Math.abs(price_vs_market_pct).toFixed(0)}% unter Markt`)
    } else if (price_vs_market_pct < 0) {
      score += 6
    } else if (price_vs_market_pct > 15) {
      score -= 12
      cons.push(`Preis ${price_vs_market_pct.toFixed(0)}% über Markt`)
    } else if (price_vs_market_pct > 0) {
      score -= 4
    }
  }

  const cf0 = scenarios[0].cashflow_monthly
  if (cf0 > 200) {
    score += 15
    pros.push(`Cashflow positiv (${Math.round(cf0)}€/Mo bei 0€ EK)`)
  } else if (cf0 > 0) {
    score += 10
    pros.push(`Cashflow knapp positiv`)
  } else if (cf0 < -500) {
    score -= 15
    cons.push(`Cashflow stark negativ (${Math.round(cf0)}€/Mo bei 0€ EK)`)
  } else if (cf0 < -200) {
    score -= 8
    cons.push(`Cashflow negativ`)
  }

  if (factor !== null) {
    if (factor < 12) {
      score += 10
      pros.push(`Mietfaktor sehr gut (${factor.toFixed(1)}×)`)
    } else if (factor < 15) score += 5
    else if (factor > 22) {
      score -= 10
      cons.push(`Mietfaktor zu hoch (${factor.toFixed(1)}×)`)
    }
  }

  if (rent_upside_pct !== null && rent_upside_yearly !== null) {
    if (rent_upside_pct > 20) {
      score += 8
      pros.push(`Mietpotenzial +${rent_upside_pct.toFixed(0)}% (${Math.round(rent_upside_yearly)}€/Jahr)`)
    } else if (rent_upside_pct > 10) {
      score += 4
      pros.push(`Mietsteigerung möglich +${rent_upside_pct.toFixed(0)}%`)
    }
  }

  if (input.is_rented) {
    score += 5
    pros.push('Voll vermietet')
  }

  if (input.year_built) {
    if (input.year_built < 1950) {
      score -= 5
      cons.push(`Alte Substanz (Bj. ${input.year_built})`)
    } else if (input.year_built > 2000) {
      score += 3
      pros.push(`Neueres Baujahr (${input.year_built})`)
    }
  }

  if (units >= 3) {
    score += 3
    pros.push(`${units} Wohneinheiten`)
  }

  if (input.energy_kwh) {
    if (input.energy_kwh > 200) {
      score -= 5
      cons.push(`Schlechte Energiebilanz (${input.energy_kwh} kWh/m²a)`)
    } else if (input.energy_kwh < 100) {
      score += 3
      pros.push(`Gute Energiebilanz (${input.energy_kwh} kWh/m²a)`)
    }
  }

  // Wenn keine Mieteinnahmen → Risiko-Hinweis
  if (rent === 0) {
    cons.push('Keine Mieteinnahmen erkannt — entweder Eigennutzung oder Daten fehlen')
  }

  score = Math.max(0, Math.min(100, Math.round(score)))

  let rating: 'A' | 'B' | 'C' | 'D'
  if (score >= 80) rating = 'A'
  else if (score >= 65) rating = 'B'
  else if (score >= 50) rating = 'C'
  else rating = 'D'

  let verdict: 'KAUFEN' | 'PRÜFEN' | 'VERHANDELN' | 'ÜBERSPRINGEN'
  if (score >= 80 && cf0 > -100) verdict = 'KAUFEN'
  else if (score >= 65) verdict = 'PRÜFEN'
  else if (price_vs_market_pct !== null && price_vs_market_pct > 5) verdict = 'VERHANDELN'
  else verdict = 'ÜBERSPRINGEN'

  return {
    price_per_sqm,
    factor,
    brutto_yield,
    netto_yield,
    rent_per_sqm,
    rent_upside_pct,
    rent_upside_yearly,
    closing_costs,
    total_investment,
    yearly_operating_costs,
    yearly_net_rent,
    afa_yearly,
    tax_savings_yearly,
    scenarios,
    house_hacking,
    sensitivity,
    score,
    rating,
    pros,
    cons,
    verdict,
    market_price_per_sqm: MARKET_PRICE_PER_SQM,
    market_rent_per_sqm: MARKET_RENT_PER_SQM,
    price_vs_market_pct,
    // Compat fields
    monthly_rate: scenarios[0].monthly_rate,
    cashflow_monthly: scenarios[0].cashflow_monthly,
  }
}
