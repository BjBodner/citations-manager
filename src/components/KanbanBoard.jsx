import { useState } from 'react'
import { STATUSES, SUB_CLASSIFICATIONS } from '../data/constants.js'
import CitationCard from './CitationCard.jsx'

export default function KanbanBoard({
  citations, level, onMove, onEdit, onDelete, onLinkClick, onChangeSub, onClearTodo
}) {
  const [activeRelevantTab, setActiveRelevantTab] = useState('ALL')
  const [dragOver, setDragOver] = useState(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  function onDragOver(e, statusId) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(statusId)
  }
  function onDrop(e, statusId) {
    e.preventDefault()
    setDragOver(null)
    const id = e.dataTransfer.getData('text/citation-id')
    if (!id) return
    let sub = undefined
    if (statusId === 'relevant' && activeRelevantTab !== 'ALL') sub = activeRelevantTab
    onMove(id, statusId, sub)
  }

  const cardTheme = level?.cardTheme || 'soft'

  return (
    <div className={'kanban kanban-theme-' + cardTheme}>
      {STATUSES.map(col => {
        const items = citations.filter(c => c.status === col.id)
        const filtered = (col.id === 'relevant' && activeRelevantTab !== 'ALL')
          ? items.filter(c => c.subClassification === activeRelevantTab)
          : items
        const p = level?.palette?.[col.id] || {}
        const colStyle = {
          '--col-bg': p.bg || '#fff',
          '--col-border': p.border || '#e5e7eb',
          '--col-accent': p.accent || col.color
        }
        return (
          <div
            key={col.id}
            className={'kanban-col col-' + col.id + (dragOver === col.id ? ' drag-over' : '')}
            style={colStyle}
            onDragOver={e => onDragOver(e, col.id)}
            onDragLeave={() => setDragOver(prev => prev === col.id ? null : prev)}
            onDrop={e => onDrop(e, col.id)}
          >
            <div className="kanban-col-head">
              <span className="kanban-col-title">{col.label}</span>
              <div className="kanban-col-head-actions">
                {col.id === 'todo' && items.length > 0 && (
                  <button
                    className="btn-icon danger"
                    title="נקה עמודה"
                    onClick={() => setShowClearConfirm(true)}
                  >🗑</button>
                )}
                <span className="kanban-col-count">{items.length}</span>
              </div>
            </div>
            {col.id === 'todo' && showClearConfirm && (
              <div className="clear-confirm-overlay">
                <div className="clear-confirm-card">
                  <span className="clear-confirm-icon">⚠️</span>
                  <p className="clear-confirm-msg">למחוק את כל {items.length} הציטוטים שטרם התחילו?</p>
                  <div className="clear-confirm-actions">
                    <button className="btn btn-danger" onClick={() => { onClearTodo(); setShowClearConfirm(false) }}>מחק הכל</button>
                    <button className="btn" onClick={() => setShowClearConfirm(false)}>ביטול</button>
                  </div>
                </div>
              </div>
            )}
            {col.id === 'relevant' && (
              <div className="sub-tabs">
                <button className={'sub-tab' + (activeRelevantTab === 'ALL' ? ' active' : '')} onClick={() => setActiveRelevantTab('ALL')}>הכל</button>
                {SUB_CLASSIFICATIONS.map(s => (
                  <button
                    key={s.id}
                    className={'sub-tab' + (activeRelevantTab === s.id ? ' active' : '')}
                    onClick={() => setActiveRelevantTab(s.id)}
                    title={s.label}
                  >{s.id}</button>
                ))}
              </div>
            )}
            <div className="kanban-col-body">
              {filtered.length === 0 && <div className="empty-col">אין ציטוטים</div>}
              {filtered.map(c => (
                <CitationCard
                  key={c.id}
                  citation={c}
                  cardTheme={cardTheme}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onLinkClick={onLinkClick}
                  onChangeSub={onChangeSub}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
