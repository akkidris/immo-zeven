// Globale User-Settings (localStorage) - kein Backend nötig
'use client'

import { useEffect, useState } from 'react'

export type UserSettings = {
  equity: number          // Eigenkapital in €
  interest_rate: number   // Zinssatz in %
  amortization_rate: number // Tilgung in %
  tax_rate: number        // Grenzsteuersatz in %
  vacancy_rate: number    // Mietausfallrisiko in %
  maintenance_rate: number // Instandhaltungsrate in % der Kaltmiete
  management_rate: number // Verwaltungskosten in % der Kaltmiete
}

export const DEFAULT_SETTINGS: UserSettings = {
  equity: 0,
  interest_rate: 3.8,
  amortization_rate: 2.0,
  tax_rate: 42,
  vacancy_rate: 3,
  maintenance_rate: 8,
  management_rate: 5,
}

const STORAGE_KEY = 'immo-agent-settings-v1'

export function loadSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    window.dispatchEvent(new CustomEvent('settings-changed'))
  } catch {
    // localStorage voll oder gesperrt
  }
}

export function useSettings(): [UserSettings, (s: UserSettings) => void] {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    setSettings(loadSettings())
    const handler = () => setSettings(loadSettings())
    window.addEventListener('settings-changed', handler)
    return () => window.removeEventListener('settings-changed', handler)
  }, [])

  const update = (s: UserSettings) => {
    setSettings(s)
    saveSettings(s)
  }

  return [settings, update]
}
