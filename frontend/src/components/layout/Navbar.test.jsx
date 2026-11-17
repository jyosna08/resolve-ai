import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/context/AuthContext.jsx'
import { clearSession, saveSession } from '@/utils/authStorage.js'
import { ROLES } from '@/utils/constants.js'
import Navbar from './Navbar.jsx'

vi.mock('@/api/notificationApi.js', () => ({ getAlerts: vi.fn(), acknowledgeAlert: vi.fn() }))
import { getAlerts } from '@/api/notificationApi.js'

function renderNavbar(role) {
  const exp = Math.floor(Date.now() / 1000) + 3600
  saveSession({ token: `header.${btoa(JSON.stringify({ exp }))}.signature`, userId: 5, fullName: 'Sample User', role })
  return render(<MemoryRouter><AuthProvider><Navbar search="" setSearch={() => {}} openSubmitIssue={() => {}} /></AuthProvider></MemoryRouter>)
}

describe('Navbar notifications by role', () => {
  beforeEach(() => { clearSession(); vi.clearAllMocks(); getAlerts.mockResolvedValue([]) })
  it.each([ROLES.AGENT, ROLES.ADMIN])('mounts alerts for %s', async (role) => {
    renderNavbar(role)
    expect(await screen.findByRole('button', { name: 'Notifications, 0 active alerts' })).toBeInTheDocument()
    expect(getAlerts).toHaveBeenCalledOnce()
  })
  it('does not mount the bell or request alerts for a customer', () => {
    renderNavbar(ROLES.CUSTOMER)
    expect(screen.queryByRole('button', { name: /Notifications/ })).not.toBeInTheDocument()
    expect(getAlerts).not.toHaveBeenCalled()
  })
})
