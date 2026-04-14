import React from 'react'
import Card, { CardHeader } from '../ui/Card.jsx'
import Alert from '../ui/Alert.jsx'
import { useRoster } from '../../context/RosterContext.jsx'
import { formatTime } from '../../lib/dateUtils.js'

export default function CriticalAlertsPanel() {
  const { shifts, workers } = useRoster()

  const alerts = []

  for (const shift of shifts) {
    const worker = shift.assignedWorkerId
      ? workers.find(w => w.id === shift.assignedWorkerId)
      : null
    const workerName = worker?.name || 'Unknown worker'

    if (shift.flags?.includes('missed_checkin')) {
      alerts.push({
        key: `${shift.id}-missed_checkin`,
        severity: 'error',
        title: `Missed check-in — ${workerName}`,
        description: `Shift started at ${formatTime(shift.startTime)} with no check-in recorded. Shift: ${shift.suburb} for ${shift.careRecipientId}.`,
      })
    }

    if (shift.flags?.includes('late_checkin')) {
      alerts.push({
        key: `${shift.id}-late_checkin`,
        severity: 'warning',
        title: `Late check-in — ${workerName}`,
        description: `Checked in at ${formatTime(shift.checkIn)} (shift started ${formatTime(shift.startTime)}). ${shift.suburb}.`,
      })
    }

    if (shift.flags?.includes('missed_checkout')) {
      alerts.push({
        key: `${shift.id}-missed_checkout`,
        severity: 'warning',
        title: `Missing check-out — ${workerName}`,
        description: `Shift ended at ${formatTime(shift.endTime)} with no check-out recorded. ${shift.suburb}.`,
      })
    }

    if (shift.flags?.includes('compliance_mismatch')) {
      alerts.push({
        key: `${shift.id}-compliance`,
        severity: 'error',
        title: `Compliance issue — ${workerName}`,
        description: `${workerName} has a compliance or suitability issue for their ${shift.suburb} shift.`,
      })
    }

    if (shift.flags?.includes('schads_min_breach')) {
      alerts.push({
        key: `${shift.id}-schads`,
        severity: 'warning',
        title: `SCHADS minimum breach — ${shift.suburb}`,
        description: `Shift is ${shift.durationHours}h — below the SCHADS Award 2-hour minimum.`,
      })
    }

    if (shift.flags?.includes('escalated')) {
      alerts.push({
        key: `${shift.id}-escalated`,
        severity: 'critical',
        title: `Unfilled shift — needs attention now`,
        description: `Published shift in ${shift.suburb} has received no requests and starts soon.`,
      })
    }
  }

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
