import React from 'react'
import Card, { CardHeader } from '../ui/Card.jsx'
import Alert from '../ui/Alert.jsx'
import { useRoster } from '../../context/RosterContext.jsx'
import { formatTime, minutesUntil } from '../../lib/dateUtils.js'

function formatOverdue(shiftDate, shiftTime) {
  const mins = minutesUntil(shiftDate, shiftTime)
  if (mins === null) return ''
  const elapsed = Math.abs(mins)
  if (elapsed < 60) return `${elapsed} min ago`
  const h = Math.floor(elapsed / 60)
  const m = elapsed % 60
  return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`
}

function formatCheckInLate(shiftDate, shiftTime, checkInTime) {
  const shiftMins = minutesUntil(shiftDate, shiftTime)
  const checkInMins = minutesUntil(shiftDate, checkInTime)
  if (shiftMins === null || checkInMins === null) return ''
  const lateMins = Math.abs(checkInMins - shiftMins)
  if (lateMins < 60) return `${lateMins} min late`
  const h = Math.floor(lateMins / 60)
  const m = lateMins % 60
  return m > 0 ? `${h}h ${m}m late` : `${h}h late`
}

export default function CriticalAlertsPanel() {
  const { shifts, workers, careRecipients } = useRoster()

  const alerts = []

  for (const shift of shifts) {
    const worker = shift.assignedWorkerId
      ? workers.find(w => w.id === shift.assignedWorkerId)
      : null
    const cr = careRecipients.find(c => c.id === shift.careRecipientId)
    const workerName = worker?.name || 'Unknown worker'
    const crName = cr?.name || shift.suburb

    if (shift.flags?.includes('missed_checkin')) {
      const overdue = formatOverdue(shift.date, shift.startTime)
      alerts.push({
        key: `${shift.id}-missed_checkin`,
        severity: 'error',
        title: `Missed check-in — ${workerName}`,
        description: `No check-in recorded. Shift started ${formatTime(shift.startTime)}${overdue ? ` — ${overdue}` : ''}. ${crName}, ${shift.suburb}.`,
      })
    }

    if (shift.flags?.includes('late_checkin')) {
      const lateBy = formatCheckInLate(shift.date, shift.startTime, shift.checkIn)
      alerts.push({
        key: `${shift.id}-late_checkin`,
        severity: 'warning',
        title: `Late check-in — ${workerName}`,
        description: `Checked in at ${formatTime(shift.checkIn)}${lateBy ? ` (${lateBy})` : ''}. Shift started ${formatTime(shift.startTime)}. ${crName}, ${shift.suburb}.`,
      })
    }

    if (shift.flags?.includes('missed_checkout')) {
      const overdue = formatOverdue(shift.date, shift.endTime)
      alerts.push({
        key: `${shift.id}-missed_checkout`,
        severity: 'warning',
        title: `Missing check-out — ${workerName}`,
        description: `No check-out recorded. Shift ended ${formatTime(shift.endTime)}${overdue ? ` — ${overdue}` : ''}. ${crName}, ${shift.suburb}.`,
      })
    }

    if (shift.flags?.includes('compliance_mismatch')) {
      alerts.push({
        key: `${shift.id}-compliance`,
        severity: 'error',
        title: `Compliance issue — ${workerName}`,
        description: `${workerName} has a compliance or suitability issue for their ${shift.suburb} shift (${crName}).`,
      })
    }

    if (shift.flags?.includes('schads_min_breach')) {
      alerts.push({
        key: `${shift.id}-schads`,
        severity: 'warning',
        title: `SCHADS minimum breach — ${shift.suburb}`,
        description: `Shift is ${shift.durationHours}h — below the SCHADS Award 2-hour minimum. ${crName}.`,
      })
    }

    if (shift.flags?.includes('escalated')) {
      const mins = minutesUntil(shift.date, shift.startTime)
      const countdown = mins !== null && mins > 0
        ? ` Starts in ${mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`}.`
        : ''
      alerts.push({
        key: `${shift.id}-escalated`,
        severity: 'critical',
        title: `Unfilled shift — needs attention now`,
        description: `Published shift for ${crName} in ${shift.suburb} has no requests.${countdown}`,
      })
    }
  }

  // Sort: critical first, then error, then warning
  const order = { critical: 0, error: 1, warning: 2, info: 3 }
  alerts.sort((a, b) => (order[a.severity] ?? 3) - (order[b.severity] ?? 3))

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader title="Critical Alerts" subtitle="Issues requiring immediate attention" />
        <p className="text-xs text-text-muted">No critical alerts right now.</p>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title="Critical Alerts"
        subtitle={`${alerts.length} issue${alerts.length !== 1 ? 's' : ''} requiring attention`}
      />
      <div className="space-y-2">
        {alerts.map(alert => (
          <Alert key={alert.key} severity={alert.severity} title={alert.title} description={alert.description} />
        ))}
      </div>
    </Card>
  )
}
