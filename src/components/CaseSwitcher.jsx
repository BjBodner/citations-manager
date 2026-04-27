import { useState } from 'react'

export default function CaseSwitcher({
  boards, activeBoardId, onSelect, onCreate, onRename, onDelete
}) {
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  function startCreate() {
    setCreating(true); setEditingId(null); setName(''); setNumber('')
  }
  function startEdit(b) {
    setCreating(false); setEditingId(b.id); setName(b.name); setNumber(b.number || '')
  }
  function cancel() {
    setCreating(false); setEditingId(null); setName(''); setNumber('')
  }
  function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    if (creating) onCreate({ name, number })
    else if (editingId) onRename(editingId, name, number)
    cancel()
  }

  return (
    <div className="case-switcher">
      <div className="case-switcher-header">
        <h2>תיקים</h2>
        <button onClick={startCreate} className="btn btn-primary">+ תיק חדש</button>
      </div>

      {(creating || editingId) && (
        <form onSubmit={submit} className="case-form">
          <input
            autoFocus
            placeholder="שם התיק"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            placeholder="מספר תיק (אופציונלי)"
            value={number}
            onChange={e => setNumber(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">שמור</button>
          <button type="button" className="btn" onClick={cancel}>ביטול</button>
        </form>
      )}

      <ul className="case-list">
        {boards.length === 0 && <li className="empty">אין תיקים. צור תיק חדש להתחלה.</li>}
        {boards.map(b => (
          <li key={b.id} className={'case-item' + (b.id === activeBoardId ? ' active' : '')}>
            <button className="case-select" onClick={() => onSelect(b.id)}>
              <span className="case-name">{b.name}</span>
              {b.number && <span className="case-number">#{b.number}</span>}
              <span className="case-count">{b.citations.length} ציטוטים</span>
            </button>
            <div className="case-actions">
              <button className="btn-icon" title="שינוי שם" onClick={() => startEdit(b)}>✎</button>
              <button className="btn-icon danger" title="מחק" onClick={() => setConfirmDeleteId(b.id)}>🗑</button>
            </div>
            {confirmDeleteId === b.id && (
              <div className="confirm-inline">
                <span>למחוק את התיק "{b.name}" וכל הציטוטים שבו?</span>
                <button className="btn btn-danger" onClick={() => { onDelete(b.id); setConfirmDeleteId(null) }}>מחק</button>
                <button className="btn" onClick={() => setConfirmDeleteId(null)}>ביטול</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
