import { SLA_WARNING_MINUTES, TICKET_STATUS } from './constants.js'
import { parseApiDateTime, toEpochMs } from './dateTime.js'

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

export function formatDateTime(isoString) {
  const date = parseApiDateTime(isoString)
  return date ? dateTimeFormatter.format(date) : '—'
}

export function formatRelativeTime(isoString, now = Date.now()) {
  const time = toEpochMs(isoString)
  if (time === null) return '—'
  const deltaSeconds = Math.round((time - now) / 1000)
  const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]]
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  for (const [unit, seconds] of units) if (Math.abs(deltaSeconds) >= seconds) return formatter.format(Math.round(deltaSeconds / seconds), unit)
  return formatter.format(deltaSeconds, 'second')
}

function formatDuration(totalMinutes) {
  const minutes = Math.max(1, Math.floor(totalMinutes))
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return [hours ? `${hours}h` : '', rest ? `${rest}m` : ''].filter(Boolean).join(' ')
}

export function formatSlaStatus(slaDeadline, status, now = Date.now()) {
  if (status === TICKET_STATUS.RESOLVED) return null
  const deadline = toEpochMs(slaDeadline)
  if (deadline === null) return null
  const minutes = (deadline - now) / 60000
  const isOverdue = minutes < 0
  const magnitude = formatDuration(Math.abs(minutes))
  return {
    text: isOverdue ? `Overdue by ${magnitude}` : `Due in ${magnitude}`,
    isOverdue,
    isWarning: minutes <= SLA_WARNING_MINUTES,
  }
}
