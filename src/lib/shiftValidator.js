import { minutesUntil, datesOverlap } from './dateUtils.js'
import { getOvertimeWarningLevel } from './hoursEngine.js'

const SCHADS_MIN_HOURS = 2
const LATE_CHECKIN_MINUTES = 15

/**
 * Returns an array of flag objects for a given shift.
 * Combines pre-seeded flags with dynamically computed ones.
 *
 * Each flag: { type, message, severity }
 */
export function validateShift(shiftId, state) {
  const { shifts, workers, leaveRequests, complianceDocs, careRecipients, config } = state
  const shift = shifts.find(s => s.id === shiftId)
  if (!shift) return []

  const flags = []

  // Include pre-seeded flags from the data
  for (const flag of shift.flags || []) {
    flags.push({ type: flag, severity: flagSeverity(flag), message: flagMessage(flag, shift, state) })
  }

  // If already flagged from data, don't double-add dynamic checks
  const existingTypes = new Set(flags.map(f => f.type))

  // SCHADS minimum shift
  if (!existingTypes.has('schads_min_breach') && shift.durationHours < SCHADS_MIN_HOURS) {
    flags.push({
      type: 'schads_min_breach',
      severity: 'warning',
      message: `Shift is ${shift.durationHours}h — below SCHADS 2h minimum`,
    })
  }

  // EC-01: Published with no requests, within escalation threshold
  if (!existingTypes.has('escalated') && shift.forceEscalated) {
    flags.push({
      type: 'escalated',
      severity: 'critical',
      message: 'No requests received — needs filling urgently',
    })
  }

  if (
    !existingTypes.has('escalated') &&
    (shift.status === 'published_awaiting') &&
    (shift.requestIds || []).length === 0 &&
    !shift.forceEscalated
  ) {
    const mins = minutesUntil(shift.date, shift.startTime)
    if (mins !== null && mins <= (config.escalationThresholdHours || 4) * 60) {
      flags.push({
        type: 'escalated',
        severity: 'critical',
        message: `Starts in ${Math.round(mins / 60)}h — no requests received`,
      })
    }
  }

  return flags
}

/**
 * Returns minutes until a shift starts. Negative means already started.
 */
export function getMinutesToShiftStart(shift) {
  return minutesUntil(shift.date, shift.startTime)
}

function flagSeverity(type) {
  const severities = {
    compliance_mismatch: 'error',
    overtime_risk: 'warning',
    late_checkin: 'warning',
    missed_checkin: 'error',
    missed_checkout: 'warning',
    schads_min_breach: 'warning',
    broken_shift: 'info',
    originally_filled: 'info',
    escalated: 'critical',
  }
  return severities[type] || 'info'
}

function flagMessage(type, shift, state) {
  const worker = shift.assignedWorkerId
    ? state.workers?.find(w => w.id === shift.assignedWorkerId)
    : null
  const workerName = worker ? worker.name : 'Assigned worker'

  const messages = {
    compliance_mismatch: `${workerName} has a compliance issue for this shift`,
    overtime_risk: `${workerName} is at or near overtime`,
    late_checkin: `${workerName} checked in at ${shift.checkIn} (shift started ${shift.startTime})`,
    missed_checkin: `${workerName} has not checked in (shift started ${shift.startTime})`,
    missed_checkout: `${workerName} has not checked out`,
    schads_min_breach: `Shift is ${shift.durationHours}h — below SCHADS 2h minimum`,
    broken_shift: 'Broken shift — attracts allowance under SCHADS',
    originally_filled: shift.previousAssignedWorkerId
      ? `Originally assigned to ${state.workers?.find(w => w.id === shift.previousAssignedWorkerId)?.name || 'a worker'} — now vacant`
      : 'Originally filled — now vacant',
    escalated: 'Published with no requests — needs filling urgently',
  }
  return messages[type] || type
}
