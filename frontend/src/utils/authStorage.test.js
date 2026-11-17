import { beforeEach, describe, expect, it } from 'vitest'
import { clearSession, getSession, saveSession } from './authStorage.js'
import { SESSION_STORAGE_KEY } from './constants.js'

describe('authStorage', () => {
  beforeEach(() => localStorage.clear())
  it('saves, reads, and clears a session', () => {
    const session = { token: 'abc', userId: 2 }
    saveSession(session); expect(getSession()).toEqual(session)
    clearSession(); expect(getSession()).toBeNull()
  })
  it('clears corrupted JSON and returns null', () => {
    localStorage.setItem(SESSION_STORAGE_KEY, '{bad json')
    expect(getSession()).toBeNull(); expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
  })
})
