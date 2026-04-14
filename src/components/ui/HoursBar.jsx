import React from 'react'

const levelColors = {
  none: 'bg-status-green',
  amber: 'bg-status-amber',
  orange: 'bg-status-orange',
  red: 'bg-status-red',
  critical: 'bg-status-red',
}

/**
 * Segmented progress bar showing confirmed + approved + pending hours.
 *
 * Props:
 *   confirmed      — hours worked
 *   approved       — hours in approved upcoming shifts
 *   pending        — hours from pending shift requests
 *   contracted     — contracted weekly hours (null for casuals)
 *   warningLevel   — 'none' | 'amber' | 'orange' | 'red' | 'critical'
 */
export default function HoursBar({ confirmed = 0, approved = 0, pending = 0, contracted, warningLevel = 'none' }) {
  if (!contracted) {
    return (
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full bg-gray-400 rounded-full"
          style={{ width: `${Math.min(100, ((confirmed + approved) / 40) * 100)}%` }}
        />
      </div>
    )
  }

  const total = contracted
  const confirmedPct = Math.min(100, (confirmed / total) * 100)
  const approvedPct = Math.min(100 - confirmedPct, (approved / total) * 100)
  const pendingPct = Math.min(100 - confirmedPct - approvedPct, (pending / total) * 100)

  const barColor = levelColors[warningLevel] || levelColors.none

  return (
    <div className="h-2 rounded-full bg-gray-100 overflow-hidden flex">
      {/* Confirmed */}
      {confirmedPct > 0 && (
        <div
          className={`h-full ${barColor} transition-all`}
          style={{ width: `${confirmedPct}%` }}
        />
      )}
      {/* Approved upcoming — slightly lighter */}
      {approvedPct > 0 && (
        <div
          className={`h-full opacity-60 ${barColor} transition-all`}
          style={{ width: `${approvedPct}%` }}
        />
      )}
      {/* Pending — hatched */}
      {pendingPct > 0 && (
        <div
          className="h-full hours-pending opacity-50"
          style={{ width: `${pendingPct}%`, background: 'repeating-linear-gradient(45deg, #94a3b8, #94a3b8 2px, transparent 2px, transparent 6px)' }}
        />
      )}
    </div>
  )
}
