const KEY = 'citations_manager_v1'

export function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load state', e)
    return null
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
    return true
  } catch (e) {
    console.error('Failed to save state', e)
    return false
  }
}

export function clear() {
  localStorage.removeItem(KEY)
}
