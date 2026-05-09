// Profi-Cashflow & Score-Berechnung
// Basierend auf der erprobten Logik aus dem statischen Tool

export type ScoringInput = {
  price: number
  living_area?: number | null
  annual_rent?: number | null
  units?: number | null
  year_built?: number | null
  city?: string | null
  is_rented?: boolean | null
}

export type ScoringResult = {
  price_per_sqm: number | null
  factor: number | null
  brutto_yield: number | null
  netto_yield: number | null
  monthly_rate: number
  cashflow_monthly: number
  score: number
  rating: 'A' | 'B' | 'C' | 'D'
  closing_costs: number
  total_investment: number
  market_benchmark: number
}

// Niedersachsen Kaufnebenkosten
const GRESt = 0.05 // Grunderwerbsteuer NDS
const NOTAR = 0.015
const GRUNDBUCH = 0.005
const MAKLER = 0.0357

// Finanzierung
const ZINSSATZ = 0.038
const TILGUNG = 0.02
const LAUFZEIT = 25

// Bewirtschaftung
const IH_RATE = 0.08         // 8% Instandhaltung der Kaltmiete
const VERWALTUNG = 0.05       // 5% Verwaltungskosten
const MIETAUSFALL = 0.03      // 3% Mietausfallrisiko
const VERSICHERUNG_PRO_QM = 0.5 // €/m²/Jahr Sachversicherung

// Marktdaten Zeven + Umkreis (kann später per ENV oder DB überschrieben werden)
const MARKET_PRICE_PER_SQM_DEFAULT = 2184 // Ø Häuser Zeven
const MARKET_RENT_PER_SQM = 8.69          // Mietspiegel Region

function annuity(loan: number, ratePct = ZINSSATZ, tilgPct = TILGUNG): number {
  // Monatliche Annuität (Zins + Tilgung)
  return (loan * (ratePct + tilgPct)) / 12
}

export function calcScoring(input: ScoringInput): ScoringResult {
  const price = input.price
  const area = input.living_area ?? 0
  const rent = input.annual_rent ?? 0

  // Nebenkosten + Gesamtinvestition
  const closing_costs = price * (GRESt + NOTAR + GRUNDBUCH + MAKLER)
  const total_investment = price + closing_costs

  // Kennzahlen
  const price_per_sqm = area > 0 ? price / area : null
  const factor = rent > 0 ? price / rent : null
  const brutto_yield = price > 0 && rent > 0 ? (rent / price) * 100 : null

  // Bewirtschaftungskosten / Jahr
  const ih = rent * IH_RATE
  const verwaltung = rent * VERWALTUNG
  const ausfall = rent * MIETAUSFALL
  const versicherung = (area || 0) * VERSICHERUNG_PRO_QM
  const bewirtschaftung_jahr = ih + verwaltung + ausfall + versicherung
  const netto_miete_jahr = Math.max(0, rent - bewirtschaftung_jahr)

  const netto_yield = price > 0 && rent > 0 ? (netto_miete_jahr / price) * 100 : null

  // Vollfinanzierung Annahme (Idris hat 0 EK)
  const monthly_rate = annuity(total_investment)
  const cashflow_monthly = (netto_miete_jahr / 12) - monthly_rate

  // Score 0-100
  let score = 50

  // Preis vs. Markt
  if (price_per_sqm) {
    const diff = (price_per_sqm - MARKET_PRICE_PER_SQM_DEFAULT) / MARKET_PRICE_PER_SQM_DEFAULT
    if (diff < -0.2) score += 20
    else if (diff < -0.1) score += 12
    else if (diff < 0) score += 6
    else if (diff > 0.15) score -= 12
    else if (diff > 0) score -= 4
  }

  // Cashflow
  if (cashflow_monthly > 200) score += 15
  else if (cashflow_monthly > 0) score += 10
  else if (cashflow_monthly > -200) score += 0
  else if (cashflow_monthly > -500) score -= 8
  else score -= 15

  // Mietfaktor
  if (factor) {
    if (factor < 12) score += 10
    else if (factor < 15) score += 5
    else if (factor > 22) score -= 10
  }

  // Mietpotential (Ist-Miete < Marktmiete = Upside)
  if (rent > 0 && area > 0) {
    const ist_miete_pro_qm = rent / 12 / area
    const upside = (MARKET_RENT_PER_SQM - ist_miete_pro_qm) / MARKET_RENT_PER_SQM
    if (upside > 0.2) score += 8
    else if (upside > 0.1) score += 4
  }

  // Vermietungs-Status (voll vermietet = +5)
  if (input.is_rented) score += 5

  // Baujahr (Risiko alte Substanz)
  if (input.year_built) {
    if (input.year_built < 1950) score -= 5
    else if (input.year_built > 2000) score += 3
  }

  score = Math.max(0, Math.min(100, Math.round(score)))

  let rating: 'A' | 'B' | 'C' | 'D'
  if (score >= 80) rating = 'A'
  else if (score >= 65) rating = 'B'
  else if (score >= 50) rating = 'C'
  else rating = 'D'

  return {
    price_per_sqm,
    factor,
    brutto_yield,
    netto_yield,
    monthly_rate,
    cashflow_monthly,
    score,
    rating,
    closing_costs,
    total_investment,
    market_benchmark: MARKET_PRICE_PER_SQM_DEFAULT,
  }
}
