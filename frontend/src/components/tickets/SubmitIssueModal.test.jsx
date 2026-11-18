import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SubmitIssueModal from './SubmitIssueModal.jsx'

vi.mock('@/api/ticketApi.js', () => ({ createTicket: vi.fn() }))
import { createTicket } from '@/api/ticketApi.js'

describe('SubmitIssueModal', () => {
  beforeEach(() => vi.clearAllMocks())
  it('shows inline errors and does not call the API for invalid fields', () => {
    render(<SubmitIssueModal isOpen onClose={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Submit Issue' }))
    expect(screen.getByText('Title must be at least 5 characters.')).toBeInTheDocument()
    expect(screen.getByText('Description must be at least 10 characters.')).toBeInTheDocument()
    expect(createTicket).not.toHaveBeenCalled()
  })
  it('submits trimmed values, reports the created ticket, and closes on success', async () => {
    const ticket = { id: 17, priority: 'CRITICAL', category: 'BILLING' }
    const onCreated = vi.fn(); const onClose = vi.fn()
    createTicket.mockResolvedValue(ticket)
    render(<SubmitIssueModal isOpen onClose={onClose} onCreated={onCreated} />)
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: '  Checkout issue  ' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: '  Checkout fails after payment  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Submit Issue' }))
    await waitFor(() => expect(createTicket).toHaveBeenCalledWith({ title: 'Checkout issue', description: 'Checkout fails after payment' }))
    expect(onCreated).toHaveBeenCalledWith(ticket); expect(onClose).toHaveBeenCalledOnce()
    expect(screen.getByLabelText('Title')).toHaveValue('')
  })
  it('shows the analyzing state and prevents dismissal while pending', async () => {
    let resolveRequest
    const onClose = vi.fn()
    createTicket.mockReturnValue(new Promise((resolve) => { resolveRequest = resolve }))
    render(<SubmitIssueModal isOpen onClose={onClose} />)
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Checkout issue' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Payment checkout is not working.' } })
    const submitButton = screen.getByRole('button', { name: 'Submit Issue' })
    act(() => { fireEvent.click(submitButton); fireEvent.click(submitButton) })
    expect(await screen.findByRole('button', { name: /Analyzing with AI/ })).toBeDisabled()
    expect(createTicket).toHaveBeenCalledOnce()
    expect(screen.getByLabelText('Title')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeDisabled()
    fireEvent.keyDown(document, { key: 'Escape' }); fireEvent.click(screen.getByTestId('modal-backdrop'))
    expect(onClose).not.toHaveBeenCalled(); expect(screen.getByRole('dialog')).toBeInTheDocument()
    await act(async () => { resolveRequest({ id: 18 }); await Promise.resolve() })
  })
  it('shows backend errors and keeps entered text after a failed request', async () => {
    createTicket.mockRejectedValue({ response: { status: 400, data: { message: 'Description is invalid.' } } })
    render(<SubmitIssueModal isOpen onClose={() => {}} />)
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Checkout issue' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Payment checkout is not working.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Submit Issue' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Description is invalid.')
    expect(screen.getByLabelText('Title')).toHaveValue('Checkout issue')
    expect(screen.getByLabelText('Description')).toHaveValue('Payment checkout is not working.')
  })
})
