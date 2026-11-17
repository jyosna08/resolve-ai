import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/api/notificationApi.js', () => ({ getAlerts: vi.fn(), acknowledgeAlert: vi.fn() }))
import { acknowledgeAlert, getAlerts } from '@/api/notificationApi.js'
import useAlerts from './useAlerts.js'

const alerts = [
  { id: 1, ticketId: 11, ticketTitle: 'Critical ticket', alertType: 'CRITICAL_ESCALATION', message: 'Critical issue needs review.', acknowledged: false, createdAt: '2026-11-17T10:00:00' },
  { id: 2, ticketId: 12, ticketTitle: 'SLA breach ticket', alertType: 'SLA_BREACH', message: 'The deadline passed.', acknowledged: false, createdAt: '2026-11-17T09:00:00' },
]

describe('useAlerts', () => {
  beforeEach(() => { vi.clearAllMocks(); getAlerts.mockResolvedValue(alerts); acknowledgeAlert.mockResolvedValue({}) })
  afterEach(() => vi.useRealTimers())
  it('loads active alerts and polls every refresh interval', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useAlerts())
    await act(async () => { await Promise.resolve(); await Promise.resolve() })
    expect(result.current.alerts).toEqual(alerts); expect(result.current.count).toBe(2)
    await act(async () => { vi.advanceTimersByTime(30000); await Promise.resolve(); await Promise.resolve() })
    expect(getAlerts).toHaveBeenCalledTimes(2)
  })
  it('removes an alert optimistically and keeps it removed on success', async () => {
    let resolveAck
    acknowledgeAlert.mockReturnValue(new Promise((resolve) => { resolveAck = resolve }))
    const { result } = renderHook(() => useAlerts())
    await waitFor(() => expect(result.current.count).toBe(2))
    let acknowledgement
    act(() => { acknowledgement = result.current.acknowledge(1) })
    expect(result.current.count).toBe(1); expect(result.current.alerts[0].id).toBe(2)
    await act(async () => { resolveAck({}); await acknowledgement })
    expect(result.current.count).toBe(1); expect(acknowledgeAlert).toHaveBeenCalledWith(1)
  })
  it('rolls back a failed acknowledge and exposes the error', async () => {
    acknowledgeAlert.mockRejectedValue({ response: { status: 500, data: { message: 'Acknowledge failed.' } } })
    const { result } = renderHook(() => useAlerts())
    await waitFor(() => expect(result.current.count).toBe(2))
    await act(async () => { await result.current.acknowledge(1) })
    expect(result.current.alerts.map((alert) => alert.id)).toEqual([1, 2])
    expect(result.current.error).toBe('Acknowledge failed.')
  })
  it('preserves existing alerts when a background refresh fails', async () => {
    const { result } = renderHook(() => useAlerts())
    await waitFor(() => expect(result.current.count).toBe(2))
    getAlerts.mockRejectedValueOnce({ response: { status: 503, data: { message: 'Alerts offline.' } } })
    await act(async () => { result.current.refresh(); await Promise.resolve(); await Promise.resolve() })
    expect(result.current.count).toBe(2); expect(result.current.alerts).toEqual(alerts); expect(result.current.error).toBe('Alerts offline.')
  })
})
