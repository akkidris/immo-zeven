'use client'

import { useEffect, useRef, useState } from 'react'
import { findTerm } from '@/lib/glossary'

type Props = {
  k: string                  // Glossar-Key
  children?: React.ReactNode // Optional eigenes Label, sonst Auto
}

/**
 * <Term k="ltv">LTV</Term>
 * → zeigt "LTV ⓘ", on click popover mit Erklärung
 */
export default function Term({ k, children }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const entry = findTerm(k)

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  if (!entry) {
    // Fallback: zeige nur das Label, kein Tooltip
    return <span>{children ?? k}</span>
  }

  return (
    <span ref={ref} className="relative inline-flex items-center gap-0.5">
      <span>{children ?? entry.short ?? entry.title}</span>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(!open)
        }}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900 text-[10px] font-bold leading-none shrink-0 transition"
        title="Was bedeutet das?"
        aria-label={`Erklärung zu ${entry.title}`}
      >
        ?
      </button>
      {open && (
        <span
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 max-w-[90vw] bg-slate-900 text-white text-xs rounded-lg shadow-xl p-3 normal-case"
          style={{ fontWeight: 400 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="font-semibold mb-1">{entry.title}</div>
          <div className="text-slate-200 leading-relaxed">{entry.description}</div>
          {entry.formula && (
            <div className="mt-2 pt-2 border-t border-slate-700">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">Formel</div>
              <code className="text-slate-200 text-[11px] font-mono">{entry.formula}</code>
            </div>
          )}
          {entry.example && (
            <div className="mt-2 pt-2 border-t border-slate-700">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">Beispiel</div>
              <div className="text-slate-200">{entry.example}</div>
            </div>
          )}
          <span
            className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 -mt-1"
          />
        </span>
      )}
    </span>
  )
}
