import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import NotificationBell from './NotificationBell.jsx'

vi.mock('@/api/notificationApi.js', () => ({ getAlerts: vi.fn(), acknowledgeAlert: vi.fn() }))
import { acknowledgeAlert, getAlerts } from '@/api/notificationApi.js'

const alerts = [
  { id: 1, ticketId: 51, ticketTitle: 'Payment outage', alertType: 'CRITICAL_ESCALATION', message: 'Urgent review needed.', acknowledged: false, createdAt: '2026-11-17T10:00:00' },
  { id: 2, ticketId: 52, ticketTitle: 'SLA ticket', alertType: 'SLA_BREACH', message: 'SLA deadline passed.', acknowledged: false, createdAt: '2026-11-17T09:00:00' },
]
function LocationView() { const location = useLocation(); return <output data-testid="current-location">{location.pathname}{location.search}</output> }
function renderBell(data = alerts) {
  getAlerts.mockResolvedValue(data)
  return render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/']}><Routes><Route path="*" element={<><NotificationBell /><LocationView /></>} /></Routes></MemoryRouter>)
}

describe('NotificationBell', () => {
  beforeEach(() => { vi.clearAllMocks(); acknowledgeAlert.mockResolvedValue({}) })
  it('shows the active count and caps the visual badge at 9+', async () => {
    const many = Array.from({ length: 10 }, (_, index) => ({ ...alerts[0], id: index + 1, ticketId: index + 1 }))
    renderBell(many)
    const button = await screen.findByRole('button', { name: 'Notifications, 10 active alerts' })
    expect(button).toHaveAttribute('aria-expanded', 'false'); expect(screen.getByText('9+')).toBeInTheDocument()
  })
  it('opens and closes by button, Escape, and outside click, restoring focus on Escape', async () => {
    renderBell()
    const button = await screen.findByRole('button', { name: 'Notifications, 2 active alerts' })
    fireEvent.click(button); expect(button).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(button); expect(button).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(button); fireEvent.keyDown(document, { key: 'Escape' })
    expect(button).toHaveAttribute('aria-expanded', 'false'); expect(button).toHaveFocus()
    fireEvent.click(button); fireEvent.pointerDown(document.body)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })
  it('acknowledges an alert and decreases the badge', async () => {
    renderBell()
    fireEvent.click(await screen.findByRole('button', { name: 'Notifications, 2 active alerts' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Acknowledge' })[0])
    await waitFor(() => expect(screen.getByRole('button', { name: 'Notifications, 1 active alerts' })).toBeInTheDocument())
    expect(screen.queryByText('Payment outage')).not.toBeInTheDocument(); expect(acknowledgeAlert).toHaveBeenCalledWith(1)
  })
  it('restores a failed acknowledgement and shows its error', async () => {
    acknowledgeAlert.mockRejectedValue({ response: { status: 500, data: { message: 'Could not acknowledge.' } } })
    renderBell()
    fireEvent.click(await screen.findByRole('button', { name: 'Notifications, 2 active alerts' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Acknowledge' })[0])
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not acknowledge.')
    expect(screen.getByRole('button', { name: 'Notifications, 2 active alerts' })).toBeInTheDocument()
    expect(screen.getByText('Payment outage')).toBeInTheDocument()
  })
  it('navigates to the selected ticket and closes the panel', async () => {
    renderBell()
    fireEvent.click(await screen.findByRole('button', { name: 'Notifications, 2 active alerts' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'View ticket' })[0])
    expect(screen.getByTestId('current-location')).toHaveTextContent('/dashboard?ticket=51')
    expect(screen.getByRole('button', { name: 'Notifications, 2 active alerts' })).toHaveAttribute('aria-expanded', 'false')
  })
  it('shows the empty state and retries a loading error', async () => {
    getAlerts.mockRejectedValueOnce({ response: { status: 503, data: { message: 'Notification service unavailable.' } } }).mockResolvedValueOnce([])
    render(<MemoryRouter><NotificationBell /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Notifications, 0 active alerts' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Notification service unavailable.')
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByText('No active alerts')).toBeInTheDocument()
    expect(getAlerts).toHaveBeenCalledTimes(2)
  })
})
