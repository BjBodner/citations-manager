/**
 * @typedef {Object} Citation
 * @property {string} id
 * @property {string} publicationNumber
 * @property {string} title
 * @property {string} abstract
 * @property {string} link
 * @property {string} notes
 * @property {'todo'|'in-progress'|'relevant'|'irrelevant'} status
 * @property {'X'|'Y'|'I'|'A'|null} subClassification
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {number|null} completedAt
 */

/**
 * @typedef {Object} Board
 * @property {string} id
 * @property {string} name
 * @property {string} number
 * @property {number} createdAt
 * @property {Citation[]} citations
 */

/**
 * @typedef {Object} AppState
 * @property {number} version
 * @property {string} exportedAt
 * @property {Object} settings
 * @property {Board[]} boards
 * @property {string|null} activeBoardId
 */

import { APP_VERSION } from './constants.js'

export function emptyState() {
  return {
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    settings: { dailyGoal: 10, soundEnabled: true },
    streak: { current: 0, lastMetDate: null },
    gamification: emptyGamification(),
    boards: [],
    activeBoardId: null
  }
}

export function emptyGamification() {
  return {
    points: 0,
    level: 0,
    completionsAtLevel: 0,
    totalCompletions: 0
  }
}

export function newCitation(partial = {}) {
  const now = Date.now()
  return {
    id: '',
    publicationNumber: '',
    title: '',
    abstract: '',
    link: '',
    notes: '',
    status: 'todo',
    subClassification: null,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    ...partial
  }
}

export function newBoard(partial = {}) {
  return {
    id: '',
    name: '',
    number: '',
    createdAt: Date.now(),
    citations: [],
    ...partial
  }
}
