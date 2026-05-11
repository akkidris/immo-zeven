// Claude Haiku JSON-Extraktion aus HTML-Text v2
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export type Extracted = {
  title?: string | null
  description?: string | null
  city?: string | null
  postal_code?: string | null
  address?: string | null
  price?: number | null
  living_area?: number | null
  plot_area?: number | null
  units?: number | null
  rooms?: number | null
  year_built?: number | null
  year_renovated?: number | null
  last_major_renovation?: number | null
  energy_class?: string | null
  energy_kwh?: number | null
  heating_type?: string | null
  heating_year?: number | null
  annual_rent?: number | null
  warm_rent?: number | null
  is_rented?: boolean | null
  commercial_share?: number | null
  features?: string[] | null
  og_image?: string | null
  status_text?: string | null
}

const SYSTEM_PROMPT = `Du extrahierst Immobilien-Daten aus deutschem Web-Text.
Antworte ausschließlich mit gültigem JSON, kein Markdown, kein Text drumherum.

Felder (null wenn nicht eindeutig):
- title: Inserat-Titel (kurz, klar)
- description: 1-2 Sätze Zusammenfassung der Substanz/Lage
- city: Stadt/Ort
- postal_code: PLZ
- address: Straße + Hausnummer (falls genannt)
- price: Kaufpreis in Euro als reine Zahl
- living_area: Wohnfläche in m² als Zahl
- plot_area: Grundstücksfläche in m² als Zahl
- units: Anzahl Wohneinheiten als Zahl (bei MFH/ZFH)
- rooms: Gesamtzimmer als Zahl
- year_built: Baujahr als Zahl
- year_renovated: Jahr der letzten Sanierung/Modernisierung
- last_major_renovation: Jahr der letzten Kernsanierung
- energy_class: A+, A, B, C, D, E, F, G, H
- energy_kwh: Energiekennwert kWh/m²a als Zahl
- heating_type: z.B. "Gasheizung", "Ölheizung", "Wärmepumpe", "Fernwärme", "Pellet"
- heating_year: Jahr Heizung erneuert
- annual_rent: Jahres-NETTO-Kaltmiete in Euro (KEINE Warmmiete; rechne Monatsmiete × 12)
- warm_rent: Jahres-WARMMIETE in Euro (falls separat genannt)
- is_rented: true wenn voll vermietet, false wenn leer, null wenn unklar
- commercial_share: Anteil Gewerbe in % (0 wenn rein Wohnen)
- features: Array Kernfeatures (z.B. ["Balkon", "Garage", "Aufzug", "Garten", "Keller", "Kamin"])
- og_image: URL des Hauptbildes (aus og:image meta-tag, falls vorhanden)
- status_text: "verkauft" / "reserviert" / "anfragestop" / null

Beträge:
- "1.234.567,89 €" → 1234567.89
- "289 T€" oder "289.000" → 289000
- Monatsmiete genannt? × 12 = annual_rent

Antworte NUR mit dem JSON-Objekt.`

export async function extractFromText(text: string): Promise<Extracted> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Extrahiere Immobilien-Daten aus folgendem Text:\n\n${text}`,
      },
    ],
  })

  const textBlock = message.content.find((c) => c.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Keine Text-Antwort von Claude')
  }

  let jsonStr = textBlock.text.trim()

  jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')

  const match = jsonStr.match(/\{[\s\S]*\}/)
  if (match) jsonStr = match[0]

  try {
    return JSON.parse(jsonStr) as Extracted
  } catch (err) {
    throw new Error(
      `JSON-Parse fehlgeschlagen: ${err instanceof Error ? err.message : err}\nText: ${jsonStr.slice(0, 200)}`
    )
  }
}
