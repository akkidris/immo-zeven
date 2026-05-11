'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AnalyzeForm() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [pastedText, setPastedText] = useState('')
  const [pasteMode, setPasteMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorHint, setErrorHint] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    if (pasteMode && pastedText.trim().length < 100) {
      setError('Eingefügter Text zu kurz — mindestens 100 Zeichen')
      return
    }
    setLoading(true)
    setError(null)
    setErrorHint(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          ...(pasteMode && { pastedText: pastedText.trim() }),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Analyse fehlgeschlagen')
        setErrorHint(data.hint ?? null)
        if (data.error?.includes('blockt') || data.error?.includes('konnte nicht geladen')) {
          setPasteMode(true)
        }
      } else {
        setSuccess(
          `✓ Analysiert: ${data.object.title ?? data.object.url} — Score ${data.scoring.score}/100`
        )
        setUrl('')
        setPastedText('')
        setPasteMode(false)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Netzwerk-Fehler')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.immowelt.de/expose/... oder beliebige Exposé-URL"
          className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
          disabled={loading}
          required
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Analysiere…' : 'Analysieren'}
        </button>
      </div>

      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setPasteMode(!pasteMode)}
          className="text-sky-700 hover:text-sky-900 font-medium"
        >
          {pasteMode ? '↑ URL-Modus zurück' : '↓ URL geht nicht? Text einfügen statt automatisch laden'}
        </button>
        <span className="text-slate-400">
          {pasteMode ? 'Paste-Modus aktiv' : 'Auto-Fetch aktiv'}
        </span>
      </div>

      {pasteMode && (
        <div className="border border-sky-200 bg-sky-50/50 rounded-lg p-3 space-y-2">
          <p className="text-xs text-slate-700">
            <strong>So funktioniert&apos;s:</strong> Öffne das Inserat im Browser → klick irgendwo
            auf die Seite → <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs">⌘A</kbd> (alles markieren) →
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs ml-1">⌘C</kbd> (kopieren) →
            unten einfügen <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs ml-1">⌘V</kbd>.
            Die KI extrahiert die Daten aus dem Text — der Link wird trotzdem oben gespeichert.
          </p>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Hier den kompletten Exposé-Text aus dem Browser einfügen…"
            rows={6}
            className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            disabled={loading}
          />
          <div className="text-xs text-slate-500">
            {pastedText.length} Zeichen {pastedText.length > 0 && pastedText.length < 100 && '(mind. 100 nötig)'}
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg">
          <div className="text-rose-700 font-medium">{error}</div>
          {errorHint && <div className="text-rose-600 text-xs mt-1">{errorHint}</div>}
        </div>
      )}

      {success && (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
          {success}
        </div>
      )}

      <p className="text-xs text-slate-500">
        <strong>Auto-Fetch:</strong> Immowelt, Stegeberg, Grimberg, Sparkasse · <strong>Paste-Modus:</strong> ImmoScout24, Kleinanzeigen, jedes andere Portal.
      </p>
    </form>
  )
}
