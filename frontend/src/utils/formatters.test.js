import { describe, expect, it } from 'vitest'
import { formatDateTime, formatSlaStatus } from './formatters.js'
import { TICKET_STATUS } from './constants.js'

const now = Date.UTC(2026, 10, 17, 12, 54)

describe('ticket formatters', () => {
  it('treats a zone-less SLA deadline as UTC regardless of the machine time zone', () => {
    expect(formatSlaStatus('2026-11-18T12:54:00', TICKET_STATUS.TO_DO, now))
      .toMatchObject({ text: 'Due in 24h', isOverdue: false, isWarning: false })
  })
  it('formats overdue and warning SLA deadlines using UTC instants', () => {
    expect(formatSlaStatus('2026-11-17T10:44:00', TICKET_STATUS.IN_PROGRESS, now))
      .toMatchObject({ text: 'Overdue by 2h 10m', isOverdue: true, isWarning: true })
    expect(formatSlaStatus('2026-11-17T14:54:00', TICKET_STATUS.TO_DO, now)?.isWarning).toBe(true)
    expect(formatSlaStatus('2026-11-17T14:55:00', TICKET_STATUS.TO_DO, now)?.isWarning).toBe(false)
  })
  it('returns null for resolved tickets and missing deadlines', () => {
    expect(formatSlaStatus('2026-11-18T12:54:00', TICKET_STATUS.RESOLVED, now)).toBeNull()
    expect(formatSlaStatus('', TICKET_STATUS.TO_DO, now)).toBeNull()
  })
  it('formats UTC API date-times in the viewer local time zone and handles invalid values', () => {
    const instant = Date.UTC(2026, 10, 17, 12, 54)
    const expected = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(instant))
    expect(formatDateTime('2026-11-17T12:54:00')).toBe(expected)
    expect(formatDateTime('invalid')).toBe('—')
    expect(formatDateTime(null)).toBe('—')
  })
})
