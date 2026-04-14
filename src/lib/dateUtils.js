/**
 * Format a date string (YYYY-MM-DD) to a human-readable form.
 * e.g. "2026-04-14" → "Tue 14 Apr"
 */
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })
}

/**
 * Format a time string (HH:MM) to 12-hour display.
 * e.g. "08:00" → "8:00 AM"
 */
export function formatTime(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  const period = h < 12 ? 'AM' : 'PM'
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

/**
 * Format a date range to e.g. "14–20 Apr 2026"
 */
export function formatDateRange(startStr, endStr) {
  if (!startStr || !endStr) return ''
  const s = new Date(startStr + 'T00:00:00')
  const e = new Date(endStr + 'T00:00:00')
  const sDay = s.getDate()
  const eDay = e.getDate()
  const month = e.toLocaleDateString('en-AU', { month: 'short' })
  const year = e.getFullYear()
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${sDay}–${eDay} ${month} ${year}`
  }
  const sMonth = s.toLocaleDateString('en-AU', { month: 'short' })
  return `${sDay} ${sMonth} – ${eDay} ${month} ${year}`
}

/**
 * Returns true if the given date string matches today's date (2026-04-14 in mock context).
 * Uses actual Date so simulated actions work live.
 */
export function isToday(dateStr) {
  if (!dateStr) return false
  const today = new Date()
  const d = new Date(dateStr + 'T00:00:00')
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}

/**
 * Returns true if date is within [start, end] (inclusive).
 */
export function isDateInRange(dateStr, startStr, endStr) {
  if (!dateStr || !startStr || !endStr) return false
  const d = dateStr.replace(/-/g, '')
  const s = startStr.replace(/-/g, '')
  const e = endStr.replace(/-/g, '')
  return d >= s && d <= e
}

/**
 * Returns true if two date ranges overlap.
 * All arguments are YYYY-MM-DD strings.
 */
export function datesOverlap(aStart, aEnd, bStart, bEnd) {
  if (!aStart || !aEnd || !bStart || !bEnd) return false
  return aStart <= bEnd && bStart <= aEnd
}

/**
 * Returns the number of minutes from now until a given date + time.
 * Negative means the time is in the past.
 */
export function minutesUntil(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null
  const target = new Date(`${dateStr}T${timeStr}:00`)
  const now = new Date()
  return Math.round((target - now) / 60000)
}

/**
 * Returns number of days between two YYYY-MM-DD strings.
 * Positive if b is after a.
 */
export function daysBetween(aStr, bStr) {
  const a = new Date(aStr + 'T00:00:00')
  const b = new Date(bStr + 'T00:00:00')
  return Math.round((b - a) / 86400000)
}

/**
 * Today's date as a YYYY-MM-DD string.
 */
export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}
