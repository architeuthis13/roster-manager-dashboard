import { daysBetween, todayStr } from './dateUtils.js'

const WARNING_DAYS = 14

/**
 * Checks a worker's compliance against the requirements for a specific shift.
 * Validates against the shift's START DATE (not today).
 *
 * Returns an array of issue objects: { type, message, severity }
 */
export function checkWorkerComplianceForShift(workerId, shiftId, state) {
  const { workers, shifts, complianceDocs, careRecipients } = state
  const worker = workers.find(w => w.id === workerId)
  const shift = shifts.find(s => s.id === shiftId)
  if (!worker || !shift) return []

  const cr = careRecipients.find(c => c.id === shift.careRecipientId)
  const issues = []

  // Get this worker's compliance docs
  const workerDocs = complianceDocs.filter(d => d.workerId === workerId)

  // Check for expired NDIS Worker Screening
  const ndis = workerDocs.find(d => d.docType === 'NDIS Worker Screening')
  if (!ndis) {
    issues.push({ type: 'missing_ndis', message: 'No NDIS Worker Screening on file', severity: 'error' })
  } else if (ndis.expiryDate < shift.date) {
    issues.push({ type: 'expired_ndis', message: `NDIS Worker Screening expired ${ndis.expiryDate}`, severity: 'error' })
  } else if (daysBetween(todayStr(), ndis.expiryDate) <= WARNING_DAYS) {
    issues.push({ type: 'expiring_ndis', message: `NDIS Worker Screening expires ${ndis.expiryDate}`, severity: 'warning' })
  }

  // Check Police Check
  const policeCheck = workerDocs.find(d => d.docType === 'Police Check')
  if (policeCheck && policeCheck.expiryDate < shift.date) {
    issues.push({ type: 'expired_police_check', message: `Police Check expired ${policeCheck.expiryDate}`, severity: 'error' })
  }

  // Check First Aid (required for most personal care roles)
  const firstAid = workerDocs.find(d => d.docType === 'First Aid Certificate')
  if (firstAid && firstAid.expiryDate < shift.date) {
    issues.push({ type: 'expired_first_aid', message: `First Aid Certificate expired ${firstAid.expiryDate}`, severity: 'error' })
  }

  // Check required skills against care recipient needs
  if (cr?.requiredWorkerAttributes?.requiredSkills) {
    for (const skill of cr.requiredWorkerAttributes.requiredSkills) {
      if (!worker.skills.includes(skill)) {
        issues.push({
          type: 'missing_skill',
          message: `Missing required skill: ${formatSkill(skill)}`,
          severity: 'error',
        })
      }
    }
  }

  // Check Manual Handling Certificate if manual_handling skill is required
  if (cr?.requiredWorkerAttributes?.requiredSkills?.includes('manual_handling')) {
    const mh = workerDocs.find(d => d.docType === 'Manual Handling Certificate')
    if (!mh) {
      issues.push({ type: 'missing_manual_handling_cert', message: 'Manual Handling Certificate required but not on file', severity: 'warning' })
    } else if (mh.expiryDate < shift.date) {
      issues.push({ type: 'expired_manual_handling_cert', message: `Manual Handling Certificate expired ${mh.expiryDate}`, severity: 'error' })
    }
  }

  // Check language match
  if (cr?.requiredWorkerAttributes?.languages) {
    const crLangs = cr.requiredWorkerAttributes.languages
    const workerLangs = worker.languages || []
    const hasMatch = crLangs.some(lang => workerLangs.includes(lang))
    if (!hasMatch) {
      issues.push({
        type: 'language_mismatch',
        message: `Care recipient requires: ${crLangs.join(', ')}`,
        severity: 'warning',
      })
    }
  }

  return issues
}

/**
 * Returns workers with compliance docs expiring within nDays from today.
 * Returns array of { worker, doc, daysUntilExpiry }
 */
export function getExpiringCompliance(nDays, state) {
  const { complianceDocs, workers } = state
  const today = todayStr()
  const results = []

  for (const doc of complianceDocs) {
    if (doc.status !== 'expiring_soon') continue
    const days = daysBetween(today, doc.expiryDate)
    if (days >= 0 && days <= nDays) {
      const worker = workers.find(w => w.id === doc.workerId)
      if (worker) results.push({ worker, doc, daysUntilExpiry: days })
    }
  }

  return results.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
}

/**
 * Returns workers with already-expired compliance docs.
 * Returns array of { worker, doc, daysExpired }
 */
export function getExpiredCompliance(state) {
  const { complianceDocs, workers } = state
  const today = todayStr()
  const results = []

  for (const doc of complianceDocs) {
    if (doc.status !== 'expired') continue
    const days = Math.abs(daysBetween(today, doc.expiryDate))
    const worker = workers.find(w => w.id === doc.workerId)
    if (worker) results.push({ worker, doc, daysExpired: days })
  }

  return results.sort((a, b) => b.daysExpired - a.daysExpired)
}

function formatSkill(skill) {
  return skill
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
