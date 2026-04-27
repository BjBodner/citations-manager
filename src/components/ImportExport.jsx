import { useRef, useState } from 'react'
import { parseCitationsCSV, citationsToCSV, SAMPLE_CSV } from '../utils/csv.js'

function download(filename, text, mime = 'application/json') {
  const blob = new Blob([text], { type: mime + ';charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function ImportExport({
  state, activeBoard,
  onImportCitations, onReplaceState, onMergeState
}) {
  const csvInput = useRef(null)
  const jsonInput = useRef(null)
  const fullJsonInput = useRef(null)

  const [csvPreview, setCsvPreview] = useState(null)
  const [jsonPreview, setJsonPreview] = useState(null)
  const [fullJsonPreview, setFullJsonPreview] = useState(null)

  function exportBoardJSON() {
    if (!activeBoard) return
    const payload = { version: state.version, exportedAt: new Date().toISOString(), board: activeBoard }
    download(`board-${activeBoard.name || activeBoard.id}.json`, JSON.stringify(payload, null, 2))
  }
  function exportAllJSON() {
    const payload = { ...state, exportedAt: new Date().toISOString() }
    download(`citations-backup-${new Date().toISOString().slice(0,10)}.json`, JSON.stringify(payload, null, 2))
  }
  function exportBoardCSV() {
    if (!activeBoard) return
    const csv = citationsToCSV(activeBoard.citations)
    download(`board-${activeBoard.name || activeBoard.id}.csv`, csv, 'text/csv')
  }
  function downloadSample() {
    download('citations-sample.csv', SAMPLE_CSV, 'text/csv')
  }

  async function handleCSV(e) {
    const file = e.target.files?.[0]; if (!file) return
    const text = await file.text()
    const result = parseCitationsCSV(text)
    setCsvPreview(result)
    e.target.value = ''
  }
  function applyCSV() {
    if (!csvPreview?.ok || !activeBoard) return
    onImportCitations(activeBoard.id, csvPreview.rows)
    setCsvPreview(null)
  }

  async function handleBoardJSON(e) {
    const file = e.target.files?.[0]; if (!file) return
    try {
      const data = JSON.parse(await file.text())
      const board = data.board ?? data
      if (!board?.citations) throw new Error('JSON אינו תיק חוקי')
      setJsonPreview(board)
    } catch (err) {
      alert('כשל בקריאת JSON: ' + err.message)
    }
    e.target.value = ''
  }
  function applyBoardJSON() {
    if (!jsonPreview || !activeBoard) return
    onImportCitations(activeBoard.id, jsonPreview.citations)
    setJsonPreview(null)
  }

  async function handleFullJSON(e) {
    const file = e.target.files?.[0]; if (!file) return
    try {
      const data = JSON.parse(await file.text())
      if (!Array.isArray(data.boards)) throw new Error('JSON אינו גיבוי מלא')
      setFullJsonPreview(data)
    } catch (err) {
      alert('כשל בקריאת JSON: ' + err.message)
    }
    e.target.value = ''
  }
  function replaceFromFull() {
    if (!fullJsonPreview) return
    if (!confirm('פעולה זו תחליף את כל הנתונים הקיימים. להמשיך?')) return
    onReplaceState(fullJsonPreview)
    setFullJsonPreview(null)
  }
  function mergeFromFull() {
    if (!fullJsonPreview) return
    onMergeState(fullJsonPreview)
    setFullJsonPreview(null)
  }

  return (
    <div className="ie-panel">
      <h3>ייבוא / ייצוא</h3>

      <div className="ie-section">
        <h4>ייצוא</h4>
        <div className="ie-row">
          <button className="btn" onClick={exportBoardJSON} disabled={!activeBoard}>JSON של תיק נוכחי</button>
          <button className="btn" onClick={exportBoardCSV} disabled={!activeBoard}>CSV של תיק נוכחי</button>
          <button className="btn" onClick={exportAllJSON}>גיבוי מלא (JSON)</button>
        </div>
      </div>

      <div className="ie-section">
        <h4>ייבוא CSV לתיק הנוכחי</h4>
        <div className="ie-row">
          <input ref={csvInput} type="file" accept=".csv,text/csv" onChange={handleCSV} disabled={!activeBoard} />
          <button className="btn" onClick={downloadSample}>הורד דוגמת CSV</button>
        </div>
        {csvPreview && (
          <div className="ie-preview">
            {!csvPreview.ok && <div className="error">שגיאה: {csvPreview.error}</div>}
            {csvPreview.ok && (
              <>
                <div>נמצאו {csvPreview.rows.length} שורות תקינות</div>
                {csvPreview.errors?.length > 0 && (
                  <details>
                    <summary>{csvPreview.errors.length} שורות עם שגיאות</summary>
                    <ul>
                      {csvPreview.errors.map((er, i) => (
                        <li key={i}>שורה {er.line}: {er.message}</li>
                      ))}
                    </ul>
                  </details>
                )}
                <div className="ie-row">
                  <button className="btn btn-primary" onClick={applyCSV} disabled={csvPreview.rows.length === 0}>אשר ייבוא</button>
                  <button className="btn" onClick={() => setCsvPreview(null)}>ביטול</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="ie-section">
        <h4>ייבוא JSON של תיק לתיק הנוכחי</h4>
        <input ref={jsonInput} type="file" accept=".json,application/json" onChange={handleBoardJSON} disabled={!activeBoard} />
        {jsonPreview && (
          <div className="ie-preview">
            <div>נמצא תיק "{jsonPreview.name}" עם {jsonPreview.citations?.length ?? 0} ציטוטים</div>
            <div className="ie-row">
              <button className="btn btn-primary" onClick={applyBoardJSON}>הוסף ציטוטים לתיק הנוכחי</button>
              <button className="btn" onClick={() => setJsonPreview(null)}>ביטול</button>
            </div>
          </div>
        )}
      </div>

      <div className="ie-section">
        <h4>ייבוא גיבוי מלא (JSON)</h4>
        <input ref={fullJsonInput} type="file" accept=".json,application/json" onChange={handleFullJSON} />
        {fullJsonPreview && (
          <div className="ie-preview">
            <div>נמצאו {fullJsonPreview.boards.length} תיקים בקובץ</div>
            <div className="ie-row">
              <button className="btn btn-danger" onClick={replaceFromFull}>החלפה מלאה</button>
              <button className="btn btn-primary" onClick={mergeFromFull}>מיזוג</button>
              <button className="btn" onClick={() => setFullJsonPreview(null)}>ביטול</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
