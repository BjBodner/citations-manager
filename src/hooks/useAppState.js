import { useEffect, useRef, useState, useCallback } from 'react'
import { load, save } from '../utils/storage.js'
import { emptyState, newBoard, newCitation } from '../data/schema.js'
import { uid } from '../utils/id.js'

export function useAppState() {
  const [state, setState] = useState(() => {
    const loaded = load()
    if (loaded && Array.isArray(loaded.boards)) return loaded
    return emptyState()
  })
  const firstRun = useRef(true)

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
    setState(s => ({
      ...s,
      boards: s.boards.map(b => b.id !== boardId ? b : ({
        ...b, citations: b.citations.filter(c => c.id !== citationId)
      }))
    }))
  }, [])

  const moveCitation = useCallback((boardId, citationId, newStatus, newSub = undefined) => {
    setState(s => ({
      ...s,
      boards: s.boards.map(b => b.id !== boardId ? b : ({
        ...b,
        citations: b.citations.map(c => {
          if (c.id !== citationId) return c
          const completed = (newStatus === 'relevant' || newStatus === 'irrelevant')
          let sub = newSub !== undefined ? newSub : c.subClassification
          if (newStatus !== 'relevant') sub = null
          else if (!sub) sub = 'A'
          return {
            ...c,
            status: newStatus,
            subClassification: sub,
            updatedAt: Date.now(),
            completedAt: completed ? (c.completedAt ?? Date.now()) : null
          }
        })
      }))
    }))
  }, [])

  const importCitations = useCallback((boardId, items) => {
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

  return {
    state,
    addBoard, renameBoard, deleteBoard, setActiveBoard,
    addCitation, updateCitation, deleteCitation, moveCitation, importCitations,
    replaceState, mergeState
  }
}
