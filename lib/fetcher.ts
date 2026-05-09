// HTML mit Browser-Headers fetchen (umgeht teilweise Bot-Schutz)
import * as cheerio from 'cheerio'

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  'Accept':
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
}

export type FetchResult = {
  ok: boolean
  status: number
  html: string | null
  cleanText: string | null
  finalUrl: string
  contentType: string | null
  error?: string
}

export async function fetchUrl(url: string, timeoutMs = 15000): Promise<FetchResult> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      headers: DEFAULT_HEADERS,
      redirect: 'follow',
      signal: ctrl.signal,
    })
    const contentType = res.headers.get('content-type')
    const html = res.ok ? await res.text() : null
    const cleanText = html ? extractTextContent(html) : null

    return {
      ok: res.ok,
      status: res.status,
      html,
      cleanText,
      finalUrl: res.url,
      contentType,
    }
  } catch (err) {
    return {
      ok: false,
      status: 0,
      html: null,
      cleanText: null,
      finalUrl: url,
      contentType: null,
      error: err instanceof Error ? err.message : String(err),
    }
  } finally {
    clearTimeout(t)
  }
}

// Reduziert HTML auf relevanten Text (spart Tokens für Claude)
export function extractTextContent(html: string): string {
  const $ = cheerio.load(html)
  $('script, style, noscript, svg, iframe, link, meta').remove()

  // Pflicht-Felder zuerst (oft als JSON-LD oder semantische Tags)
  const jsonLd: string[] = []
  $('script[type="application/ld+json"]').each((_, el) => {
    jsonLd.push($(el).html() || '')
  })

  const title = $('title').text().trim()
  const h1 = $('h1').first().text().trim()
  const ogDesc = $('meta[property="og:description"]').attr('content') || ''
  const description = $('meta[name="description"]').attr('content') || ''

  const body = $('body').text().replace(/\s+/g, ' ').trim()

  const truncated = body.length > 30000 ? body.slice(0, 30000) : body

  return [
    title && `TITLE: ${title}`,
    h1 && `H1: ${h1}`,
    ogDesc && `OG: ${ogDesc}`,
    description && `META: ${description}`,
    jsonLd.length > 0 && `JSON-LD: ${jsonLd.join(' | ').slice(0, 5000)}`,
    `BODY: ${truncated}`,
  ]
    .filter(Boolean)
    .join('\n\n')
}

// Quelle aus URL erkennen
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
