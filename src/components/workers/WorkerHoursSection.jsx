import React from 'react'
import { useRoster } from '../../context/RosterContext.jsx'
import { calculateWorkerHours } from '../../lib/hoursEngine.js'
import WorkerHoursDisplay from '../ui/WorkerHoursDisplay.jsx'

export default function WorkerHoursSection({ worker }) {
  const state = useRoster()
  const hours = calculateWorkerHours(worker.id, state)

  if (!hours) return null

  return (
    <div>
      <p className="text-xs font-medium text-text-secondary mb-1.5">Hours This Week</p>
      <WorkerHoursDisplay hours={hours} />
      {worker.employmentType === 'casual' && (
        <p className="text-xs text-text-muted mt-1">
          Casual — {hours.baseHours} hrs worked/approved this week
        </p>
      )}
    </div>
  )
}
