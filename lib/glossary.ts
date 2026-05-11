// Zentrales Glossar - alle Fachbegriffe + Erklärungen
// Wird vom <Term> Component und auf der /help-Seite verwendet

export type GlossaryEntry = {
  short?: string         // Abkürzung
  title: string          // Volle Bezeichnung
  description: string    // Erklärung in einfachem Deutsch
  formula?: string       // Optionale Formel
  example?: string       // Optionales Beispiel
}

export const glossary: Record<string, GlossaryEntry> = {
  cashflow: {
    title: 'Cashflow',
    description: 'Was am Ende des Monats wirklich übrig bleibt nach allen Kosten — also Mieteinnahmen minus Bewirtschaftung minus Kreditrate. Positiv = du verdienst Geld, negativ = du musst draufzahlen.',
    example: 'Miete 2.200€ − Kosten 400€ − Kreditrate 1.700€ = +100€ Cashflow',
  },
  cashflow_after_tax: {
    title: 'Cashflow nach Steuer',
    description: 'Cashflow nach Verrechnung des steuerlichen Verlustes. Bei negativem Cashflow kannst du den Verlust mit deinem Gehalt verrechnen — das Finanzamt zahlt einen Teil zurück.',
    formula: 'Cashflow + (Verlust × Grenzsteuersatz)',
  },
  ltv: {
    short: 'LTV',
    title: 'Loan-to-Value (Beleihungsauslauf)',
    description: 'Wie viel Prozent vom Kaufpreis (inkl. Nebenkosten) per Kredit finanziert sind. 100% LTV = komplett finanziert ohne Eigenkapital. Banken finanzieren bei guter Bonität bis 110%, schwierige Fälle nur bis 80%.',
    formula: 'Darlehen / Gesamtinvestition × 100',
  },
  afa: {
    short: 'AfA',
    title: 'Absetzung für Abnutzung',
    description: 'Steuerlicher Abschreibungs-Vorteil. Du darfst 2% vom Gebäudewert (~80% des Kaufpreises) jährlich von der Steuer absetzen. Spart bei 42% Grenzsteuersatz ca. 0,67% des Kaufpreises pro Jahr — ist quasi "geschenktes" Geld vom Finanzamt.',
    formula: '2% × (Kaufpreis × 80%) × Grenzsteuersatz',
    example: 'Bei 300.000€ Kauf: 4.800€ AfA × 42% Steuer = 2.016€ Steuerersparnis/Jahr',
  },
  annuity: {
    title: 'Annuität (Monatsrate)',
    description: 'Was du pro Monat an die Bank überweist. Setzt sich zusammen aus Zins (kostet wirklich) + Tilgung (zahlst dein Schulden ab, baut Vermögen auf).',
    formula: 'Darlehen × (Zinssatz% + Tilgung%) / 12',
  },
  amortization: {
    title: 'Tilgung',
    description: 'Der Teil deiner Monatsrate der wirklich das Darlehen abzahlt — also Schuldenabbau. Höhere Tilgung = höhere Rate, aber schneller schuldenfrei. Standard ist 2% jährliche Anfangstilgung.',
    example: 'Bei 300k Darlehen + 2% Tilgung: 6.000€/Jahr werden Schulden abgebaut',
  },
  interest_rate: {
    title: 'Zinssatz',
    description: 'Was die Bank für das Darlehen verlangt — pro Jahr in % vom Restdarlehen. Aktuell (2026) realistisch 3,5-4,5% bei normaler Bonität, höher bei Schufa-Einträgen oder ohne Eigenkapital.',
  },
  factor: {
    title: 'Mietfaktor (Bruttomultiplikator)',
    description: 'Wie viele Jahresmieten kostet das Objekt? Niedrig = günstig, hoch = teuer. Faustregel: < 15 sehr gut, 15-20 normal, > 22 teuer. In München sind 35 üblich, in Zeven solltest du < 18 anpeilen.',
    formula: 'Kaufpreis / Jahres-Kaltmiete',
    example: 'Kaufpreis 300k / Jahresmiete 20k = Faktor 15×',
  },
  brutto_yield: {
    title: 'Brutto-Rendite',
    description: 'Wie viel Prozent Rendite vor Kosten — nur Miete durch Kaufpreis. Ist eine schnelle Vergleichszahl, aber unrealistisch da Bewirtschaftung nicht abgezogen.',
    formula: 'Jahres-Kaltmiete / Kaufpreis × 100',
  },
  netto_yield: {
    title: 'Netto-Rendite',
    description: 'Realistische Rendite nach Abzug aller laufenden Kosten (IH, Verwaltung, Mietausfall, Versicherung) — aber vor Finanzierung und Steuer. Faustregel: > 5% gut, > 6% sehr gut für Zeven-Markt.',
    formula: '(Jahres-Kaltmiete − Bewirtschaftung) / Kaufpreis × 100',
  },
  price_per_sqm: {
    title: 'Preis pro Quadratmeter',
    description: 'Kaufpreis geteilt durch Wohnfläche — wichtigste Vergleichszahl mit dem Markt. Ø Zeven liegt aktuell bei 2.184 €/m². Unter 1.800€ entweder Schnäppchen oder Renovierungsstau.',
    formula: 'Kaufpreis / Wohnfläche',
  },
  rent_per_sqm: {
    title: 'Miete pro Quadratmeter',
    description: 'Monats-Kaltmiete geteilt durch Wohnfläche. Markt-Mietspiegel Zeven: 8,69 €/m². Wenn IST-Miete deutlich darunter → Mietsteigerungspotenzial bei Mieterwechsel.',
    formula: 'Monatsmiete / Wohnfläche',
  },
  rent_upside: {
    title: 'Mietsteigerungspotenzial',
    description: 'Differenz zwischen aktueller Miete und Marktmiete — also was du theoretisch mehr verdienen könntest. Realisierbar bei Mieterwechsel oder Modernisierung. Bestandsmieten liegen oft 20-30% unter Markt.',
    formula: '(Marktmiete − IST-Miete) × Wohnfläche × 12',
  },
  closing_costs: {
    title: 'Kaufnebenkosten',
    description: 'Einmalige Kosten zusätzlich zum Kaufpreis. In Niedersachsen 10,57% gesamt: 5% Grunderwerbsteuer + 1,5% Notar + 0,5% Grundbuch + 3,57% Makler.',
    example: 'Bei 300k Kaufpreis: 31.700€ Nebenkosten on top',
  },
  total_investment: {
    title: 'Gesamtinvestition',
    description: 'Was das Objekt dich wirklich kostet — Kaufpreis plus alle Nebenkosten. Diese Summe muss finanziert werden (entweder Eigenkapital oder Darlehen).',
    formula: 'Kaufpreis + Kaufnebenkosten',
  },
  equity: {
    title: 'Eigenkapital',
    description: 'Cash das du selbst beim Kauf einbringst. Senkt das Darlehen und damit die monatliche Rate. 20% Eigenkapital ist Standard, 0% (Vollfinanzierung) ist möglich aber teurer (höherer Zinssatz).',
  },
  vacancy_rate: {
    title: 'Mietausfallrisiko',
    description: 'Pufferreserve für Leerstand oder Zahlungsausfall. Üblich sind 3% der Jahresmiete. Bei A-Lagen niedriger, bei strukturschwachen Regionen höher.',
  },
  maintenance: {
    short: 'IH',
    title: 'Instandhaltung',
    description: 'Rücklage für Reparaturen, Renovierungen, Modernisierungen. Üblich sind 8% der Jahres-Kaltmiete. Alte Substanz braucht mehr (10-15%), Neubau weniger (3-5%).',
  },
  management_cost: {
    title: 'Verwaltungskosten',
    description: 'Kosten für die Hausverwaltung (Mieterwechsel, Nebenkosten-Abrechnungen, Kommunikation). Üblich 5% der Jahresmiete. Wenn du selbst verwaltest: 0%, aber Zeit-Investment.',
  },
  cold_rent: {
    title: 'Kaltmiete',
    description: 'Reine Miete für die Wohnfläche, OHNE Nebenkosten (Heizung, Wasser, Müll, etc.). Wird auch "Nettokaltmiete" oder "NKM" genannt. Das ist die relevante Zahl für deine Renditerechnung.',
  },
  warm_rent: {
    title: 'Warmmiete',
    description: 'Kaltmiete PLUS umlagefähige Nebenkosten (Heizung, Hauswart, etc). Was der Mieter monatlich überweist. NICHT für Renditerechnung nehmen — Nebenkosten reichst du nur durch, das ist kein Profit.',
  },
  tax_rate: {
    title: 'Grenzsteuersatz',
    description: 'Dein persönlicher Steuersatz auf das letzte verdiente Euro. Mit 3.000€ netto im Monat ca. 30-35%, mit hohem Einkommen bis 42% (Spitzensteuersatz) oder 45% (Reichensteuer). Wichtig für AfA-Vorteil und Verlustverrechnung.',
  },
  wealth_buildup: {
    title: 'Vermögensaufbau',
    description: 'Was du wirklich pro Jahr an Vermögen aufbaust — auch wenn der Cashflow negativ ist. Setzt sich zusammen aus Tilgung (Schuldenabbau) plus Steuervorteil durch AfA.',
    formula: 'Tilgung + (AfA × Grenzsteuersatz)',
  },
  break_even: {
    title: 'Break-Even Jahre',
    description: 'Ab wann der Cashflow positiv wird. Mit jedem Jahr sinkt der Zinsanteil (Darlehen schrumpft), die Tilgung steigt. Irgendwann kippt das ins Plus.',
  },
  house_hacking: {
    title: 'House Hacking',
    description: 'Strategie: Mehrfamilienhaus kaufen, eine Einheit selbst bewohnen, andere vermieten. Vorteil: die Mieter zahlen quasi deine Rate ab. Oft günstiger als gleichwertig zu mieten.',
  },
  verdict: {
    title: 'Verdict',
    description: 'Klare Handlungsempfehlung. KAUFEN = Score ≥80 und CF okay. PRÜFEN = Score ≥65, Details checken. VERHANDELN = Preis über Markt, mit Rabatt könnte es klappen. ÜBERSPRINGEN = lieber weitersuchen.',
  },
  score: {
    title: 'Score 0-100',
    description: 'Gesamtbewertung. Bewertet Preis vs. Markt, Cashflow, Mietfaktor, Mietsteigerungs-Potenzial, Vermietungsstatus, Baujahr, Energie. A ≥80, B ≥65, C ≥50, D <50.',
  },
  sensitivity: {
    title: 'Sensitivity-Analyse',
    description: 'Stress-Test: was passiert wenn sich Annahmen ändern? Was wenn Miete -10%? Was wenn Zins auf 4,5% steigt? Zeigt wie robust dein Cashflow gegen externe Schocks ist.',
  },
  energy_kwh: {
    title: 'Energiekennwert (kWh/m²a)',
    description: 'Energieverbrauch pro Quadratmeter und Jahr. < 100 = sehr effizient, 100-150 = normal, > 200 = sanierungsbedürftig. Bei schlechtem Wert: 70.000€ Sanierungs-Risiko einplanen.',
  },
  energy_class: {
    title: 'Energieklasse',
    description: 'Bewertung A+ bis H. A+/A = Neubau-Standard, B-D = okay, E-H = Sanierungs-Pflicht-Risiko bei Verkauf (gesetzliche Änderungen geplant).',
  },
  units: {
    title: 'Wohneinheiten',
    description: 'Anzahl getrennter Wohnungen im Gebäude. Mehr = mehr Mietparteien = bessere Risikoverteilung (bei Leerstand fällt nicht alles aus). Ab 3 Einheiten wird es zu einem Mehrfamilienhaus (MFH).',
  },
  gerst: {
    short: 'GrESt',
    title: 'Grunderwerbsteuer',
    description: 'Einmalige Steuer beim Hauskauf. In Niedersachsen 5% vom Kaufpreis. Zahlbar einige Wochen nach Notartermin.',
  },
}

export function findTerm(key: string): GlossaryEntry | null {
  return glossary[key.toLowerCase()] ?? null
}
