// ─── Normalization ────────────────────────────────────────────────────────────

export function normalizePatentNumber(raw) {
  return raw.trim().toUpperCase().replace(/\s+/g, '')
}

export function extractAuthority(patentNumber) {
  const m = (patentNumber || '').match(/^([A-Z]{2,3})/)
  return m ? m[1] : ''
}

// ─── Label helpers ────────────────────────────────────────────────────────────

const DIRECTION_LABELS = { backward: 'אחורה', forward: 'קדימה', family: 'משפחה' }
const SOURCE_LABELS    = { google_patents: 'Google Patents', epo: 'EPO', uspto: 'USPTO' }
const CONFIDENCE_LABELS = { high: 'גבוה', medium: 'בינוני', low: 'נמוך' }

export const directionLabel = d => DIRECTION_LABELS[d] || d
export const sourceLabel    = s => SOURCE_LABELS[s]    || s
export const confidenceLabel = c => CONFIDENCE_LABELS[c] || c

// ─── Date normalisation ───────────────────────────────────────────────────────

function normalizeDate(s) {
  if (!s) return ''
  const m1 = s.match(/\b(\d{4})-(\d{2})-(\d{2})\b/)
  if (m1) return `${m1[1]}-${m1[2]}-${m1[3]}`
  const m2 = s.match(/\b(\d{8})\b/)
  if (m2) return `${m2[0].slice(0,4)}-${m2[0].slice(4,6)}-${m2[0].slice(6,8)}`
  const m3 = s.match(/\b(20\d{2}|19\d{2})\b/)
  if (m3) return m3[1]
  return s.trim()
}

// ─── HTML → citations ─────────────────────────────────────────────────────────

// Collect ALL tables whose immediately-preceding H2/H3/H4/dt matches any include keyword
// but NOT any exclude keyword.
function findAllTablesForKeywords(doc, include, exclude = []) {
  const incLc = include.map(k => k.toLowerCase())
  const excLc = exclude.map(k => k.toLowerCase())
  const headings = doc.querySelectorAll('h2, h3, h4, dt, .section-title')
  const found = []
  for (const h of headings) {
    const text = h.textContent.toLowerCase().trim()
    if (!incLc.some(k => text.includes(k))) continue
    if (excLc.some(k => text.includes(k))) continue
    // Walk forward siblings to find the associated <table>
    let el = h.nextElementSibling
    for (let i = 0; i < 5 && el; i++) {
      if (el.tagName === 'TABLE') { found.push(el); break }
      const t = el.querySelector('table')
      if (t) { found.push(t); break }
      el = el.nextElementSibling
    }
  }
  return found
}

function rowToEntry(row, direction, sourcePatent, rowIndex) {
  const cells = row.querySelectorAll('td')
  if (cells.length < 1) return null

  // Patent number: prefer extracting from href (avoids "(en) *" noise in link text)
  const linkEl = cells[0].querySelector('a[href*="patent"]') || cells[0].querySelector('a')
  const rawHref = linkEl?.getAttribute('href') || ''
  const hrefMatch = rawHref.match(/\/patent\/([A-Z]{2,3}[\dA-Z]+[\dA-Z])/i)
  const rawNum = hrefMatch
    ? hrefMatch[1].toUpperCase()
    : (linkEl?.textContent || cells[0].textContent).trim().split(/\s/)[0].toUpperCase()
  // Must look like a real publication number: 2-3 letters then at least one digit
  if (!rawNum || rawNum.length < 4 || !/^[A-Z]{2,3}\d/i.test(rawNum)) return null

  // Build canonical URL
  const sourceUrl = rawHref.startsWith('http')
    ? rawHref
    : rawHref.startsWith('/')
      ? `https://patents.google.com${rawHref}`
      : `https://patents.google.com/patent/${rawNum}/en`

  // Google Patents column layout (confirmed by inspection):
  //   5-col: pub | priority_date | pub_date | assignee | title
  //   2-col: pub | pub_date   (Also Published As / family)
  let pubDate = '', assignee = '', title = ''
  if (cells.length >= 5) {
    pubDate  = cells[2]?.textContent.trim() || ''
    assignee = cells[3]?.textContent.trim() || ''
    title    = cells[4]?.textContent.trim() || ''
  } else if (cells.length >= 4) {
    pubDate  = cells[1]?.textContent.trim() || ''
    assignee = cells[2]?.textContent.trim() || ''
    title    = cells[3]?.textContent.trim() || ''
  } else if (cells.length >= 2) {
    pubDate = cells[1]?.textContent.trim() || ''
  }

  return {
    id: `${direction}_${rawNum}_${rowIndex}`,
    sourcePatent,
    citedPatent:     rawNum,
    direction,
    dataSource:      'google_patents',
    publicationDate: normalizeDate(pubDate),
    assignee:        assignee.replace(/\s+/g, ' ').trim(),
    title:           title.replace(/\s+/g, ' ').trim(),
    confidence:      'high',
    classification:  '',
    sourceUrl,
    authority:       extractAuthority(rawNum),
    selected:        false
  }
}

