import React from 'react'
import { useRoster } from '../../context/RosterContext.jsx'
import Badge from '../ui/Badge.jsx'
import ProximityChip from '../ui/ProximityChip.jsx'
import WorkerHoursDisplay from '../ui/WorkerHoursDisplay.jsx'
import { formatDate, formatTime } from '../../lib/dateUtils.js'
import { rankCandidatesForShift } from '../../lib/candidateRanker.js'

const employmentLabels = {
  permanent_ft: 'Perm FT',
  permanent_pt: 'Perm PT',
  casual: 'Casual',
}

const tierLabels = {
  1: { label: 'Priority 1', variant: 'green' },
  2: { label: 'Priority 2', variant: 'green' },
  3: { label: 'Overtime', variant: 'orange' },
  4: { label: 'Casual', variant: 'blue' },
  5: { label: 'Not recommended', variant: 'grey' },
}

export default function RequestCard({ request, shift, onApprove, onDecline }) {
  const state = useRoster()
  const { workers } = state
  const worker = workers.find(w => w.id === request.workerId)
  if (!worker) return null

  // Get full candidate data (same signals as Mode A) for this requestor
  const allCandidates = rankCandidatesForShift(shift.id, state)
  const candidate = allCandidates.find(c => c.workerId === request.workerId)

  const tier = candidate?.tier
  const tierConfig = tierLabels[tier]
  const isMarginal = tier === 5
  const hasComplianceError = candidate?.flags?.includes('compliance_error')
  const hasOvertimeRisk = candidate?.flags?.includes('overtime_risk')
  const hasPendingLeave = candidate?.flags?.includes('pending_leave')
  const isOnLeave = candidate?.flags?.includes('on_approved_leave')

  return (
    <div className={`border rounded-lg p-3 bg-white ${isMarginal || isOnLeave ? 'border-border opacity-80' : 'border-border'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">

          {/* Name + employment type + tier + request time */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-sm font-semibold text-text-primary">{worker.name}</span>
            <Badge variant={isMarginal ? 'grey' : 'default'}>
              {employmentLabels[worker.employmentType]}
            </Badge>
            {tierConfig && (
              <Badge variant={tierConfig.variant}>{tierConfig.label}</Badge>
            )}
            <span className="text-xs text-text-muted">
              Requested {formatTime(request.requestedAt?.slice(11, 16))} on {formatDate(request.requestedAt?.slice(0, 10))}
            </span>
          </div>

          {/* Proximity */}
          <div className="mb-1.5">
            <ProximityChip
              workerSuburb={worker.homeSuburb}
              shiftSuburb={shift.suburb}
              band={shift.proximityBands?.[worker.id] || 'significant'}
            />
          </div>

          {/* Hours range — same as Mode A */}
          {candidate?.hours && (
            <div className="mb-2">
              <WorkerHoursDisplay hours={candidate.hours} />
            </div>
          )}

          {/* Suitability & compliance flags */}
          <div className="flex flex-wrap gap-1">
            {isOnLeave && <Badge variant="red">On approved leave</Badge>}
            {hasPendingLeave && <Badge variant="blue">⚠ Pending leave</Badge>}
            {hasComplianceError && <Badge variant="red">Compliance issue</Badge>}
            {candidate?.flags?.includes('compliance_warning') && (
              <Badge variant="amber">Compliance warning</Badge>
            )}
            {hasOvertimeRisk && <Badge variant="orange">Overtime risk</Badge>}
            {candidate?.flags?.includes('shift_conflict') && (
              <Badge variant="red">Shift conflict</Badge>
            )}
            {candidate?.suitabilityWarnings?.map((w, i) => (
              <Badge key={i} variant="orange">{w.message}</Badge>
            ))}
          </div>

          {/* Compliance issues detail */}
          {candidate?.complianceIssues?.length > 0 && (
            <div className="mt-1.5 space-y-0.5">
              {candidate.complianceIssues.map((issue, i) => (
                <p key={i} className={`text-xs ${issue.severity === 'error' ? 'text-status-red' : 'text-status-amber'}`}>
                  {issue.message}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isOnLeave && (
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <button
              onClick={() => onApprove && onApprove(request.id)}
              className={`text-xs px-2.5 py-1 rounded font-medium transition-opacity ${
                isMarginal || hasComplianceError
                  ? 'border border-border text-text-secondary hover:bg-gray-50'
                  : 'bg-status-green text-white hover:opacity-90'
              }`}
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
        )}
      </div>
    </div>
  )
}
