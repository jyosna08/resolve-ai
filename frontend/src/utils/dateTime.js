const API_DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(\.\d+)?)?)?(Z|[+-]\d{2}:?\d{2})?$/i

export function parseApiDateTime(value) {
  if (typeof value !== 'string' || !value.trim()) return null

  const match = value.trim().match(API_DATE_TIME_PATTERN)
  if (!match || !isValidDateTime(match)) return null

  const [, year, month, day, hour, minute, second, fraction, zone] = match
  const time = hour === undefined
    ? 'T00:00:00'
    : `T${hour}:${minute}:${second ?? '00'}${normalizeFraction(fraction)}`
  const normalizedZone = normalizeZone(zone) || 'Z'
  const date = new Date(`${year}-${month}-${day}${time}${normalizedZone}`)
  return Number.isNaN(date.getTime()) ? null : date
}

export function toEpochMs(value) {
  return parseApiDateTime(value)?.getTime() ?? null
}

function isValidDateTime(match) {
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, , zone] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1]
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth) return false

  if (hourText !== undefined) {
    if (Number(hourText) > 23 || Number(minuteText) > 59 || Number(secondText ?? 0) > 59) return false
  }
  if (zone && zone.toUpperCase() !== 'Z') {
    const digits = zone.slice(1).replace(':', '')
    if (Number(digits.slice(0, 2)) > 23 || Number(digits.slice(2, 4)) > 59) return false
  }
  return true
}

function normalizeFraction(fraction) {
  if (!fraction) return ''
  return `.${fraction.slice(1, 4).padEnd(3, '0')}`
}

function normalizeZone(zone) {
  if (!zone || zone.toUpperCase() === 'Z') return zone ? 'Z' : ''
  return zone.includes(':') ? zone : `${zone.slice(0, 3)}:${zone.slice(3)}`
}