function parseTable(table, direction, sourcePatent) {
  if (!table) return []
  const results = []
  const rows = table.querySelectorAll('tr')
  for (let i = 1; i < rows.length; i++) {
    const entry = rowToEntry(rows[i], direction, sourcePatent, i)
    if (entry) results.push(entry)
  }
  return results
}

// Strategy: itemprop-based (schema.org Patent markup)
function parseItemprop(doc, sourcePatent) {
  const results = []
  const backItems = doc.querySelectorAll('[itemprop="citation"]')
  const fwdItems  = doc.querySelectorAll('[itemprop="citedBy"]')

  function itemToEntry(el, direction, idx) {
    const link = el.querySelector('a[href*="patent"]') || el.querySelector('a')
    if (!link) return null
    const rawNum = link.textContent.trim()
    if (!rawNum || rawNum.length < 4) return null
    const rawHref = link.getAttribute('href') || ''
    const sourceUrl = rawHref.startsWith('http') ? rawHref : `https://patents.google.com${rawHref}`
    return {
      id: `${direction}_${rawNum}_${idx}`,
      sourcePatent,
      citedPatent:     rawNum,
      direction,
      dataSource:      'google_patents',
      publicationDate: el.querySelector('[itemprop="datePublished"]')?.textContent.trim() || '',
      assignee:        el.querySelector('[itemprop="assigneeOriginal"],[itemprop="assignee"]')?.textContent.trim() || '',
      title:           el.querySelector('[itemprop="name"],[itemprop="title"]')?.textContent.trim() || '',
      confidence:      'high',
      classification:  '',
      sourceUrl,
      authority:       extractAuthority(rawNum),
      selected:        false
    }
  }

  backItems.forEach((el, i) => { const e = itemToEntry(el, 'backward', i); if (e) results.push(e) })
  fwdItems.forEach((el, i)  => { const e = itemToEntry(el, 'forward',  i); if (e) results.push(e) })
  return results
}

// Strategy: JSON-LD embedded in page
function parseJsonLd(doc, sourcePatent) {
  const results = []
  for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) {
    let data
    try { data = JSON.parse(script.textContent) } catch { continue }
    if (data['@type'] !== 'Patent') continue
    ;(data.citation || []).forEach((c, i) => {
      const num = c.publicationNumber || c.identifier || ''
      if (!num) return
      results.push({
        id: `backward_${num}_ld${i}`,
        sourcePatent, citedPatent: num, direction: 'backward',
        dataSource: 'google_patents',
        publicationDate: normalizeDate(c.datePublished || ''),
        assignee: (Array.isArray(c.assignee) ? c.assignee[0]?.name : c.assignee?.name) || '',
        title: c.name || '',
        confidence: 'high', classification: '', selected: false,
        sourceUrl: `https://patents.google.com/patent/${num}/en`,
        authority: extractAuthority(num)
      })
    })
    break
  }
  return results
}

// Strategy: look for all patent-number-like links on the page grouped by surrounding section
function parseFallbackLinks(doc, sourcePatent) {
  const patentLinkRe = /\/patent\/([A-Z]{2,3}\d[\dA-Z-]{3,})/i
  const results = []
  const seen = new Set()

  // Heuristic: group anchors by their nearest section heading
  const anchors = [...doc.querySelectorAll('a[href*="/patent/"]')]
  anchors.forEach((a, i) => {
    const m = a.getAttribute('href')?.match(patentLinkRe)
    if (!m) return
    const num = m[1].toUpperCase()
    if (seen.has(num) || num === sourcePatent) return
    seen.add(num)

    // Guess direction from surrounding heading text
    let direction = 'backward'
    const section = a.closest('section, [id*="cited"], [id*="Citation"], [class*="cited"]')
    const sectionText = section?.textContent?.toLowerCase() || a.closest('table')?.previousElementSibling?.textContent?.toLowerCase() || ''
    if (sectionText.includes('cited by') || sectionText.includes('referenced by')) direction = 'forward'
    else if (sectionText.includes('family')) direction = 'family'

    const row = a.closest('tr')
    const cells = row ? [...row.querySelectorAll('td')] : []

    results.push({
      id: `${direction}_${num}_fb${i}`,
      sourcePatent, citedPatent: num, direction,
      dataSource: 'google_patents',
      publicationDate: '',
      assignee: cells[4]?.textContent.trim() || cells[2]?.textContent.trim() || '',
      title:    cells[5]?.textContent.trim() || cells[3]?.textContent.trim() || a.textContent.trim(),
      confidence: 'low', classification: '', selected: false,
      sourceUrl: `https://patents.google.com${a.getAttribute('href')}`,
      authority: extractAuthority(num)
    })
  })
  return results
}

