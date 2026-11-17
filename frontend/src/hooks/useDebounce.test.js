import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import useDebounce from './useDebounce.js'

describe('useDebounce', () => {
  afterEach(() => vi.useRealTimers())
  it('returns the initial value then updates only after the delay', () => {
    vi.useFakeTimers()
    const { result, rerender, unmount } = renderHook(({ value }) => useDebounce(value, 400), { initialProps: { value: 'first' } })
    expect(result.current).toBe('first')
    rerender({ value: 'second' })
    act(() => vi.advanceTimersByTime(399)); expect(result.current).toBe('first')
    act(() => vi.advanceTimersByTime(1)); expect(result.current).toBe('second')
    rerender({ value: 'third' }); unmount(); expect(vi.getTimerCount()).toBe(0)
  })
})
