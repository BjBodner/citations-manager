import { useState, useMemo } from 'react'
import {
  fetchPatentCitations,
  exportFetchedCitationsToCSV,
  toAppCitation,
  normalizePatentNumber,
  directionLabel,
  sourceLabel,
  confidenceLabel
} from '../utils/patentApis.js'

const DIRECTION_FILTER_OPTIONS = [
  { value: '',         label: 'כל הכיוונים' },
  { value: 'backward', label: 'אחורה (ציטוטי מקור)' },
  { value: 'forward',  label: 'קדימה (מצטטים)' },
  { value: 'family',   label: 'משפחת פטנטים' }
]

const DIRECTION_COLORS = {
  backward: 'dir-backward',
  forward:  'dir-forward',
  family:   'dir-family'
}

export default function PatentFetcher({ activeBoard, onImport }) {
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState(null)
  const [citations, setCitations] = useState([])

  // Filters
  const [filterDir, setFilterDir]     = useState('')
  const [filterAuth, setFilterAuth]   = useState('')
  const [filterSrc, setFilterSrc]     = useState('')

  // Selection
  const [selected, setSelected] = useState(new Set())

  // ── Fetch ────────────────────────────────────────────────────────────────

  async function handleFetch() {
    const trimmed = input.trim()
    if (!trimmed) return
    setLoading(true)
    setResult(null)
    setCitations([])
    setSelected(new Set())
    setFilterDir('')
    setFilterAuth('')
    setFilterSrc('')

    const res = await fetchPatentCitations(trimmed)
    setResult(res)
    if (res.ok) setCitations(res.citations)
    setLoading(false)
  }

  // ── Derived data ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => citations.filter(c => {
    if (filterDir  && c.direction  !== filterDir)  return false
    if (filterAuth && c.authority  !== filterAuth)  return false
    if (filterSrc  && c.dataSource !== filterSrc)   return false
    return true
  }), [citations, filterDir, filterAuth, filterSrc])

  const authorities = useMemo(
    () => [...new Set(citations.map(c => c.authority).filter(Boolean))].sort(),
    [citations]
  )
  const sources = useMemo(
    () => [...new Set(citations.map(c => c.dataSource).filter(Boolean))],
    [citations]
  )

  const directionCounts = useMemo(() => {
    const map = { backward: 0, forward: 0, family: 0 }
    citations.forEach(c => { if (map[c.direction] !== undefined) map[c.direction]++ })
    return map
  }, [citations])

  // Selected count relative to current filter
  const selectedInView = useMemo(
    () => filtered.filter(c => selected.has(c.id)).length,
    [filtered, selected]
  )

  // ── Selection helpers ────────────────────────────────────────────────────

  function toggleOne(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selectedInView === filtered.length && filtered.length > 0) {
      setSelected(prev => {
        const next = new Set(prev)
        filtered.forEach(c => next.delete(c.id))
        return next
      })
    } else {
      setSelected(prev => {
        const next = new Set(prev)
        filtered.forEach(c => next.add(c.id))
        return next
      })
    }
  }

  function updateClassification(id, value) {
    setCitations(prev => prev.map(c => c.id === id ? { ...c, classification: value } : c))
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  function handleDownloadCSV() {
    const toExport = filtered.filter(c => selectedInView === 0 || selected.has(c.id))
    if (toExport.length === 0) return
    const csv  = exportFetchedCitationsToCSV(toExport)
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `citations_${result?.patentNumber || 'export'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport() {
    if (!activeBoard || !onImport || selectedInView === 0) return
    const toImport = filtered.filter(c => selected.has(c.id)).map(toAppCitation)
    onImport(activeBoard.id, toImport)
    setSelected(new Set())
    alert(`יובאו ${toImport.length} ציטוטים ללוח "${activeBoard.name}" בעמודת "טרם התחיל".`)
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const normalizedInput = input.trim() ? normalizePatentNumber(input) : ''

  return (
    <div className="fetcher-panel">

      {/* Header */}
      <div className="fetcher-header">
        <h2 className="fetcher-title">שליפת ציטוטי פטנטים</h2>
        <p className="fetcher-desc">
          הזן מספר פרסום פטנט לשליפת ציטוטים אחורה, קדימה ומשפחת פטנטים ישירות מ-Google Patents.
          הנתונים נשלפים בקוד דטרמיניסטי ללא תלות במודל AI.
        </p>
      </div>

      {/* Search bar */}
      <div className="fetcher-search">
        <input
          className="fetcher-input"
          type="text"
          dir="ltr"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && handleFetch()}
          placeholder="e.g. WO2020227475A1  ·  US10000000B2  ·  EP3456789A1"
          disabled={loading}
          spellCheck={false}
        />
        <button
          className="btn btn-primary fetcher-btn-fetch"
          onClick={handleFetch}
          disabled={loading || !input.trim()}
        >
          {loading ? '⏳ שולף...' : '🔍 שלוף ציטוטים'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="fetcher-loading">
          <span className="fetcher-spinner" />
          שולף נתונים מ-Google Patents — עשוי לקחת מספר שניות...
        </div>
      )}

      {/* Error */}
      {result && !result.ok && (
        <div className="fetcher-error">
          <div className="fetcher-error-msg">⚠ {result.error}</div>
          {normalizedInput && (
            <a
              className="fetcher-error-link"
              href={`https://patents.google.com/patent/${normalizedInput}/en`}
              target="_blank"
              rel="noreferrer"
            >
              פתח פטנט זה ב-Google Patents →
            </a>
          )}
        </div>
      )}

      {/* Warning (success but 0 results) */}
      {result?.ok && result.warning && (
        <div className="fetcher-warn">{result.warning}</div>
      )}

      {/* Summary chips */}
      {result?.ok && citations.length > 0 && (
        <div className="fetcher-summary">
          <span className="fetcher-chip chip-total">סה"כ {citations.length} ציטוטים</span>
          {directionCounts.backward > 0 && (
            <span className="fetcher-chip chip-backward">אחורה: {directionCounts.backward}</span>
          )}
          {directionCounts.forward > 0 && (
            <span className="fetcher-chip chip-forward">קדימה: {directionCounts.forward}</span>
          )}
          {directionCounts.family > 0 && (
            <span className="fetcher-chip chip-family">משפחה: {directionCounts.family}</span>
          )}
        </div>
      )}

      {/* Results area */}
      {citations.length > 0 && (
        <>
          {/* Filter + actions bar */}
          <div className="fetcher-bar">
            <div className="fetcher-filters">
              <select value={filterDir} onChange={e => { setFilterDir(e.target.value); setSelected(new Set()) }}>
                {DIRECTION_FILTER_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              {authorities.length > 0 && (
                <select value={filterAuth} onChange={e => { setFilterAuth(e.target.value); setSelected(new Set()) }}>
                  <option value="">כל הרשויות</option>
                  {authorities.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              )}

              {sources.length > 1 && (
                <select value={filterSrc} onChange={e => { setFilterSrc(e.target.value); setSelected(new Set()) }}>
                  <option value="">כל המקורות</option>
                  {sources.map(s => <option key={s} value={s}>{sourceLabel(s)}</option>)}
                </select>
              )}

              <span className="fetcher-filter-count">
                מציג {filtered.length} מתוך {citations.length}
                {selectedInView > 0 && <strong> · {selectedInView} נבחרו</strong>}
              </span>
            </div>

            <div className="fetcher-actions">
              <button
                className="btn"
                onClick={handleDownloadCSV}
                title={selectedInView > 0 ? 'הורד ציטוטים נבחרים' : 'הורד את כל הציטוטים המסוננים'}
              >
                ⬇ הורד CSV{selectedInView > 0 ? ` (${selectedInView})` : ''}
              </button>
              {activeBoard ? (
                <button
                  className="btn btn-primary"
                  onClick={handleImport}
                  disabled={selectedInView === 0}
                  title="ייבא ציטוטים נבחרים ללוח הנוכחי בעמודת 'טרם התחיל'"
                >
                  ← ייבא ללוח{selectedInView > 0 ? ` (${selectedInView})` : ''}
                </button>
              ) : (
                <span className="fetcher-no-board">יש לבחור תיק פעיל לפני הייבוא</span>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="fetcher-table-wrap">
            <table className="fetcher-table">
              <thead>
                <tr>
                  <th className="col-check">
                    <input
                      type="checkbox"
                      checked={selectedInView === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                      title="בחר הכל"
                    />
                  </th>
                  <th className="col-patent">מספר פטנט</th>
                  <th className="col-title">כותרת</th>
                  <th className="col-dir">כיוון</th>
                  <th className="col-auth">רשות</th>
                  <th className="col-date">תאריך</th>
                  <th className="col-assignee">בעלים</th>
                  <th className="col-conf">אמון</th>
                  <th className="col-class">סיווג</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className={selected.has(c.id) ? 'fetcher-row-selected' : ''}>
                    <td className="col-check">
                      <input
                        type="checkbox"
                        checked={selected.has(c.id)}
                        onChange={() => toggleOne(c.id)}
                      />
                    </td>
                    <td className="col-patent">
                      <a
                        href={c.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="fetcher-pat-link"
                        dir="ltr"
                      >
                        {c.citedPatent}
                      </a>
                    </td>
                    <td className="col-title fetcher-title-cell" title={c.title}>{c.title || '—'}</td>
                    <td className="col-dir">
                      <span className={`fetcher-dir-badge ${DIRECTION_COLORS[c.direction] || ''}`}>
                        {directionLabel(c.direction)}
                      </span>
                    </td>
                    <td className="col-auth">{c.authority || '—'}</td>
                    <td className="col-date" dir="ltr">{c.publicationDate || '—'}</td>
                    <td className="col-assignee fetcher-assignee-cell" title={c.assignee}>{c.assignee || '—'}</td>
                    <td className="col-conf">
                      <span className={`fetcher-conf conf-${c.confidence}`}>
                        {confidenceLabel(c.confidence)}
                      </span>
                    </td>
                    <td className="col-class">
                      <select
                        className="sub-select"
                        value={c.classification}
                        onChange={e => updateClassification(c.id, e.target.value)}
                        title="סיווג ציטוט"
                      >
                        <option value="">—</option>
                        <option value="X">X – פוסל לבד</option>
                        <option value="Y">Y – פוסל בשילוב</option>
                        <option value="I">I – רקע טכנולוגי</option>
                        <option value="A">A – רקע כללי</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Footer note */}
      <div className="fetcher-note">
        <span>מקור נוכחי: Google Patents (via proxy מקומי)</span>
        <span className="fetcher-note-future">
          תמיכה עתידית: EPO OPS · USPTO PatentsView · CCD CSV/XLS
        </span>
      </div>
    </div>
  )
}
