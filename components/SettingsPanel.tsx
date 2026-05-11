'use client'

import { useState } from 'react'
import { useSettings, DEFAULT_SETTINGS } from '@/lib/settings'

export default function SettingsPanel() {
  const [settings, setSettings] = useSettings()
  const [open, setOpen] = useState(false)

  function update<K extends keyof typeof settings>(key: K, value: number) {
    setSettings({ ...settings, [key]: value })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-slate-700 hover:text-slate-900 text-sm font-medium flex items-center gap-1"
        title="Deine Standardwerte für alle Berechnungen"
      >
        ⚙️ Profil
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">Dein Finanzierungs-Profil</h2>
                <p className="text-xs text-slate-500 mt-0.5">Wird für alle Cashflow-Berechnungen verwendet</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-900 text-2xl leading-none">×</button>
            </div>

            <div className="p-5 space-y-5">
              <Field
                label="Eigenkapital"
                hint="Cash für Anzahlung + Nebenkosten"
                value={settings.equity}
                unit="€"
                min={0}
                max={500000}
                step={5000}
                onChange={(v) => update('equity', v)}
              />
              <Field
                label="Zinssatz"
                hint="Bauzins deiner Bank — frag bei Sparkasse/Volksbank"
                value={settings.interest_rate}
                unit="%"
                min={1}
                max={7}
                step={0.1}
                onChange={(v) => update('interest_rate', v)}
              />
              <Field
                label="Tilgung"
                hint="Anfangstilgung — höher = schneller schuldenfrei, aber höhere Rate"
                value={settings.amortization_rate}
                unit="%"
                min={1}
                max={5}
                step={0.5}
                onChange={(v) => update('amortization_rate', v)}
              />
              <Field
                label="Grenzsteuersatz"
                hint="Dein persönlicher Steuersatz (mit 3000€ netto ca. 30-35%, Spitze 42%)"
                value={settings.tax_rate}
                unit="%"
                min={0}
                max={45}
                step={1}
                onChange={(v) => update('tax_rate', v)}
              />

              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs font-medium text-slate-700 mb-3">Bewirtschaftung (Standard übernehmen wenn unsicher)</p>
                <div className="space-y-4">
                  <Field
                    label="Instandhaltung"
                    hint="% der Jahresmiete für Reparaturen + Rücklage"
                    value={settings.maintenance_rate}
                    unit="%"
                    min={3}
                    max={15}
                    step={1}
                    onChange={(v) => update('maintenance_rate', v)}
                  />
                  <Field
                    label="Verwaltung"
                    hint="% der Jahresmiete (Hausverwaltung, selbst = 0%)"
                    value={settings.management_rate}
                    unit="%"
                    min={0}
                    max={10}
                    step={1}
                    onChange={(v) => update('management_rate', v)}
                  />
                  <Field
                    label="Mietausfallrisiko"
                    hint="% Pufferreserve für Leerstand/Zahlungsausfall"
                    value={settings.vacancy_rate}
                    unit="%"
                    min={0}
                    max={10}
                    step={1}
                    onChange={(v) => update('vacancy_rate', v)}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setSettings(DEFAULT_SETTINGS)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  Auf Standard zurücksetzen
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="ml-auto px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800"
                >
                  Fertig
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Field({
  label,
  hint,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  hint?: string
  value: number
  unit: string
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <label className="text-sm font-medium text-slate-900">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            min={min}
            max={max}
            step={step}
            className="w-24 px-2 py-1 text-sm text-right border border-slate-300 rounded"
          />
          <span className="text-sm text-slate-500 w-4">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full accent-slate-900"
      />
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  )
}
