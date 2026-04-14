import React from 'react'
import HoursBar from './HoursBar.jsx'

const levelTextColors = {
  none: 'text-text-secondary',
  amber: 'text-status-amber',
  orange: 'text-status-orange',
  red: 'text-status-red',
  critical: 'text-status-red font-semibold',
}

const levelLabels = {
  none: null,
  amber: 'Approaching limit',
  orange: 'Near limit',
  red: 'Overtime risk',
  critical: 'Significant overtime',
}

/**
 * Renders the hours display string + bar for a worker.
 * Pass the result of calculateWorkerHours().
 */
export default function WorkerHoursDisplay({ hours }) {
  if (!hours) return null

  const { confirmed, approvedUpcoming, pendingHours, baseHours, contractedHours, warningLevel, displayString, hasPendingLeave, hasApprovedLeave } = hours

  const textColor = levelTextColors[warningLevel] || levelTextColors.none
  const label = levelLabels[warningLevel]

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className={`text-xs ${textColor}`}>{displayString}</span>
        {label && (
          <span className={`text-xs font-medium ${textColor} flex-shrink-0`}>{label}</span>
        )}
      </div>
      <HoursBar
        confirmed={confirmed}
        approved={approvedUpcoming}
        pending={pendingHours}
        contracted={contractedHours}
        warningLevel={warningLevel}
      />
      {hasPendingLeave && !hasApprovedLeave && (
        <p className="text-xs text-status-blue">⚠ Pending leave — assign with caution</p>
      )}
      {hasApprovedLeave && (
        <p className="text-xs text-status-red">On approved leave — do not assign</p>
      )}
    </div>
  )
}
