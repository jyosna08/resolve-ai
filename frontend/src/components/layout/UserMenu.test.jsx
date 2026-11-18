import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext.jsx'
import { clearSession, saveSession } from '@/utils/authStorage.js'
import { ADMIN_TEAM_PATH, ROLES } from '@/utils/constants.js'
import UserMenu from './UserMenu.jsx'

function makeToken() { return `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.signature` }
function renderMenu(role) {
  saveSession({ token: makeToken(), userId: 1, fullName: 'Test User', role })
  return render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AuthProvider><UserMenu /></AuthProvider></MemoryRouter>)
}

describe('UserMenu team link', () => {
  beforeEach(() => clearSession())
  it('shows Team for admins only', () => {
    const { unmount } = renderMenu(ROLES.ADMIN)
    expect(screen.getByRole('link', { name: 'Team' })).toHaveAttribute('href', ADMIN_TEAM_PATH)
    unmount(); clearSession()
    renderMenu(ROLES.AGENT)
    expect(screen.queryByRole('link', { name: 'Team' })).not.toBeInTheDocument()
  })
  it('hides Team for customers', () => {
    renderMenu(ROLES.CUSTOMER)
    expect(screen.queryByRole('link', { name: 'Team' })).not.toBeInTheDocument()
  })
})
