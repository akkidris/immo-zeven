// Claude Haiku JSON-Extraktion aus HTML-Text
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
  energy_class?: string | null
  annual_rent?: number | null
  is_rented?: boolean | null
  status_text?: string | null  // "verkauft", "reserviert", "anfragestop", null
}

const SYSTEM_PROMPT = `Du extrahierst Immobilien-Daten aus deutschem Web-Text.
Antworte ausschließlich mit gültigem JSON, kein Markdown, kein Text drumherum.

Extrahiere diese Felder (null wenn nicht eindeutig):
- title: Inserat-Titel
- description: 1-2 Sätze Zusammenfassung
- city: Stadt/Ort
- postal_code: PLZ
- address: Straße + Hausnummer (falls genannt)
- price: Kaufpreis in Euro als Zahl (ohne Punkte/Komma/€)
- living_area: Wohnfläche in m² als Zahl
- plot_area: Grundstücksfläche in m² als Zahl
- units: Anzahl Wohneinheiten als Zahl (bei MFH/ZFH)
- rooms: Gesamtzimmer als Zahl
- year_built: Baujahr als Zahl
- year_renovated: Sanierungsjahr als Zahl (falls genannt)
- energy_class: Energieklasse (A+, A, B, ...)
- annual_rent: Jahres-NETTO-Kaltmiete in Euro (KEINE Warmmiete, KEINE Monatsmiete - umrechnen falls nötig)
- is_rented: true wenn voll vermietet, false wenn leer, null wenn unklar
- status_text: "verkauft" / "reserviert" / "anfragestop" wenn das Inserat sowas anzeigt, sonst null

Rechne Beträge sauber um: "1.234.567,89 €" → 1234567.89
Bei "289 T€" oder "289.000" → 289000

Antworte NUR mit dem JSON-Objekt.`

export async function extractFromText(text: string): Promise<Extracted> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
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

  // Markdown-Fences entfernen
  jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')

  // JSON-Objekt extrahieren wenn mit Text drumherum
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
