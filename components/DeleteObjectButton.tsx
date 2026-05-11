'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteObjectButton({ id }: { id: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function del() {
    if (!confirm('Objekt wirklich löschen? Alle Analysen + Verlauf werden mit gelöscht.')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/objects/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/')
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error ?? 'Löschen fehlgeschlagen')
        setBusy(false)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fehler')
      setBusy(false)
    }
  }

  return (
    <button
      onClick={del}
      disabled={busy}
      className="text-xs text-rose-600 hover:text-rose-800 font-medium disabled:opacity-50"
    >
      {busy ? '…' : 'Löschen'}
    </button>
  )
}
