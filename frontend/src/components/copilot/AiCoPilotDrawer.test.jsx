import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { CATEGORY, PRIORITY, SENTIMENT, TICKET_STATUS } from '@/utils/constants.js'
import AiCoPilotDrawer from './AiCoPilotDrawer.jsx'

vi.mock('@/api/ticketApi.js', () => ({ getTicketComments: vi.fn(), updateTicketStatus: vi.fn(), verifyReply: vi.fn() }))
import { getTicketComments, updateTicketStatus, verifyReply } from '@/api/ticketApi.js'

const makeTicket = (overrides = {}) => ({
  id: 51, title: 'Payment gateway failure', description: 'Customers cannot complete checkout.', status: TICKET_STATUS.TO_DO,
  priority: PRIORITY.CRITICAL, category: CATEGORY.BILLING, sentiment: SENTIMENT.FRUSTRATED,
  aiSummary: 'Checkout requests fail with server errors.', aiDraftReply: 'Thank you. We are investigating this issue.',
  assignedAgentName: 'Morgan Agent', createdAt: '2026-11-17T10:00:00', slaDeadline: '2026-11-17T18:00:00', ...overrides,
})

describe('AiCoPilotDrawer', () => {
  beforeEach(() => { vi.clearAllMocks(); getTicketComments.mockResolvedValue([]) })
  it('shows ticket triage details, summary, sentiment, and draft', () => {
    render(<AiCoPilotDrawer ticket={makeTicket()} isOpen onClose={() => {}} />)
    expect(screen.getByRole('dialog', { name: 'AI Co-Pilot Triage' })).toBeInTheDocument()
    expect(screen.getByText('Payment gateway failure')).toBeInTheDocument()
    expect(screen.getByText('Customers cannot complete checkout.')).toBeInTheDocument()
    expect(screen.getByText('Checkout requests fail with server errors.')).toBeInTheDocument()
    expect(screen.getByText('Frustrated')).toBeInTheDocument()
    expect(screen.getByLabelText('Editable Draft Response')).toHaveValue('Thank you. We are investigating this issue.')
  })
  it('validates a short reply without calling the API', () => {
    render(<AiCoPilotDrawer ticket={makeTicket()} isOpen onClose={() => {}} />)
    fireEvent.change(screen.getByLabelText('Editable Draft Response'), { target: { value: 'bad' } })
    fireEvent.click(screen.getByRole('button', { name: 'Verify & Send Reply' }))
    expect(screen.getByText('Reply must be at least 5 characters.')).toBeInTheDocument()
    expect(verifyReply).not.toHaveBeenCalled()
  })
  it('sends the edited trimmed reply and updates the ticket', async () => {
    const updated = makeTicket({ status: TICKET_STATUS.RESOLVED })
    verifyReply.mockResolvedValue(updated)
    const onTicketUpdated = vi.fn()
    render(<AiCoPilotDrawer ticket={makeTicket()} isOpen onClose={() => {}} onTicketUpdated={onTicketUpdated} />)
    fireEvent.change(screen.getByLabelText('Editable Draft Response'), { target: { value: '  We have fixed your checkout issue.  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Verify & Send Reply' }))
    await waitFor(() => expect(verifyReply).toHaveBeenCalledWith(51, 'We have fixed your checkout issue.'))
    expect(onTicketUpdated).toHaveBeenCalledWith(updated)
  })
  it('shows a backend conflict message and requests a refresh', async () => {
    verifyReply.mockRejectedValue({ response: { status: 409, data: { message: 'Ticket already resolved' } } })
    const onRefresh = vi.fn()
    render(<AiCoPilotDrawer ticket={makeTicket()} isOpen onClose={() => {}} onRefresh={onRefresh} />)
    fireEvent.click(screen.getByRole('button', { name: 'Verify & Send Reply' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Ticket already resolved')
    expect(onRefresh).toHaveBeenCalledOnce()
  })
  it('sends only one verify request for two rapid clicks', () => {
    verifyReply.mockReturnValue(new Promise(() => {}))
    render(<AiCoPilotDrawer ticket={makeTicket()} isOpen onClose={() => {}} />)
    const button = screen.getByRole('button', { name: 'Verify & Send Reply' })
    act(() => { fireEvent.click(button); fireEvent.click(button) })
    expect(verifyReply).toHaveBeenCalledOnce()
    expect(button).toBeDisabled()
  })
  it('shows resolved tickets read-only with comments', async () => {
    getTicketComments.mockResolvedValue([{ id: 2, authorName: 'Morgan Agent', message: 'Resolved with a verified reply.', aiVerified: true, createdAt: '2026-11-17T11:00:00' }])
    render(<AiCoPilotDrawer ticket={makeTicket({ status: TICKET_STATUS.RESOLVED })} isOpen onClose={() => {}} />)
    expect(screen.queryByRole('button', { name: 'Verify & Send Reply' })).not.toBeInTheDocument()
    expect(await screen.findByText('Resolved with a verified reply.')).toBeInTheDocument()
    expect(screen.getByText('AI-verified')).toBeInTheDocument()
  })
  it('starts progress and sends the enum status', async () => {
    const updated = makeTicket({ status: TICKET_STATUS.IN_PROGRESS })
    updateTicketStatus.mockResolvedValue(updated)
    render(<AiCoPilotDrawer ticket={makeTicket()} isOpen onClose={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Start Progress' }))
    await waitFor(() => expect(updateTicketStatus).toHaveBeenCalledWith(51, TICKET_STATUS.IN_PROGRESS))
  })
  it('closes on Escape and preserves typed draft across same-ticket rerenders', () => {
    const onClose = vi.fn()
    const { rerender } = render(<AiCoPilotDrawer ticket={makeTicket()} isOpen onClose={onClose} />)
    fireEvent.change(screen.getByLabelText('Editable Draft Response'), { target: { value: 'Agent is writing a custom response.' } })
    rerender(<AiCoPilotDrawer ticket={makeTicket({ aiDraftReply: 'A refreshed server draft.' })} isOpen onClose={onClose} />)
    expect(screen.getByLabelText('Editable Draft Response')).toHaveValue('Agent is writing a custom response.')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })
  it('moves focus into the dialog and restores the trigger focus when closed', () => {
    function Harness() {
      const [isOpen, setIsOpen] = useState(false)
      return <><button type="button" onClick={() => setIsOpen(true)}>Open ticket</button><AiCoPilotDrawer ticket={makeTicket()} isOpen={isOpen} onClose={() => setIsOpen(false)} /></>
    }
    render(<Harness />)
    const trigger = screen.getByRole('button', { name: 'Open ticket' })
    trigger.focus()
    fireEvent.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'AI Co-Pilot Triage' })
    expect(dialog).toHaveFocus()
    fireEvent.click(screen.getByRole('button', { name: 'Close AI Co-Pilot' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
