// Minimal CSV parser — supports quoted fields with commas/newlines and "" escapes.
export function parseCSV(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  let i = 0
  // strip BOM
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)

  while (i < text.length) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue }
        inQuotes = false; i++; continue
      }
      field += c; i++; continue
    }
    if (c === '"') { inQuotes = true; i++; continue }
    if (c === ',') { row.push(field); field = ''; i++; continue }
    if (c === '\r') { i++; continue }
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue }
    field += c; i++
  }
  // last field
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row) }
  return rows.filter(r => r.length > 1 || (r.length === 1 && r[0] !== ''))
}

const REQUIRED_HEADERS = ['publication_number', 'title', 'abstract', 'link', 'notes']

export function parseCitationsCSV(text) {
  const rows = parseCSV(text)
  if (rows.length === 0) return { ok: false, error: 'הקובץ ריק', rows: [] }
  const header = rows[0].map(h => h.trim().toLowerCase())
  const missing = REQUIRED_HEADERS.filter(h => !header.includes(h))
  if (missing.length > 0) {
    return { ok: false, error: `חסרות כותרות: ${missing.join(', ')}`, rows: [] }
  }
  const idx = Object.fromEntries(REQUIRED_HEADERS.map(h => [h, header.indexOf(h)]))
  const errors = []
  const out = []
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (row.every(c => (c ?? '').trim() === '')) continue
    const pub = (row[idx.publication_number] ?? '').trim()
    const title = (row[idx.title] ?? '').trim()
    if (!pub && !title) {
      errors.push({ line: r + 1, message: 'חובה למלא לפחות מספר פרסום או כותרת' })
      continue
    }
    out.push({
      publicationNumber: pub,
      title: title,
      abstract: (row[idx.abstract] ?? '').trim(),
      link: (row[idx.link] ?? '').trim(),
      notes: (row[idx.notes] ?? '').trim()
    })
  }
  return { ok: true, rows: out, errors }
}

export function citationsToCSV(citations) {
  const esc = (v) => {
    const s = (v ?? '').toString()
    if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }
  const lines = [REQUIRED_HEADERS.join(',')]
  for (const c of citations) {
    lines.push([
      esc(c.publicationNumber), esc(c.title), esc(c.abstract), esc(c.link), esc(c.notes)
    ].join(','))
  }
  return lines.join('\n')
}

export const SAMPLE_CSV = `publication_number,title,abstract,link,notes
US10000000B2,Sample patent A,A short abstract about widget improvements.,https://patents.google.com/patent/US10000000B2,
EP1234567A1,Sample patent B,"Abstract with, comma and ""quotes"".",https://worldwide.espacenet.com/patent/search/family/EP1234567A1,relevant to claim 3
WO2020123456A1,Sample patent C,Background art on signal processing.,https://patentscope.wipo.int/WO2020123456A1,
`
