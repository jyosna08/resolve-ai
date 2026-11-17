import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/api/ticketApi.js', () => ({ getTickets: vi.fn() }))
import { getTickets } from '@/api/ticketApi.js'
import useTickets from './useTickets.js'

describe('useTickets refreshKey', () => {
  beforeEach(() => { vi.clearAllMocks(); getTickets.mockResolvedValue([]) })
  it('refetches immediately when refreshKey changes', async () => {
    const { rerender } = renderHook(({ refreshKey }) => useTickets('', refreshKey), { initialProps: { refreshKey: 0 } })
    await waitFor(() => expect(getTickets).toHaveBeenCalledTimes(1))
    await act(async () => { rerender({ refreshKey: 1 }) })
    await waitFor(() => expect(getTickets).toHaveBeenCalledTimes(2))
  })
})
