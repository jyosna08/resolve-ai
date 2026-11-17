import { describe, expect, it } from 'vitest'
import { formatDateTime, formatSlaStatus } from './formatters.js'
import { TICKET_STATUS } from './constants.js'

const now = new Date(2026, 0, 1, 10, 0, 0).getTime()
const localString = (offsetMinutes) => {
  const date = new Date(now + offsetMinutes * 60000)
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}

describe('ticket formatters', () => {
  it('formats due and overdue local SLA deadlines', () => {
    expect(formatSlaStatus(localString(320), TICKET_STATUS.TO_DO, now)).toMatchObject({ text: 'Due in 5h 20m', isOverdue: false, isWarning: false })
    expect(formatSlaStatus(localString(-130), TICKET_STATUS.IN_PROGRESS, now)).toMatchObject({ text: 'Overdue by 2h 10m', isOverdue: true, isWarning: true })
  })
  it('flags warning-window, resolved, and missing-deadline cases', () => {
    expect(formatSlaStatus(localString(120), TICKET_STATUS.TO_DO, now)?.isWarning).toBe(true)
    expect(formatSlaStatus(localString(121), TICKET_STATUS.TO_DO, now)?.isWarning).toBe(false)
    expect(formatSlaStatus(localString(10), TICKET_STATUS.RESOLVED, now)).toBeNull()
    expect(formatSlaStatus('', TICKET_STATUS.TO_DO, now)).toBeNull()
  })
  it('formats date-time locally and handles missing or invalid values', () => {
    expect(formatDateTime('2026-01-01T10:00:00')).not.toBe('—')
    expect(formatDateTime('invalid')).toBe('—')
  })
})
