import { describe, expect, it } from 'vitest'
import { isRequestCanceled } from './errors.js'

describe('isRequestCanceled', () => {
  it('recognizes Axios cancellation shapes', () => {
    expect(isRequestCanceled({ code: 'ERR_CANCELED' })).toBe(true)
    expect(isRequestCanceled({ name: 'CanceledError' })).toBe(true)
    expect(isRequestCanceled({ __CANCEL__: true })).toBe(true)
    expect(isRequestCanceled(new Error('other'))).toBe(false)
  })
})
