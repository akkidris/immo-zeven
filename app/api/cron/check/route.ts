// Täglicher Cron: pingt alle aktiven URLs, markiert tote als expired
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const maxDuration = 300 // 5 Min
export const runtime = 'nodejs'

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
  Accept: 'text/html,*/*',
  'Accept-Language': 'de-DE,de;q=0.9',
}

async function checkUrl(url: string): Promise<{ alive: boolean; status: number }> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 12000)
  try {
    // HEAD first (schneller). Manche Server unterstützen das nicht → fallback GET
    let res = await fetch(url, { method: 'HEAD', headers: HEADERS, signal: ctrl.signal, redirect: 'follow' })
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, { method: 'GET', headers: HEADERS, signal: ctrl.signal, redirect: 'follow' })
    }
    const alive = res.status >= 200 && res.status < 400
    return { alive, status: res.status }
  } catch {
    return { alive: false, status: 0 }
  } finally {
    clearTimeout(t)
  }
}

export async function GET(req: NextRequest) {
  // Vercel Cron Auth
  const auth = req.headers.get('authorization')
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const sb = supabaseAdmin()
  const { data: objects, error } = await sb
    .from('objects')
    .select('id, url, status')
    .in('status', ['active', 'reserved'])
    .order('last_checked_at', { ascending: true, nullsFirst: true })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const results = await Promise.allSettled(
    (objects ?? []).map(async (o) => {
      const r = await checkUrl(o.url)
      await sb.from('check_history').insert({
        object_id: o.id,
        status_code: r.status,
        is_alive: r.alive,
      })

      const updates: Record<string, unknown> = {
        last_checked_at: new Date().toISOString(),
      }
      if (!r.alive) {
        updates.status = 'expired'
        updates.expired_at = new Date().toISOString()
      }
      await sb.from('objects').update(updates).eq('id', o.id)

      return { id: o.id, url: o.url, alive: r.alive, status: r.status }
    })
  )

  const summary = {
    total: results.length,
    alive: results.filter((r) => r.status === 'fulfilled' && r.value.alive).length,
    expired: results.filter((r) => r.status === 'fulfilled' && !r.value.alive).length,
  }

  return NextResponse.json({ summary, results: results.map((r) => (r.status === 'fulfilled' ? r.value : null)) })
}
