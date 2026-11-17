import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useOutletContext } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/context/AuthContext.jsx'
import { clearSession, saveSession } from '@/utils/authStorage.js'
import { ROLES } from '@/utils/constants.js'
import AppLayout from './AppLayout.jsx'

vi.mock('@/api/ticketApi.js', () => ({ createTicket: vi.fn() }))
vi.mock('@/api/notificationApi.js', () => ({ getAlerts: vi.fn(), acknowledgeAlert: vi.fn() }))
import { createTicket } from '@/api/ticketApi.js'
import { getAlerts } from '@/api/notificationApi.js'

function makeToken() { return `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.signature` }
function ContextView() { const context = useOutletContext(); return <p data-testid="tickets-version">{context.ticketsVersion}</p> }
function renderLayout(role) {
  saveSession({ token: makeToken(), userId: 1, fullName: 'Test User', role })
  return render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AuthProvider><Routes><Route element={<AppLayout />}><Route path="/" element={<ContextView />} /></Route></Routes></AuthProvider></MemoryRouter>)
}

describe('AppLayout submit flow', () => {
  beforeEach(() => { clearSession(); vi.clearAllMocks(); getAlerts.mockResolvedValue([]) })
  it('opens the submission modal from the navbar button', () => {
    renderLayout(ROLES.AGENT)
    fireEvent.click(screen.getByRole('button', { name: 'Submit Issue' }))
    expect(screen.getByRole('dialog', { name: 'Submit an issue' })).toBeInTheDocument()
  })
  it('increments ticketsVersion, shows triage details for agents, and dismisses the notice', async () => {
    createTicket.mockResolvedValue({ id: 71, priority: 'HIGH', category: 'FRONTEND' })
    renderLayout(ROLES.AGENT)
    fireEvent.click(screen.getByRole('button', { name: 'Submit Issue' }))
    const dialog = within(screen.getByRole('dialog', { name: 'Submit an issue' }))
    fireEvent.change(dialog.getByLabelText('Title'), { target: { value: 'Layout issue' } })
    fireEvent.change(dialog.getByLabelText('Description'), { target: { value: 'The page layout has a visible issue.' } })
    fireEvent.click(dialog.getByRole('button', { name: 'Submit Issue' }))
    expect(await screen.findByText('Ticket #71 submitted. AI set priority HIGH in Frontend.')).toBeInTheDocument()
    expect(screen.getByTestId('tickets-version')).toHaveTextContent('1')
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notice' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
  it('keeps customer notices free of internal triage details', async () => {
    createTicket.mockResolvedValue({ id: 72, priority: 'CRITICAL', category: 'BILLING' })
    renderLayout(ROLES.CUSTOMER)
    fireEvent.click(screen.getByRole('button', { name: 'Submit Issue' }))
    const dialog = within(screen.getByRole('dialog', { name: 'Submit an issue' }))
    fireEvent.change(dialog.getByLabelText('Title'), { target: { value: 'Charge issue' } })
    fireEvent.change(dialog.getByLabelText('Description'), { target: { value: 'I have a question about this charge.' } })
    fireEvent.click(dialog.getByRole('button', { name: 'Submit Issue' }))
    expect(await screen.findByText('Ticket #72 submitted. Our team will review it shortly.')).toBeInTheDocument()
    expect(screen.getByRole('status')).not.toHaveTextContent('CRITICAL')
    expect(screen.getByRole('status')).not.toHaveTextContent('Billing')
    await waitFor(() => expect(screen.getByTestId('tickets-version')).toHaveTextContent('1'))
    expect(getAlerts).not.toHaveBeenCalled()
  })
})
