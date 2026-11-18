import { describe, expect, it } from 'vitest'
import { parseApiDateTime, toEpochMs } from './dateTime.js'

describe('API date-time parsing', () => {
  it('interprets a zone-less API timestamp as UTC', () => {
    expect(parseApiDateTime('2026-11-17T12:54:00')?.getTime())
      .toBe(Date.UTC(2026, 10, 17, 12, 54))
  })

  it('preserves UTC and explicit numeric offsets', () => {
    expect(toEpochMs('2026-11-17T12:54:00Z')).toBe(Date.UTC(2026, 10, 17, 12, 54))
    expect(toEpochMs('2026-11-17T12:54:00+05:30')).toBe(Date.UTC(2026, 10, 17, 7, 24))
    expect(toEpochMs('2026-11-17T12:54:00-0530')).toBe(Date.UTC(2026, 10, 17, 18, 24))
  })

  it('accepts a space separator and fractional seconds with six digits', () => {
    expect(toEpochMs('2026-11-17 12:54:00')).toBe(Date.UTC(2026, 10, 17, 12, 54))
    expect(toEpochMs('2026-11-17T12:54:00.123456')).toBe(Date.UTC(2026, 10, 17, 12, 54) + 123)
  })

  it('returns null for blank, invalid, and non-string input', () => {
    expect(parseApiDateTime('')).toBeNull()
    expect(parseApiDateTime('  ')).toBeNull()
    expect(parseApiDateTime('not a timestamp')).toBeNull()
    expect(parseApiDateTime('2026-02-30T12:54:00')).toBeNull()
    expect(parseApiDateTime(1794920040000)).toBeNull()
    expect(toEpochMs(null)).toBeNull()
  })
})
