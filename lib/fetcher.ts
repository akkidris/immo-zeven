// Multi-Strategy HTML Fetcher
// Probiert mehrere Browser-Profile + Archive.org Fallback
import * as cheerio from 'cheerio'

type BrowserProfile = { name: string; headers: Record<string, string> }

const BROWSER_PROFILES: BrowserProfile[] = [
  {
    name: 'macos-safari',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    },
  },
  {
    name: 'win-chrome',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'sec-ch-ua': '"Chromium";v="132", "Not_A Brand";v="24", "Google Chrome";v="132"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Upgrade-Insecure-Requests': '1',
    },
  },
  {
    name: 'googlebot',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      Accept: 'text/html,application/xhtml+xml,*/*',
      'Accept-Language': 'de-DE,de;q=0.9',
    },
  },
]

export type FetchResult = {
  ok: boolean
  status: number
  html: string | null
  cleanText: string | null
  finalUrl: string
  contentType: string | null
  strategy: string
  attempts: Array<{ strategy: string; status: number }>
  error?: string
}

async function tryFetch(
  url: string,
  headers: Record<string, string>,
  timeoutMs: number
): Promise<{ ok: boolean; status: number; html: string | null; finalUrl: string; contentType: string | null }> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      headers,
      redirect: 'follow',
      signal: ctrl.signal,
    })
    const contentType = res.headers.get('content-type')
    const html = res.ok ? await res.text() : null

    const looksBlocked =
      html &&
      html.length < 2000 &&
      /captcha|access denied|forbidden|too many|cloudflare|robot challenge/i.test(html)

    return {
      ok: res.ok && !looksBlocked,
      status: looksBlocked ? 403 : res.status,
      html,
      finalUrl: res.url,
      contentType,
    }
  } finally {
    clearTimeout(t)
  }
}

export async function fetchUrl(url: string, timeoutMs = 20000): Promise<FetchResult> {
  const attempts: Array<{ strategy: string; status: number }> = []

  for (const profile of BROWSER_PROFILES) {
    try {
      const r = await tryFetch(url, profile.headers, timeoutMs)
      attempts.push({ strategy: profile.name, status: r.status })
      if (r.ok && r.html) {
        return {
          ok: true,
          status: r.status,
          html: r.html,
          cleanText: extractTextContent(r.html),
          finalUrl: r.finalUrl,
          contentType: r.contentType,
          strategy: profile.name,
          attempts,
        }
      }
    } catch (err) {
      attempts.push({ strategy: profile.name, status: 0 })
      void err
    }
  }

  // Archive.org Wayback Machine als letzter Fallback
  try {
    const waybackUrl = `https://web.archive.org/web/2025/${url}`
    const r = await tryFetch(waybackUrl, BROWSER_PROFILES[0].headers, timeoutMs)
    attempts.push({ strategy: 'wayback', status: r.status })
    if (r.ok && r.html) {
      return {
        ok: true,
        status: r.status,
        html: r.html,
        cleanText: extractTextContent(r.html),
        finalUrl: r.finalUrl,
        contentType: r.contentType,
        strategy: 'wayback',
        attempts,
      }
    }
  } catch (err) {
    attempts.push({ strategy: 'wayback', status: 0 })
    void err
  }

  const lastStatus = attempts[attempts.length - 1]?.status ?? 0
  return {
    ok: false,
    status: lastStatus,
    html: null,
    cleanText: null,
    finalUrl: url,
    contentType: null,
    strategy: 'none',
    attempts,
    error: `Alle ${attempts.length} Strategien fehlgeschlagen`,
  }
}

export function extractTextContent(html: string): string {
  const $ = cheerio.load(html)
  $('script, style, noscript, svg, iframe, link, meta').remove()

  const jsonLd: string[] = []
  $('script[type="application/ld+json"]').each((_, el) => {
    jsonLd.push($(el).html() || '')
  })

  const title = $('title').text().trim()
  const h1 = $('h1').first().text().trim()
  const ogDesc = $('meta[property="og:description"]').attr('content') || ''
  const description = $('meta[name="description"]').attr('content') || ''
  const ogImage = $('meta[property="og:image"]').attr('content') || ''

  const body = $('body').text().replace(/\s+/g, ' ').trim()
  const truncated = body.length > 30000 ? body.slice(0, 30000) : body

  return [
    title && `TITLE: ${title}`,
    h1 && `H1: ${h1}`,
    ogDesc && `OG_DESC: ${ogDesc}`,
    description && `META_DESC: ${description}`,
    ogImage && `OG_IMAGE: ${ogImage}`,
    jsonLd.length > 0 && `JSON_LD: ${jsonLd.join(' | ').slice(0, 5000)}`,
    `BODY: ${truncated}`,
  ]
    .filter(Boolean)
    .join('\n\n')
}

export function detectSource(url: string): string {
  try {
    const host = new URL(url).hostname.replace('www.', '')
    if (host.includes('immowelt')) return 'immowelt'
    if (host.includes('immobilienscout24')) return 'immoscout24'
    if (host.includes('immonet')) return 'immonet'
    if (host.includes('kleinanzeigen')) return 'kleinanzeigen'
    if (host.includes('stegeberg')) return 'stegeberg'
    if (host.includes('grimberg')) return 'grimberg'
    if (host.includes('sparkasse')) return 'sparkasse'
    if (host.includes('volksbank')) return 'volksbank'
    return host
  } catch {
    return 'unknown'
  }
}
