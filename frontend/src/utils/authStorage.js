import { SESSION_STORAGE_KEY } from './constants.js'

export function getSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (!session || typeof session !== 'object' || Array.isArray(session)) throw new Error('Invalid session')
    return session
  } catch {
    try { window.localStorage.removeItem(SESSION_STORAGE_KEY) } catch { /* Storage may be unavailable. */ }
    return null
  }
}

export function saveSession(session) {
  try { window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session)); return true } catch { return false }
}

export function clearSession() {
  try { window.localStorage.removeItem(SESSION_STORAGE_KEY) } catch { /* Storage may be unavailable. */ }
}
