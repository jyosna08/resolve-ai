import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import useSubmitGuard from './useSubmitGuard.js'

describe('useSubmitGuard', () => {
  it('runs only one same-tick call and allows a later call after completion', async () => {
    const { result } = renderHook(() => useSubmitGuard())
    let release
    let calls = 0
    const action = vi.fn(() => calls++ === 0 ? new Promise((resolve) => { release = resolve }) : Promise.resolve('done'))
    let first
    let second
    act(() => {
      first = result.current.runOnce(action)
      second = result.current.runOnce(action)
    })
    expect(action).toHaveBeenCalledOnce()
    await expect(second).resolves.toBeUndefined()
    expect(result.current.isSubmitting).toBe(true)
    await act(async () => { release('done'); await first })
    expect(result.current.isSubmitting).toBe(false)
    await act(async () => { await result.current.runOnce(action) })
    expect(action).toHaveBeenCalledTimes(2)
  })

  it('clears the guard when the action throws', async () => {
    const { result } = renderHook(() => useSubmitGuard())
    const action = vi.fn().mockRejectedValue(new Error('failed'))
    await act(async () => { await expect(result.current.runOnce(action)).rejects.toThrow('failed') })
    expect(result.current.isSubmitting).toBe(false)
    await act(async () => { await expect(result.current.runOnce(action)).rejects.toThrow('failed') })
    expect(action).toHaveBeenCalledTimes(2)
  })

  it('does not update state after unmount while the action is pending', async () => {
    const { result, unmount } = renderHook(() => useSubmitGuard())
    let release
    let request
    act(() => { request = result.current.runOnce(() => new Promise((resolve) => { release = resolve })) })
    unmount()
    await act(async () => { release('done'); await request })
  })
})
