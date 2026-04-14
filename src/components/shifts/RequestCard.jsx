import React from 'react'
import { useRoster } from '../../context/RosterContext.jsx'
import Badge from '../ui/Badge.jsx'
import ProximityChip from '../ui/ProximityChip.jsx'
import WorkerHoursDisplay from '../ui/WorkerHoursDisplay.jsx'
import { formatDate, formatTime } from '../../lib/dateUtils.js'

const employmentLabels = {
  permanent_ft: 'Perm FT',
  permanent_pt: 'Perm PT',
  casual: 'Casual',
}

export default function RequestCard({ request, shift, onApprove, onDecline }) {
  const state = useRoster()
  const { workers } = state
  const worker = workers.find(w => w.id === request.workerId)
  if (!worker) return null

  return (
    <div className="border border-border rounded-lg p-3 bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-sm font-semibold text-text-primary">{worker.name}</span>
            <Badge variant="default">{employmentLabels[worker.employmentType]}</Badge>
            <span className="text-xs text-text-muted">
              Requested {formatTime(request.requestedAt?.slice(11, 16))} on {formatDate(request.requestedAt?.slice(0, 10))}
            </span>
          </div>

          <div className="mb-1.5">
            <ProximityChip
              workerSuburb={worker.homeSuburb}
              shiftSuburb={shift.suburb}
              band={shift.proximityBands?.[worker.id] || 'significant'}
            />
          </div>
        </div>

        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={() => onApprove && onApprove(request.id)}
            className="text-xs px-2.5 py-1 rounded bg-status-green text-white font-medium hover:opacity-90"
          >
            Approve
          </button>
          <button
            onClick={() => onDecline && onDecline(request.id)}
            className="text-xs px-2.5 py-1 rounded border border-border text-text-secondary font-medium hover:bg-gray-50"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}
