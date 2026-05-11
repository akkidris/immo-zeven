'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ObjectData = {
  id: string
  price?: number | null
  living_area?: number | null
  plot_area?: number | null
  units?: number | null
  rooms?: number | null
  year_built?: number | null
  annual_rent?: number | null
  is_rented?: boolean | null
  energy_kwh?: number | null
  user_notes?: string | null
}

export default function EditObjectForm({ object }: { object: ObjectData }) {
  const router = useRouter()
  const [form, setForm] = useState({
    price: object.price ?? '',
    living_area: object.living_area ?? '',
    plot_area: object.plot_area ?? '',
    units: object.units ?? '',
    rooms: object.rooms ?? '',
    year_built: object.year_built ?? '',
    annual_rent: object.annual_rent ?? '',
    is_rented: object.is_rented ?? false,
    energy_kwh: object.energy_kwh ?? '',
    user_notes: object.user_notes ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function save() {
    setSaving(true)
    setMsg(null)
    try {
      const payload: Record<string, unknown> = {}
      const numFields = ['price', 'living_area', 'plot_area', 'units', 'rooms', 'year_built', 'annual_rent', 'energy_kwh']
      for (const k of numFields) {
        const v = form[k as keyof typeof form]
        payload[k] = v === '' || v === null ? null : Number(v)
      }
      payload.is_rented = form.is_rented
      payload.user_notes = form.user_notes || null

      const res = await fetch(`/api/objects/${object.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setMsg({ type: 'error', text: data.error ?? 'Speichern fehlgeschlagen' })
      } else {
        setMsg({ type: 'success', text: 'Gespeichert — Werte neu berechnet' })
        router.refresh()
      }
    } catch (err) {
      setMsg({ type: 'error', text: err instanceof Error ? err.message : 'Fehler' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Input label="Kaufpreis (€)" type="number" value={form.price} onChange={(v) => setField('price', v)} />
        <Input label="Wohnfläche (m²)" type="number" value={form.living_area} onChange={(v) => setField('living_area', v)} />
        <Input label="Grundstück (m²)" type="number" value={form.plot_area} onChange={(v) => setField('plot_area', v)} />
        <Input label="Wohneinheiten" type="number" value={form.units} onChange={(v) => setField('units', v)} />
        <Input label="Zimmer" type="number" value={form.rooms} onChange={(v) => setField('rooms', v)} />
        <Input label="Baujahr" type="number" value={form.year_built} onChange={(v) => setField('year_built', v)} />
        <Input label="Jahres-Kaltmiete (€)" type="number" value={form.annual_rent} onChange={(v) => setField('annual_rent', v)} />
        <Input label="Energie (kWh/m²a)" type="number" value={form.energy_kwh} onChange={(v) => setField('energy_kwh', v)} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!form.is_rented}
          onChange={(e) => setField('is_rented', e.target.checked)}
          className="w-4 h-4 rounded border-slate-300"
        />
        Voll vermietet
      </label>
      <textarea
        value={form.user_notes}
        onChange={(e) => setField('user_notes', e.target.value)}
        placeholder="Eigene Notizen (Besichtigung, Verhandlungspunkte, etc.)"
        rows={3}
        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? 'Speichere…' : 'Speichern + neu berechnen'}
        </button>
        {msg && (
          <span className={`text-sm ${msg.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
            {msg.text}
          </span>
        )}
      </div>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string | number
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <label className="block">
      <span className="text-xs text-slate-500 font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
        step="any"
      />
    </label>
  )
}
