import { SLA_WARNING_MINUTES, TICKET_STATUS } from './constants.js'

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

export function formatDateTime(isoString) {
  if (!isoString) return '—'
  const date = new Date(isoString)
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormatter.format(date)
}

function parseLocalDateTime(value) {
  if (typeof value !== 'string') return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function formatDuration(totalMinutes) {
  const minutes = Math.max(1, Math.floor(totalMinutes))
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return [hours ? `${hours}h` : '', rest ? `${rest}m` : ''].filter(Boolean).join(' ')
}

export function formatSlaStatus(slaDeadline, status, now = Date.now()) {
  if (status === TICKET_STATUS.RESOLVED || !slaDeadline) return null
  const deadline = parseLocalDateTime(slaDeadline)
  if (!deadline) return null
  const minutes = (deadline.getTime() - now) / 60000
  const isOverdue = minutes < 0
  const magnitude = formatDuration(Math.abs(minutes))
  return {
    text: isOverdue ? `Overdue by ${magnitude}` : `Due in ${magnitude}`,
    isOverdue,
    isWarning: minutes <= SLA_WARNING_MINUTES,
  }
}
