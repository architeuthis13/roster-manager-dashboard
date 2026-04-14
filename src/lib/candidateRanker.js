import { calculateWorkerHours, isWorkerOnApprovedLeave, getPendingLeaveForDate } from './hoursEngine.js'
import { checkWorkerComplianceForShift } from './complianceChecker.js'

/**
 * Ranks all workers as candidates for a given open shift.
 *
 * Priority tiers (per CLAUDE.md):
 *   1 — Perm FT, within contracted hours, compliant, suitable
 *   2 — Perm PT, within contracted hours, compliant, suitable
 *   3 — Perm FT/PT, overtime (compliant + suitable)
 *   4 — Casual, compliant and suitable
 *   5 — Casual with warnings, or unsuitable workers (never hidden)
 *
 * Returns array of candidate objects ordered by tier then proximity.
 */
export function rankCandidatesForShift(shiftId, state) {
  const { workers, shifts, shiftRequests } = state
  const shift = shifts.find(s => s.id === shiftId)
  if (!shift) return []

  const candidates = workers
    .filter(w => w.id !== shift.assignedWorkerId)
    .map(worker => buildCandidate(worker, shift, state))

  candidates.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier
    return proximityOrder(a.proximityBand) - proximityOrder(b.proximityBand)
  })

  return candidates
}

function buildCandidate(worker, shift, state) {
  const { shiftRequests } = state

  // Hours analysis
  const hours = calculateWorkerHours(worker.id, state)

  // Compliance check
  const complianceIssues = checkWorkerComplianceForShift(worker.id, shift.id, state)
  const hasHardComplianceError = complianceIssues.some(i => i.severity === 'error')

  // Suitability check
  const suitabilityWarnings = checkSuitability(worker, shift, state)
  const isSuitable = suitabilityWarnings.length === 0

  // Leave checks
  const onApprovedLeave = isWorkerOnApprovedLeave(worker.id, shift.date, state)
  const pendingLeave = getPendingLeaveForDate(worker.id, shift.date, state)
  const hasPendingLeave = pendingLeave.length > 0

  // Conflicting shift (already assigned to another shift at the same time)
  const hasConflict = checkTimeConflict(worker.id, shift, state)

  // Determine if worker is over their contracted hours
  let isOvertime = false
  if (hours && hours.contractedHours !== null) {
    isOvertime = hours.baseHours >= hours.contractedHours
  }

  // Build flags
  const flags = []
  if (onApprovedLeave) flags.push('on_approved_leave')
  if (hasPendingLeave) flags.push('pending_leave')
  if (hasHardComplianceError) flags.push('compliance_error')
  if (complianceIssues.some(i => i.severity === 'warning')) flags.push('compliance_warning')
  if (!isSuitable) flags.push('unsuitable')
  if (isOvertime) flags.push('overtime_risk')
  if (hasConflict) flags.push('shift_conflict')

  // Whether this worker has already requested this shift
  const hasRequested = (shiftRequests || []).some(
    sr => sr.shiftId === shift.id && sr.workerId === worker.id && sr.status === 'pending'
  )

  // Proximity band from shift data
  const proximityBand = shift.proximityBands?.[worker.id] || 'significant'

  // Assign tier
  const tier = assignTier(worker, hours, hasHardComplianceError, isSuitable, isOvertime, onApprovedLeave, hasConflict)

  return {
    workerId: worker.id,
    worker,
    tier,
    suitable: isSuitable && !hasHardComplianceError,
    flags,
    proximityBand,
    hours,
    complianceIssues,
    suitabilityWarnings,
    hasRequested,
    onApprovedLeave,
    hasPendingLeave,
    pendingLeave,
    hasConflict,
  }
}

function assignTier(worker, hours, hasHardComplianceError, isSuitable, isOvertime, onApprovedLeave, hasConflict) {
  // Workers on approved leave or with conflicts go to tier 5
  if (onApprovedLeave || hasConflict) return 5

  const isPerm = worker.employmentType === 'permanent_ft' || worker.employmentType === 'permanent_pt'
  const isCasual = worker.employmentType === 'casual'
  const isFT = worker.employmentType === 'permanent_ft'
  const isPT = worker.employmentType === 'permanent_pt'

  const compliantAndSuitable = !hasHardComplianceError && isSuitable

  if (isFT && !isOvertime && compliantAndSuitable) return 1
  if (isPT && !isOvertime && compliantAndSuitable) return 2
  if (isPerm && isOvertime && compliantAndSuitable) return 3
  if (isCasual && compliantAndSuitable) return 4
  return 5
}

function checkSuitability(worker, shift, state) {
  const { careRecipients } = state
  const cr = careRecipients.find(c => c.id === shift.careRecipientId)
  if (!cr) return []

  const warnings = []
  const attrs = cr.requiredWorkerAttributes

  // Gender preference
  if (attrs?.genderPreference) {
    const pref = attrs.genderPreference
    const workerGender = worker.genderPronoun
    const genderMatch =
      (pref === 'female' && workerGender?.startsWith('she')) ||
      (pref === 'male' && workerGender?.startsWith('he')) ||
      pref === null
    if (!genderMatch) {
      warnings.push({ type: 'gender_preference', message: `Care recipient prefers ${pref} worker` })
    }
  }

  // Language
  if (attrs?.languages?.length > 0) {
    const hasLang = attrs.languages.some(lang => (worker.languages || []).includes(lang))
    if (!hasLang) {
      warnings.push({ type: 'language', message: `Care recipient requires: ${attrs.languages.join(', ')}` })
    }
  }

  return warnings
}

function checkTimeConflict(workerId, shift, state) {
  const { shifts } = state
  return shifts.some(
    s =>
      s.id !== shift.id &&
      s.assignedWorkerId === workerId &&
      s.date === shift.date &&
      timesOverlap(s.startTime, s.endTime, shift.startTime, shift.endTime)
  )
}

function timesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd
}

function proximityOrder(band) {
  return { nearby: 0, moderate: 1, significant: 2 }[band] ?? 2
}
