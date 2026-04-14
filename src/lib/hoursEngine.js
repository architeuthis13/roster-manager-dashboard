import { datesOverlap } from './dateUtils.js'

/**
 * Warning level thresholds (percentage of contracted hours).
 */
const THRESHOLDS = {
  amber: 0.8,
  orange: 0.9,
  red: 1.0,
  critical: 1.1,
}

/**
 * Calculates a worker's hours summary for the current week.
 *
 * Returns:
 *   confirmed        — hours worked (confirmed/past shifts)
 *   approved         — hours from approved upcoming shifts
 *   pendingUpper     — confirmed + approved + pending shift requests
 *   contractedHours  — their contracted weekly hours (null for casuals)
 *   warningLevel     — 'none' | 'amber' | 'orange' | 'red' | 'critical'
 *   displayString    — formatted string for UI display
 *   hasPendingLeave  — boolean: worker has pending leave this week
 *   hasApprovedLeave — boolean: worker has approved leave this week
 */
export function calculateWorkerHours(workerId, state) {
  const { workers, shifts, leaveRequests, shiftRequests, config } = state
  const worker = workers.find(w => w.id === workerId)
  if (!worker) return null

  const weekStart = config.currentWeekStart
  const weekEnd = config.currentWeekEnd

  // Confirmed hours: from worker data (pre-computed in mock)
  const confirmed = worker.hoursWorkedConfirmed || 0

  // Approved upcoming hours: shifts assigned to this worker in the week that are upcoming
  const approvedUpcoming = worker.hoursApprovedUpcoming || 0

  // Pending shift requests: sum hours of shifts this worker has requested (not yet approved)
  const pendingRequests = (shiftRequests || []).filter(
    sr => sr.workerId === workerId && sr.status === 'pending'
  )
  let pendingHours = 0
  for (const req of pendingRequests) {
    const shift = shifts.find(s => s.id === req.shiftId)
    if (shift && datesOverlap(shift.date, shift.date, weekStart, weekEnd)) {
      pendingHours += shift.durationHours || 0
    }
  }

  const baseHours = confirmed + approvedUpcoming
  const pendingUpper = baseHours + pendingHours

  const contractedHours = worker.contractedHoursPerWeek || null

  // Check leave
  const workerLeave = (leaveRequests || []).filter(lr => lr.workerId === workerId)
  const hasPendingLeave = workerLeave.some(
    lr => lr.status === 'pending' && datesOverlap(lr.startDate, lr.endDate, weekStart, weekEnd)
  )
  const hasApprovedLeave = workerLeave.some(
    lr => lr.status === 'approved' && datesOverlap(lr.startDate, lr.endDate, weekStart, weekEnd)
  )

  const warningLevel = contractedHours
    ? getOvertimeWarningLevel({ baseHours, contractedHours })
    : 'none'

  const displayString = buildDisplayString({
    confirmed,
    approvedUpcoming,
    pendingHours,
    baseHours,
    pendingUpper,
    contractedHours,
    hasPendingLeave,
  })

  return {
    confirmed,
    approvedUpcoming,
    pendingHours,
    baseHours,
    pendingUpper,
    contractedHours,
    warningLevel,
    displayString,
    hasPendingLeave,
    hasApprovedLeave,
  }
}

/**
 * Returns the overtime warning level for a worker's current hours.
 */
export function getOvertimeWarningLevel({ baseHours, contractedHours }) {
  if (!contractedHours) return 'none'
  const ratio = baseHours / contractedHours
  if (ratio >= THRESHOLDS.critical) return 'critical'
  if (ratio >= THRESHOLDS.red) return 'red'
  if (ratio >= THRESHOLDS.orange) return 'orange'
  if (ratio >= THRESHOLDS.amber) return 'amber'
  return 'none'
}

function buildDisplayString({ confirmed, approvedUpcoming, pendingHours, baseHours, pendingUpper, contractedHours, hasPendingLeave }) {
  const contracted = contractedHours ? ` / ${contractedHours} hrs` : ' hrs'
  let str = `${baseHours}${contracted}`
  if (pendingHours > 0) {
    str += ` · ↑ up to ${pendingUpper} hrs if pending request approved`
  }
  if (hasPendingLeave) {
    str += ' · ⚠ Pending leave'
  }
  return str
}

/**
 * Returns true if a worker has approved leave that overlaps the given date.
 */
export function isWorkerOnApprovedLeave(workerId, dateStr, { leaveRequests }) {
  return (leaveRequests || []).some(
    lr =>
      lr.workerId === workerId &&
      lr.status === 'approved' &&
      datesOverlap(lr.startDate, lr.endDate, dateStr, dateStr)
  )
}

/**
 * Returns pending leave entries that overlap the given date for a worker.
 */
export function getPendingLeaveForDate(workerId, dateStr, { leaveRequests }) {
  return (leaveRequests || []).filter(
    lr =>
      lr.workerId === workerId &&
      lr.status === 'pending' &&
      datesOverlap(lr.startDate, lr.endDate, dateStr, dateStr)
  )
}
