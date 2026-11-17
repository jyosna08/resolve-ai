import { useState } from 'react'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/context/AuthContext.jsx'
import { clearSession, saveSession } from '@/utils/authStorage.js'
import { CATEGORY, PRIORITY, ROLES, SENTIMENT, TICKET_STATUS } from '@/utils/constants.js'
import DashboardPage from './DashboardPage.jsx'

vi.mock('@/api/ticketApi.js', () => ({
  getTickets: vi.fn(), getDashboardStats: vi.fn(), getTicketComments: vi.fn(), updateTicketStatus: vi.fn(), verifyReply: vi.fn(),
}))
import { getDashboardStats, getTicketComments, getTickets, verifyReply } from '@/api/ticketApi.js'

const openTicket = { id: 101, title: 'Gateway returns payment errors', description: 'Customers cannot complete their purchase.', status: TICKET_STATUS.TO_DO, priority: PRIORITY.CRITICAL, category: CATEGORY.BILLING, sentiment: SENTIMENT.FRUSTRATED, aiSummary: 'Payment gateway failures affect checkout.', aiDraftReply: 'Thanks for reporting this. We are investigating.', assignedAgentName: 'Alex Agent', createdAt: '2026-11-17T08:00:00', slaDeadline: '2026-11-18T08:00:00' }
const stats = { totalOpen: 8, criticalAlerts: 2, resolvedToday: 4, slaWarnings: 1 }

function DashboardHarness() {
  const [search, setSearch] = useState('')
  const location = useLocation()
  return <><label>Harness search<input aria-label="Harness search" value={search} onChange={(event) => setSearch(event.target.value)} /></label><output data-testid="current-url">{location.pathname}{location.search}</output><Outlet context={{ search, setSearch, openSubmitIssue: vi.fn() }} /></>
}

function renderPage(initialEntries = ['/']) {
  return render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={initialEntries}><AuthProvider><Routes><Route element={<DashboardHarness />}><Route path="*" element={<DashboardPage />} /></Route></Routes></AuthProvider></MemoryRouter>)
}

function setAgentSession() {
  const exp = Math.floor(Date.now() / 1000) + 3600
  saveSession({ token: `header.${btoa(JSON.stringify({ exp }))}.signature`, userId: 10, fullName: 'Alex Agent', role: ROLES.AGENT })
}

describe('DashboardPage', () => {
  beforeEach(() => {
    clearSession(); setAgentSession(); vi.clearAllMocks()
    getTickets.mockResolvedValue([openTicket]); getDashboardStats.mockResolvedValue(stats); getTicketComments.mockResolvedValue([])
  })
  afterEach(() => { vi.useRealTimers() })

  it('shows loading skeletons, then board tickets and KPI values', async () => {
    let resolveTickets
    getTickets.mockReturnValueOnce(new Promise((resolve) => { resolveTickets = resolve }))
    renderPage()
    expect(screen.getAllByLabelText('Loading tickets')).toHaveLength(3)
    expect(screen.getAllByText('Total Open')).toHaveLength(1)
    await act(async () => { resolveTickets([openTicket]); await Promise.resolve() })
    expect(await screen.findByRole('button', { name: /Gateway returns payment errors/ })).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument(); expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('shows a retry banner and keeps existing cards after background refresh failure', async () => {
    renderPage()
    expect(await screen.findByRole('button', { name: /Gateway returns payment errors/ })).toBeInTheDocument()
    getTickets.mockRejectedValueOnce({ response: { status: 500, data: { message: 'Ticket service unavailable' } } })
    fireEvent.change(screen.getByLabelText('Harness search'), { target: { value: 'checkout' } })
    expect(await screen.findByRole('alert')).toHaveTextContent('Ticket service unavailable')
    expect(screen.getByRole('button', { name: /Gateway returns payment errors/ })).toBeInTheDocument()
    getTickets.mockResolvedValueOnce([openTicket])
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await waitFor(() => expect(getTickets).toHaveBeenCalledTimes(3))
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: /Gateway returns payment errors/ })).toBeInTheDocument()
  })

  it('requests server-side search only after the debounce', async () => {
    vi.useFakeTimers()
    renderPage()
    await act(async () => { await Promise.resolve() })
    expect(getTickets).toHaveBeenCalledTimes(1)
    fireEvent.change(screen.getByLabelText('Harness search'), { target: { value: 'checkout' } })
    act(() => vi.advanceTimersByTime(399)); expect(getTickets).toHaveBeenCalledTimes(1)
    await act(async () => { vi.advanceTimersByTime(1); await Promise.resolve(); await Promise.resolve() })
    expect(getTickets).toHaveBeenCalledTimes(2)
    expect(getTickets).toHaveBeenLastCalledWith({ search: 'checkout' }, expect.objectContaining({ signal: expect.any(AbortSignal) }))
  })

  it('opens the drawer, verifies a reply, moves the card to resolved, and refreshes KPIs', async () => {
    const resolved = { ...openTicket, status: TICKET_STATUS.RESOLVED }
    verifyReply.mockResolvedValue(resolved)
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: /Gateway returns payment errors/ }))
    expect(screen.getByRole('dialog', { name: 'AI Co-Pilot Triage' })).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Editable Draft Response'), { target: { value: '  The payment service is restored now.  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Verify & Send Reply' }))
    await waitFor(() => expect(verifyReply).toHaveBeenCalledWith(openTicket.id, 'The payment service is restored now.'))
    const resolvedLane = within(screen.getByRole('region', { name: 'RESOLVED tickets' }))
    await waitFor(() => expect(resolvedLane.getByRole('button', { name: /Gateway returns payment errors/ })).toBeInTheDocument())
    expect(getDashboardStats).toHaveBeenCalledTimes(2)
  })

  it('loads the latest tickets after a visible 30-second polling interval', async () => {
    vi.useFakeTimers()
    renderPage()
    await act(async () => { await Promise.resolve() })
    expect(getTickets).toHaveBeenCalledTimes(1)
    await act(async () => { vi.advanceTimersByTime(30000); await Promise.resolve(); await Promise.resolve() })
    expect(getTickets).toHaveBeenCalledTimes(2)
    expect(getDashboardStats).toHaveBeenCalledTimes(2)
  })

  it('opens and clears a valid ticket deep link after the ticket list loads', async () => {
    renderPage(['/dashboard?ticket=101'])
    expect(await screen.findByRole('dialog', { name: 'AI Co-Pilot Triage' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByTestId('current-url')).toHaveTextContent(/^\/dashboard$/))
    expect(within(screen.getByRole('dialog', { name: 'AI Co-Pilot Triage' })).getByRole('heading', { name: 'Gateway returns payment errors' })).toBeInTheDocument()
  })

  it('silently ignores an unknown ticket deep link', async () => {
    renderPage(['/dashboard?ticket=999'])
    expect(await screen.findByRole('button', { name: /Gateway returns payment errors/ })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByTestId('current-url')).toHaveTextContent('/dashboard?ticket=999')
  })
})
