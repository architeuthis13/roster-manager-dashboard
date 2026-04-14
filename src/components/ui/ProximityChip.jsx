import React from 'react'

const bandConfig = {
  nearby: { emoji: '🟢', label: 'Nearby' },
  moderate: { emoji: '🟡', label: 'Moderate travel' },
  significant: { emoji: '🔴', label: 'Significant travel' },
}

/**
 * Displays geographic proximity between worker and shift suburb.
 * "📍 Chermside → Aspley 🟢 Nearby"
 */
export default function ProximityChip({ workerSuburb, shiftSuburb, band }) {
  const config = bandConfig[band] || bandConfig.significant
  return (
    <span className="text-xs text-text-secondary">
      📍 {workerSuburb} → {shiftSuburb} {config.emoji} {config.label}
    </span>
  )
}
