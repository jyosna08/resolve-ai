import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/context/AuthContext.jsx'
import { clearSession, saveSession } from '@/utils/authStorage.js'
import { CATEGORY, PRIORITY, ROLES, SENTIMENT, TICKET_STATUS } from '@/utils/constants.js'
import MyTicketsPage from './MyTicketsPage.jsx'

vi.mock('@/api/ticketApi.js', () => ({ getTickets: vi.fn(), getTicketComments: vi.fn() }))
import { getTicketComments, getTickets } from '@/api/ticketApi.js'

const privateFields = { aiSummary: 'PRIVATE_AI_SUMMARY_SENTINEL', aiDraftReply: 'PRIVATE_AI_DRAFT_SENTINEL', sentiment: SENTIMENT.FRUSTRATED, priority: PRIORITY.CRITICAL, category: CATEGORY.BILLING, assignedAgentName: 'PRIVATE_AGENT_SENTINEL', slaDeadline: '2026-12-01T10:00:00' }
const tickets = [
  { id: 1, title: 'Older resolved request', description: 'Description one', status: TICKET_STATUS.RESOLVED, createdAt: '2026-11-15T10:00:00', ...privateFields },
  { id: 2, title: 'Current progress request', description: 'Description two', status: TICKET_STATUS.IN_PROGRESS, createdAt: '2026-11-16T10:00:00', ...privateFields },
  { id: 3, title: 'Newest received request', description: 'Description three', status: TICKET_STATUS.TO_DO, createdAt: '2026-11-17T10:00:00', ...privateFields },
]

function Harness({ openSubmitIssue }) { return <Outlet context={{ openSubmitIssue, ticketsVersion: 0 }} /> }
function renderPage({ data = tickets, openSubmitIssue = vi.fn() } = {}) {
  const exp = Math.floor(Date.now() / 1000) + 3600
  saveSession({ token: `header.${btoa(JSON.stringify({ exp }))}.signature`, userId: 3, fullName: 'Customer One', role: ROLES.CUSTOMER })
  getTickets.mockResolvedValue(data)
  return { ...render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AuthProvider><Routes><Route element={<Harness openSubmitIssue={openSubmitIssue} />}><Route path="/" element={<MyTicketsPage />} /></Route></Routes></AuthProvider></MemoryRouter>), openSubmitIssue }
}

describe('MyTicketsPage', () => {
  beforeEach(() => { clearSession(); vi.clearAllMocks(); getTicketComments.mockResolvedValue([]) })
  afterEach(() => vi.useRealTimers())
  it('shows loading skeletons, newest-first tickets, tab filters, and counts', async () => {
    let resolveTickets
    getTickets.mockReturnValueOnce(new Promise((resolve) => { resolveTickets = resolve }))
    const exp = Math.floor(Date.now() / 1000) + 3600
    saveSession({ token: `header.${btoa(JSON.stringify({ exp }))}.signature`, userId: 3, fullName: 'Customer One', role: ROLES.CUSTOMER })
    const view = render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AuthProvider><Routes><Route element={<Harness openSubmitIssue={vi.fn()} />}><Route path="/" element={<MyTicketsPage />} /></Route></Routes></AuthProvider></MemoryRouter>)
    expect(view.container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
    await act(async () => { resolveTickets(tickets); await Promise.resolve() })
    const cards = screen.getAllByRole('button', { name: /Open ticket/ })
    expect(cards.map((card) => card.getAttribute('aria-label'))).toEqual(['Open ticket Newest received request', 'Open ticket Current progress request', 'Open ticket Older resolved request'])
    expect(screen.getByRole('tab', { name: /All/ })).toHaveTextContent('3')
    fireEvent.click(screen.getByRole('tab', { name: /In Progress/ }))
    expect(screen.getAllByRole('button', { name: /Open ticket/ })).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Open ticket Current progress request' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /In Progress/ })).toHaveTextContent('1')
  })
  it('shows the first-ticket empty state and calls the submit action', async () => {
    const openSubmitIssue = vi.fn()
    renderPage({ data: [], openSubmitIssue })
    expect(await screen.findByText('No tickets yet')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Submit your first issue' }))
    expect(openSubmitIssue).toHaveBeenCalledOnce()
  })
  it('preserves old tickets on failure and Retry refetches', async () => {
    vi.useFakeTimers()
    renderPage()
    await act(async () => { await Promise.resolve(); await Promise.resolve() })
    expect(screen.getByRole('button', { name: 'Open ticket Newest received request' })).toBeInTheDocument()
    getTickets.mockRejectedValueOnce({ response: { status: 500, data: { message: 'Ticket list unavailable' } } })
    await act(async () => { vi.advanceTimersByTime(30000); await Promise.resolve(); await Promise.resolve() })
    expect(screen.getByRole('alert')).toHaveTextContent('Ticket list unavailable')
    expect(screen.getByRole('button', { name: 'Open ticket Newest received request' })).toBeInTheDocument()
    getTickets.mockResolvedValueOnce(tickets)
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Retry' })); await Promise.resolve(); await Promise.resolve() })
    expect(getTickets).toHaveBeenCalledTimes(3)
    expect(screen.getByRole('button', { name: 'Open ticket Newest received request' })).toBeInTheDocument()
  })
  it('shows replies and never renders internal AI or assignment fields', async () => {
    getTicketComments.mockResolvedValue([{ id: 10, authorName: 'Support Agent', message: 'We are looking into this.', aiVerified: true, createdAt: '2026-11-17T11:00:00' }])
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: 'Open ticket Newest received request' }))
    expect(await screen.findByText('We are looking into this.')).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: /Ticket 3/ })).toBeInTheDocument()
    for (const internalText of ['PRIVATE_AI_SUMMARY_SENTINEL', 'PRIVATE_AI_DRAFT_SENTINEL', 'Frustrated', 'CRITICAL', 'Billing', 'PRIVATE_AGENT_SENTINEL', 'SLA']) expect(screen.queryByText(new RegExp(internalText, 'i'))).not.toBeInTheDocument()
  })
  it('shows the friendly no-replies state', async () => {
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: 'Open ticket Newest received request' }))
    expect(await screen.findByText('No replies yet — our team is on it.')).toBeInTheDocument()
  })
})
