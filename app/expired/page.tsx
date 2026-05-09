import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function Expired() {
  const sb = supabaseAdmin()
  const { data: objects } = await sb
    .from('objects')
    .select('*')
    .in('status', ['expired', 'sold'])
    .order('expired_at', { ascending: false })
    .limit(100)

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
            ← Zurück
          </Link>
          <h1 className="font-semibold text-slate-900">Archiv</h1>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <p className="text-sm text-slate-500 mb-4">
          Inserate die nicht mehr verfügbar sind ({objects?.length ?? 0}).
        </p>
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {(!objects || objects.length === 0) && (
            <div className="p-6 text-sm text-slate-500">Noch keine archivierten Objekte.</div>
          )}
          {objects?.map((o) => (
            <Link
              key={o.id}
              href={`/objects/${o.id}`}
              className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
            >
              <div>
                <div className="font-medium text-slate-900">{o.title ?? o.url}</div>
                <div className="text-xs text-slate-500">
                  {o.city ?? ''} · {o.status}
                  {o.expired_at &&
                    ` · ${new Date(o.expired_at).toLocaleDateString('de-DE')}`}
                </div>
              </div>
              <div className="text-sm text-slate-700">
                {o.price
                  ? new Intl.NumberFormat('de-DE', {
                      style: 'currency',
                      currency: 'EUR',
                      maximumFractionDigits: 0,
                    }).format(o.price)
                  : '–'}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
