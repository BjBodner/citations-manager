import { useState } from 'react'
import { SUB_CLASSIFICATIONS } from '../data/constants.js'

export default function CitationCard({ citation, onEdit, onDelete, onLinkClick, onChangeSub }) {
  const [confirming, setConfirming] = useState(false)

  function handleDragStart(e) {
    e.dataTransfer.setData('text/citation-id', citation.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function clickLink(e) {
    if (!citation.link) { e.preventDefault(); return }
    onLinkClick?.(citation)
    // let the default open happen via target=_blank
  }

  return (
    <div className="cit-card" draggable onDragStart={handleDragStart}>
      <div className="cit-card-head">
        <span className="cit-pub">{citation.publicationNumber || '—'}</span>
        <div className="cit-actions">
          <button className="btn-icon" title="ערוך" onClick={() => onEdit(citation)}>✎</button>
          <button className="btn-icon danger" title="מחק" onClick={() => setConfirming(true)}>🗑</button>
        </div>
      </div>
      {citation.title && <div className="cit-title">{citation.title}</div>}
      {citation.abstract && <div className="cit-abstract">{citation.abstract}</div>}
      {citation.notes && <div className="cit-notes">📝 {citation.notes}</div>}
      <div className="cit-card-foot">
        {citation.link
          ? <a href={citation.link} target="_blank" rel="noreferrer" onClick={clickLink}>פתח קישור ↗</a>
          : <span className="muted">אין קישור</span>}
        {citation.status === 'relevant' && (
          <select
            className="sub-select"
            value={citation.subClassification || 'A'}
            onChange={e => onChangeSub(citation.id, e.target.value)}
            title="תת-סיווג"
          >
            {SUB_CLASSIFICATIONS.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        )}
      </div>
      {confirming && (
        <div className="confirm-inline">
          <span>למחוק את הציטוט?</span>
          <button className="btn btn-danger" onClick={() => { onDelete(citation.id); setConfirming(false) }}>מחק</button>
          <button className="btn" onClick={() => setConfirming(false)}>ביטול</button>
        </div>
      )}
    </div>
  )
}
