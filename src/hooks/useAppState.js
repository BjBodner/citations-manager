import { useEffect, useRef, useState, useCallback } from 'react'
import { load, save } from '../utils/storage.js'
import { emptyState, emptyGamification, newBoard, newCitation } from '../data/schema.js'
import { uid } from '../utils/id.js'
import { COMPLETIONS_PER_LEVEL, getLevel } from '../data/levels.js'

export function useAppState() {
  const [state, setState] = useState(() => {
    const loaded = load()
    if (loaded && Array.isArray(loaded.boards)) {
      // migration: ensure gamification block exists for older saved states
      if (!loaded.gamification) loaded.gamification = emptyGamification()
      if (!loaded.settings) loaded.settings = { dailyGoal: 10, soundEnabled: true }
      return loaded
    }
    return emptyState()
  })
  const [celebration, setCelebration] = useState(null)
  const clearCelebration = useCallback(() => setCelebration(null), [])
  const firstRun = useRef(true)

  // undo history (in-memory only, not persisted)
  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state }, [state])
  const historyRef = useRef([])
  const [canUndo, setCanUndo] = useState(false)

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return
    const prev = historyRef.current[historyRef.current.length - 1]
    historyRef.current = historyRef.current.slice(0, -1)
    setState(prev)
    setCanUndo(historyRef.current.length > 0)
  }, [])

  useEffect(() => {
    // skip the very first save on mount to avoid an unnecessary write,
    // but still save on every subsequent change.
    if (firstRun.current) { firstRun.current = false; return }
    save(state)
  }, [state])

  const addBoard = useCallback(({ name, number }) => {
    const board = newBoard({ id: uid('board'), name: name.trim(), number: (number || '').trim() })
    setState(s => ({
      ...s,
      boards: [...s.boards, board],
      activeBoardId: s.activeBoardId || board.id
    }))
    return board.id
  }, [])

  const renameBoard = useCallback((boardId, name, number) => {
    setState(s => ({
      ...s,
      boards: s.boards.map(b => b.id === boardId
        ? { ...b, name: name.trim(), number: (number ?? b.number).trim() }
        : b)
    }))
  }, [])

  const deleteBoard = useCallback((boardId) => {
    setState(s => {
      const boards = s.boards.filter(b => b.id !== boardId)
      const activeBoardId = s.activeBoardId === boardId
        ? (boards[0]?.id ?? null)
        : s.activeBoardId
      return { ...s, boards, activeBoardId }
    })
  }, [])

  const setActiveBoard = useCallback((boardId) => {
    setState(s => ({ ...s, activeBoardId: boardId }))
  }, [])

  const addCitation = useCallback((boardId, partial) => {
    historyRef.current = [...historyRef.current.slice(-19), stateRef.current]
    setCanUndo(true)
    const cit = newCitation({ ...partial, id: uid('cit') })
    setState(s => ({
      ...s,
      boards: s.boards.map(b => b.id === boardId
        ? { ...b, citations: [...b.citations, cit] }
        : b)
    }))
    return cit.id
  }, [])

  const updateCitation = useCallback((boardId, citationId, patch) => {
    historyRef.current = [...historyRef.current.slice(-19), stateRef.current]
    setCanUndo(true)
    setState(s => ({
      ...s,
      boards: s.boards.map(b => b.id !== boardId ? b : ({
        ...b,
        citations: b.citations.map(c => c.id !== citationId ? c : ({
          ...c, ...patch, updatedAt: Date.now()
        }))
      }))
    }))
  }, [])

  const deleteCitation = useCallback((boardId, citationId) => {
    historyRef.current = [...historyRef.current.slice(-19), stateRef.current]
    setCanUndo(true)
    setState(s => ({
      ...s,
      boards: s.boards.map(b => b.id !== boardId ? b : ({
        ...b, citations: b.citations.filter(c => c.id !== citationId)
      }))
    }))
  }, [])

  const clearTodoCitations = useCallback((boardId) => {
    historyRef.current = [...historyRef.current.slice(-19), stateRef.current]
    setCanUndo(true)
    setState(s => ({
      ...s,
      boards: s.boards.map(b => b.id !== boardId ? b : ({
        ...b, citations: b.citations.filter(c => c.status !== 'todo')
      }))
    }))
  }, [])

  const moveCitation = useCallback((boardId, citationId, newStatus, newSub = undefined) => {
    historyRef.current = [...historyRef.current.slice(-19), stateRef.current]
    setCanUndo(true)
    let pendingCelebration = null
    setState(s => {
      let firstTimeCompletion = false
      let isRelevant = false
      const boards = s.boards.map(b => {
        if (b.id !== boardId) return b
        return {
          ...b,
          citations: b.citations.map(c => {
            if (c.id !== citationId) return c
            const completed = (newStatus === 'relevant' || newStatus === 'irrelevant')
            const wasCompleted = c.completedAt != null
            if (completed && !wasCompleted) {
              firstTimeCompletion = true
              isRelevant = newStatus === 'relevant'
            }
            let sub = newSub !== undefined ? newSub : c.subClassification
            if (newStatus !== 'relevant') sub = null
            else if (!sub) sub = 'A'
            return {
              ...c,
              status: newStatus,
              subClassification: sub,
              updatedAt: Date.now(),
              // Once a citation has been completed, keep the timestamp so
              // moving back-and-forth doesn't re-award points.
              completedAt: completed ? (c.completedAt ?? Date.now()) : c.completedAt
            }
          })
        }
      })

      let gamification = s.gamification ?? emptyGamification()
      if (firstTimeCompletion) {
        const points = gamification.points + (isRelevant ? 15 : 10)
        const totalCompletions = gamification.totalCompletions + 1
        const nextCompletionsAtLevel = gamification.completionsAtLevel + 1
        const leveledUp = nextCompletionsAtLevel >= COMPLETIONS_PER_LEVEL
        const newLevel = leveledUp ? gamification.level + 1 : gamification.level
        gamification = {
          ...gamification,
          points,
          totalCompletions,
          completionsAtLevel: leveledUp ? 0 : nextCompletionsAtLevel,
          level: newLevel
        }
        pendingCelebration = leveledUp
          ? { type: 'levelUp', level: getLevel(newLevel) }
          : { type: 'completion' }
      }
      return { ...s, boards, gamification }
    })

    if (pendingCelebration) {
      setCelebration({ ...pendingCelebration, key: Date.now() + Math.random() })
    }
  }, [])

  const importCitations = useCallback((boardId, items) => {
    historyRef.current = [...historyRef.current.slice(-19), stateRef.current]
    setCanUndo(true)
    setState(s => ({
      ...s,
      boards: s.boards.map(b => b.id !== boardId ? b : ({
        ...b,
        citations: [
          ...b.citations,
          ...items.map(it => newCitation({ ...it, id: uid('cit') }))
        ]
      }))
    }))
  }, [])

  const replaceState = useCallback((next) => {
    setState(next)
  }, [])

  const mergeState = useCallback((incoming) => {
    setState(s => {
      const byId = new Map(s.boards.map(b => [b.id, b]))
      for (const ib of incoming.boards || []) {
        const existing = byId.get(ib.id)
        if (!existing) {
          byId.set(ib.id, ib)
        } else {
          const citIds = new Set(existing.citations.map(c => c.id))
          const merged = [...existing.citations]
          for (const ic of ib.citations || []) {
            if (!citIds.has(ic.id)) merged.push(ic)
          }
          byId.set(ib.id, { ...existing, citations: merged })
        }
      }
      return { ...s, boards: Array.from(byId.values()) }
    })
  }, [])

  const setSoundEnabled = useCallback((enabled) => {
    setState(s => ({ ...s, settings: { ...s.settings, soundEnabled: !!enabled } }))
  }, [])

  return {
    state,
    addBoard, renameBoard, deleteBoard, setActiveBoard,
    addCitation, updateCitation, deleteCitation, moveCitation, importCitations,
    clearTodoCitations,
    replaceState, mergeState,
    celebration, clearCelebration,
    setSoundEnabled,
    undo, canUndo
  }
}
