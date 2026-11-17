import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from './AuthContext.jsx'
import useAuth from '@/hooks/useAuth.js'
import { clearSession, getSession, saveSession } from '@/utils/authStorage.js'
import { ROLES } from '@/utils/constants.js'

function token(exp) { return `header.${btoa(JSON.stringify({ exp }))}.signature` }
function SessionControls() { const { isAuthenticated, logout } = useAuth(); return <><p>{isAuthenticated ? 'authenticated' : 'logged out'}</p><button onClick={logout}>Log out</button></> }

describe('AuthContext', () => {
  beforeEach(() => clearSession())
  it('starts logged out and clears an expired stored token', () => {
    saveSession({ token: token(1), userId: 1, fullName: 'User', role: ROLES.CUSTOMER })
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AuthProvider><SessionControls /></AuthProvider></MemoryRouter>)
    expect(screen.getByText('logged out')).toBeInTheDocument(); expect(getSession()).toBeNull()
  })
  it('logout clears the saved session', () => {
    saveSession({ token: token(Math.floor(Date.now() / 1000) + 3600), userId: 1, fullName: 'User', role: ROLES.CUSTOMER })
    render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AuthProvider><SessionControls /></AuthProvider></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Log out' })); expect(getSession()).toBeNull(); expect(screen.getByText('logged out')).toBeInTheDocument()
  })
})
