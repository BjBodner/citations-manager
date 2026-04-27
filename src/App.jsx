import { useMemo, useState } from 'react'
import { useAppState } from './hooks/useAppState.js'
import CaseSwitcher from './components/CaseSwitcher.jsx'
import KanbanBoard from './components/KanbanBoard.jsx'
import CitationForm from './components/CitationForm.jsx'
import ImportExport from './components/ImportExport.jsx'

export default function App() {
  const {
    state,
    addBoard, renameBoard, deleteBoard, setActiveBoard,
    addCitation, updateCitation, deleteCitation, moveCitation, importCitations,
    replaceState, mergeState
  } = useAppState()

  const [view, setView] = useState('board') // 'board' | 'cases' | 'ie'
  const [editingCitation, setEditingCitation] = useState(null)
  const [creatingCitation, setCreatingCitation] = useState(false)

  const activeBoard = useMemo(
    () => state.boards.find(b => b.id === state.activeBoardId) ?? null,
    [state]
  )

  function handleSelectBoard(id) {
    setActiveBoard(id)
    setView('board')
  }

  function handleAddBoard(payload) {
    addBoard(payload)
  }

  function handleSaveCitation(payload) {
    if (!activeBoard) return
    if (editingCitation?.id) {
      updateCitation(activeBoard.id, editingCitation.id, payload)
    } else {
      addCitation(activeBoard.id, payload)
    }
    setEditingCitation(null)
    setCreatingCitation(false)
  }

  function handleLinkClick(citation) {
    if (!activeBoard) return
    if (citation.status === 'todo') {
      moveCitation(activeBoard.id, citation.id, 'in-progress')
    }
  }

  return (
    <div className="app" dir="rtl" lang="he">
      <header className="app-header">
        <h1>מנהל ציטוטים</h1>
        {activeBoard && view === 'board' && (
          <span className="active-board-badge">{activeBoard.name}{activeBoard.number ? ` · #${activeBoard.number}` : ''}</span>
        )}
        <nav className="top-nav">
          <button className={'tab' + (view === 'board' ? ' active' : '')} onClick={() => setView('board')}>לוח</button>
          <button className={'tab' + (view === 'cases' ? ' active' : '')} onClick={() => setView('cases')}>תיקים</button>
          <button className={'tab' + (view === 'ie' ? ' active' : '')} onClick={() => setView('ie')}>ייבוא/ייצוא</button>
        </nav>
      </header>

      <main className="app-main">
        {view === 'cases' && (
          <CaseSwitcher
            boards={state.boards}
            activeBoardId={state.activeBoardId}
            onSelect={handleSelectBoard}
            onCreate={handleAddBoard}
            onRename={renameBoard}
            onDelete={deleteBoard}
          />
        )}

        {view === 'board' && (
          <section className="board-view">
            {!activeBoard ? (
              <div className="empty-state">
                <p>אין תיק פעיל. עבור ללשונית "תיקים" וצור תיק חדש.</p>
                <button className="btn btn-primary" onClick={() => setView('cases')}>למסך התיקים</button>
              </div>
            ) : (
              <>
                <div className="board-toolbar">
                  <div>
                    <strong>{activeBoard.name}</strong>
                    {activeBoard.number && <span className="muted"> · #{activeBoard.number}</span>}
                    <span className="muted"> · {activeBoard.citations.length} ציטוטים</span>
                  </div>
                  <button className="btn btn-primary" onClick={() => { setCreatingCitation(true); setEditingCitation(null) }}>
                    + ציטוט חדש
                  </button>
                </div>

                {(creatingCitation || editingCitation) && (
                  <div className="modal-backdrop" onClick={() => { setCreatingCitation(false); setEditingCitation(null) }}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                      <CitationForm
                        initial={editingCitation}
                        onSave={handleSaveCitation}
                        onCancel={() => { setCreatingCitation(false); setEditingCitation(null) }}
                      />
                    </div>
                  </div>
                )}

                <KanbanBoard
                  citations={activeBoard.citations}
                  onMove={(citId, status, sub) => moveCitation(activeBoard.id, citId, status, sub)}
                  onEdit={(c) => { setEditingCitation(c); setCreatingCitation(false) }}
                  onDelete={(citId) => deleteCitation(activeBoard.id, citId)}
                  onLinkClick={handleLinkClick}
                  onChangeSub={(citId, sub) => updateCitation(activeBoard.id, citId, { subClassification: sub })}
                />
              </>
            )}
          </section>
        )}

        {view === 'ie' && (
          <ImportExport
            state={state}
            activeBoard={activeBoard}
            onImportCitations={importCitations}
            onReplaceState={replaceState}
            onMergeState={mergeState}
          />
        )}
      </main>

      <footer className="app-footer">
        <span>שלב 2 — טאבים, תיקים וניווט. נתונים ב-localStorage בלבד.</span>
      </footer>
    </div>
  )
}
