import { useMemo, useState } from 'react'
import { useAppState } from './hooks/useAppState.js'
import CaseSwitcher from './components/CaseSwitcher.jsx'
import KanbanBoard from './components/KanbanBoard.jsx'
import CitationForm from './components/CitationForm.jsx'
import ImportExport from './components/ImportExport.jsx'
import PatentFetcher from './components/PatentFetcher.jsx'
import GameHud from './components/GameHud.jsx'
import CelebrationOverlay from './components/CelebrationOverlay.jsx'
import { getLevel } from './data/levels.js'

export default function App() {
  const {
    state,
    addBoard, renameBoard, deleteBoard, setActiveBoard,
    addCitation, updateCitation, deleteCitation, moveCitation, importCitations,
    clearTodoCitations,
    replaceState, mergeState,
    celebration, clearCelebration, setSoundEnabled,
    undo, canUndo
  } = useAppState()

  const level = getLevel(state.gamification?.level ?? 0)
  const soundEnabled = state.settings?.soundEnabled ?? true

  const [view, setView] = useState('board') // 'board' | 'cases' | 'ie' | 'fetch'
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
    <div className={'app theme-' + level.cardTheme} dir="rtl" lang="he" data-level={level.id}>
      <header className="app-header">
        <h1>מנהל ציטוטים</h1>
        {activeBoard && view === 'board' && (
          <span className="active-board-badge">{activeBoard.name}{activeBoard.number ? ` · #${activeBoard.number}` : ''}</span>
        )}
        <nav className="top-nav">
          <button className={'tab' + (view === 'board' ? ' active' : '')} onClick={() => setView('board')}>לוח</button>
          <button className={'tab' + (view === 'cases' ? ' active' : '')} onClick={() => setView('cases')}>תיקים</button>
          <button className={'tab' + (view === 'ie' ? ' active' : '')} onClick={() => setView('ie')}>ייבוא/ייצוא</button>
          <button className={'tab' + (view === 'fetch' ? ' active' : '')} onClick={() => setView('fetch')}>שליפת ציטוטים</button>
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
                <GameHud
                  gamification={state.gamification}
                  level={level}
                  soundEnabled={soundEnabled}
                  onToggleSound={setSoundEnabled}
                  streak={state.streak}
                />
                <div className="board-toolbar">
                  <div>
                    <strong>{activeBoard.name}</strong>
                    {activeBoard.number && <span className="muted"> · #{activeBoard.number}</span>}
                    <span className="muted"> · {activeBoard.citations.length} ציטוטים</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn" onClick={undo} disabled={!canUndo} title="בטל פעולה אחרונה">
                      ↩ בטל
                    </button>
                    <button className="btn btn-primary" onClick={() => { setCreatingCitation(true); setEditingCitation(null) }}>
                      + ציטוט חדש
                    </button>
                  </div>
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
                  level={level}
                  onMove={(citId, status, sub) => moveCitation(activeBoard.id, citId, status, sub)}
                  onEdit={(c) => { setEditingCitation(c); setCreatingCitation(false) }}
                  onDelete={(citId) => deleteCitation(activeBoard.id, citId)}
                  onLinkClick={handleLinkClick}
                  onChangeSub={(citId, sub) => updateCitation(activeBoard.id, citId, { subClassification: sub })}
                  onClearTodo={() => clearTodoCitations(activeBoard.id)}
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

        {view === 'fetch' && (
          <PatentFetcher
            activeBoard={activeBoard}
            onImport={importCitations}
          />
        )}
      </main>

      <CelebrationOverlay
        celebration={celebration}
        soundEnabled={soundEnabled}
        onDone={clearCelebration}
      />

      <footer className="app-footer">
        <span>שלב 2 — טאבים, תיקים וניווט. נתונים ב-localStorage בלבד.</span>
      </footer>
    </div>
  )
}
