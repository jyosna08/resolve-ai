import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext.jsx'
import { clearSession, saveSession } from '@/utils/authStorage.js'
import { ADMIN_TEAM_PATH, ROLES } from '@/utils/constants.js'
import AppRoutes from './AppRoutes.jsx'

function makeToken(exp = Math.floor(Date.now() / 1000) + 3600) { return `header.${btoa(JSON.stringify({ exp }))}.signature` }
function renderRoutes(path) { return render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={[path]}><AuthProvider><AppRoutes /></AuthProvider></MemoryRouter>) }

describe('ProtectedRoute', () => {
  beforeEach(() => clearSession())
  it('sends logged out users to login', () => { renderRoutes('/dashboard'); expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument() })
  it('redirects customers away from dashboard', () => {
    saveSession({ token: makeToken(), userId: 1, fullName: 'Casey Customer', role: ROLES.CUSTOMER })
    renderRoutes('/dashboard'); expect(screen.getByRole('heading', { name: 'My tickets' })).toBeInTheDocument()
  })
  it('renders dashboard for agents', () => {
    saveSession({ token: makeToken(), userId: 2, fullName: 'Ari Agent', role: ROLES.AGENT })
    renderRoutes('/dashboard'); expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })
  it('redirects agents away from the customer portal', () => {
    saveSession({ token: makeToken(), userId: 2, fullName: 'Ari Agent', role: ROLES.AGENT })
    renderRoutes('/my-tickets'); expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })
  it('allows admins to open the Team page', () => {
    saveSession({ token: makeToken(), userId: 3, fullName: 'Ari Admin', role: ROLES.ADMIN })
    renderRoutes(ADMIN_TEAM_PATH); expect(screen.getByRole('heading', { name: 'Team' })).toBeInTheDocument()
  })
  it('redirects agents and customers from Team to their home pages', () => {
    saveSession({ token: makeToken(), userId: 2, fullName: 'Ari Agent', role: ROLES.AGENT })
    renderRoutes(ADMIN_TEAM_PATH); expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    clearSession()
    saveSession({ token: makeToken(), userId: 1, fullName: 'Casey Customer', role: ROLES.CUSTOMER })
    renderRoutes(ADMIN_TEAM_PATH); expect(screen.getByRole('heading', { name: 'My tickets' })).toBeInTheDocument()
  })
  it('redirects logged-out visitors from Team to login', () => {
    renderRoutes(ADMIN_TEAM_PATH); expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
  })
})