export function parseGooglePatentsHTML(html, sourcePatent) {
  const parser = new DOMParser()
  const doc    = parser.parseFromString(html, 'text/html')
  let citations = []

  // Strategy 1 – itemprop schema.org markup
  const byItemprop = parseItemprop(doc, sourcePatent)
  if (byItemprop.length > 0) {
    citations = byItemprop
  }

  // Strategy 2 – JSON-LD
  if (citations.length === 0) {
    citations = parseJsonLd(doc, sourcePatent)
  }

  // Strategy 3 – named section H2 tables (collect ALL matching sections, then combine)
  if (citations.length === 0) {
    // Backward: "Patent Citations (N)", "Citations (N)", "Family Cites Families (N)"
    // Exclude "Non-Patent Citations" which also contains "citations ("
    const backTables = findAllTablesForKeywords(doc,
      ['Patent Citations', 'Citations (', 'References Cited', 'Family Cites'],
      ['Non-Patent', 'Non Patent']
    )
    // Forward: "Cited By (N)" or "Families Citing this family"
    const fwdTables = findAllTablesForKeywords(doc,
      ['Cited By', 'Referenced by', 'Families Citing']
    )
    // Family: "Also Published As" (the published equivalents across jurisdictions)
    const famTables = findAllTablesForKeywords(doc,
      ['Also Published As', 'Patent Family']
    )

    citations = [
      ...backTables.flatMap((t, i) => parseTable(t, 'backward', sourcePatent)),
      ...fwdTables.flatMap((t, i)  => parseTable(t, 'forward',  sourcePatent)),
      ...famTables.flatMap((t, i)  => parseTable(t, 'family',   sourcePatent)),
    ]
  }

  // Strategy 4 – generic patent link scan
  if (citations.length === 0) {
    citations = parseFallbackLinks(doc, sourcePatent)
  }

  // Deduplicate
  const seen = new Set()
  return citations.filter(c => {
    const key = `${c.direction}:${c.citedPatent}`
    if (seen.has(key)) return false
    seen.add(key); return true
  })
}

// ─── Main async fetch ─────────────────────────────────────────────────────────

export async function fetchPatentCitations(patentNumber) {
  const normalized = normalizePatentNumber(patentNumber)

  try {
    const url = `/api/google-patents/patent/${encodeURIComponent(normalized)}/en`
    const res = await fetch(url, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    })

    if (!res.ok) {
      return {
        ok: false,
        error: `שגיאת שרת: ${res.status} ${res.statusText}. ודא שמספר הפטנט תקין.`,
        citations: [], patentNumber: normalized
      }
    }

    const html = await res.text()

    // Sanity-check: page must look like a Google Patents page
    if (!html.includes('patent') && !html.includes('Patent')) {
      return { ok: false, error: 'לא נמצא מידע לפטנט זה', citations: [], patentNumber: normalized }
    }

    const citations = parseGooglePatentsHTML(html, normalized)

    return {
      ok: true,
      citations,
      patentNumber: normalized,
      warning: citations.length === 0
        ? 'הדף נמצא אך לא זוהו ציטוטים (ייתכן שמבנה הדף שונה). נסה לפתוח את הדף ישירות ב-Google Patents.'
        : null
    }
  } catch (err) {
    const isNetwork = err instanceof TypeError
    return {
      ok: false,
      error: isNetwork
        ? 'שגיאת רשת. ודא שהאפליקציה רצה עם npm run dev (נדרש שרת proxy מקומי).'
        : `שגיאה: ${err.message}`,
      citations: [], patentNumber: normalized
    }
  }
}

// ─── CSV export ───────────────────────────────────────────────────────────────

const CSV_HEADERS = [
  'פטנט מקור', 'פטנט מצוטט/מצטט', 'כיוון', 'מקור נתונים',
  'רשות', 'תאריך פרסום', 'בעלים', 'כותרת', 'רמת אמון', 'סיווג', 'URL מקור'
]

function escCsv(v) {
  const s = String(v ?? '')
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function exportFetchedCitationsToCSV(citations) {
  const rows = citations.map(c => [
    c.sourcePatent, c.citedPatent,
    directionLabel(c.direction), sourceLabel(c.dataSource),
    c.authority || extractAuthority(c.citedPatent),
    c.publicationDate, c.assignee, c.title,
    confidenceLabel(c.confidence), c.classification, c.sourceUrl
  ].map(escCsv).join(','))
  return [CSV_HEADERS.join(','), ...rows].join('\r\n')
}

// ─── Convert to app citation format ──────────────────────────────────────────

export function toAppCitation(fc) {
  const notes = [
    fc.assignee        && `בעלים: ${fc.assignee}`,
    `כיוון: ${directionLabel(fc.direction)}`,
    `מקור: ${sourceLabel(fc.dataSource)}`,
    fc.publicationDate && `תאריך: ${fc.publicationDate}`
  ].filter(Boolean).join(' | ')

  return {
    publicationNumber: fc.citedPatent,
    title:    fc.title   || '',
    abstract: '',
    link:     fc.sourceUrl || '',
    notes,
    status:            'todo',
    subClassification: fc.classification || null
  }
}
