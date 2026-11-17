import { describe, expect, it } from 'vitest'
import { decodeJwtPayload, isTokenExpired } from './jwt.js'

function token(payload) { return `eyJhbGciOiJub25lIn0.${btoa(JSON.stringify(payload)).replace(/=/g, '')}.sig` }

describe('JWT helpers', () => {
  it('decodes a base64url payload', () => { expect(decodeJwtPayload(token({ sub: '1', exp: 99 }))).toEqual({ sub: '1', exp: 99 }) })
  it('returns null for garbage', () => { expect(decodeJwtPayload('garbage')).toBeNull() })
  it('checks expired, valid, and missing expiration claims', () => {
    expect(isTokenExpired(token({ exp: 99 }), 100_000)).toBe(true)
    expect(isTokenExpired(token({ exp: 101 }), 100_000)).toBe(false)
    expect(isTokenExpired(token({ sub: '1' }), 100_000)).toBe(true)
  })
})
