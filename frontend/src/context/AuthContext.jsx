import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '@/api/authApi.js'
import { setUnauthorizedHandler } from '@/api/axiosClient.js'
import { clearSession, getSession, saveSession } from '@/utils/authStorage.js'
import { isTokenExpired } from '@/utils/jwt.js'

export const AuthContext = createContext(null)

function getInitialSession() {
  const stored = getSession()
  if (stored?.token && isTokenExpired(stored.token)) { clearSession(); return null }
  return stored
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getInitialSession)
  const logout = useCallback(() => { clearSession(); setSession(null) }, [])

  useEffect(() => { setUnauthorizedHandler(logout); return () => setUnauthorizedHandler(null) }, [logout])

  const signIn = useCallback(async (email, password) => {
    const next = await authApi.login({ email, password })
    saveSession(next)
    setSession(next)
    return next
  }, [])

  const signUp = useCallback(async (payload) => {
    await authApi.register(payload)
    return signIn(payload.email, payload.password)
  }, [signIn])

  const value = useMemo(() => ({
    session,
    user: session ? { fullName: session.fullName, role: session.role, userId: session.userId } : null,
    isAuthenticated: Boolean(session?.token),
    login: signIn,
    register: signUp,
    logout,
  }), [session, signIn, signUp, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
