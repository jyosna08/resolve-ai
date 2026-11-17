import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import usePolling from './usePolling.js'

describe('usePolling', () => {
  afterEach(() => { vi.useRealTimers(); delete document.hidden })
  it('calls the latest callback on each interval and skips hidden-page ticks', () => {
    vi.useFakeTimers()
    const callback = vi.fn()
    const { rerender, unmount } = renderHook(({ fn }) => usePolling(fn, 1000), { initialProps: { fn: callback } })
    act(() => vi.advanceTimersByTime(1000)); expect(callback).toHaveBeenCalledTimes(1)
    const next = vi.fn(); rerender({ fn: next });
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    act(() => vi.advanceTimersByTime(1000)); expect(next).not.toHaveBeenCalled()
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
    act(() => vi.advanceTimersByTime(1000)); expect(next).toHaveBeenCalledTimes(1)
    unmount(); expect(vi.getTimerCount()).toBe(0)
  })
})
