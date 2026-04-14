import React from 'react'
import { useRoster } from '../../context/RosterContext.jsx'
import Badge from '../ui/Badge.jsx'
import ProximityChip from '../ui/ProximityChip.jsx'
import WorkerHoursDisplay from '../ui/WorkerHoursDisplay.jsx'

const tierLabels = {
  1: { label: 'Priority 1', variant: 'green' },
  2: { label: 'Priority 2', variant: 'green' },
  3: { label: 'Overtime', variant: 'orange' },
  4: { label: 'Casual', variant: 'blue' },
  5: { label: 'Not recommended', variant: 'grey' },
}

const employmentLabels = {
  permanent_ft: 'Perm FT',
  permanent_pt: 'Perm PT',
  casual: 'Casual',
}

export default function CandidateCard({ candidate, shiftSuburb, onAssign, actionLabel = 'Assign' }) {
  const { workers } = useRoster()
  const worker = candidate.worker

  const isUnavailable = candidate.flags?.includes('on_approved_leave') || candidate.flags?.includes('shift_conflict')
  const isMarginal = candidate.tier === 5
  const hasCompliance = candidate.complianceIssues?.some(i => i.severity === 'error')

  return (
    <div
      className={`border rounded-lg p-3 transition-colors ${
        isUnavailable
          ? 'border-border bg-gray-50 opacity-60'
          : isMarginal
          ? 'border-border bg-gray-50'
          : 'border-border bg-white hover:border-brand/30'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Name + employment type */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-sm font-semibold text-text-primary">{worker.name}</span>
            <Badge variant={isMarginal ? 'grey' : 'default'}>
              {employmentLabels[worker.employmentType] || worker.employmentType}
            </Badge>
            <Badge variant={tierLabels[candidate.tier]?.variant || 'grey'}>
              {tierLabels[candidate.tier]?.label || `Tier ${candidate.tier}`}
            </Badge>
          </div>

          {/* Proximity */}
          <div className="mb-1.5">
            <ProximityChip
              workerSuburb={worker.homeSuburb}
              shiftSuburb={shiftSuburb}
              band={candidate.proximityBand}
            />
          </div>

          {/* Hours */}
          {candidate.hours && (
            <div className="mb-2">
              <WorkerHoursDisplay hours={candidate.hours} />
            </div>
          )}

          {/* Flags */}
          <div className="flex flex-wrap gap-1">
            {candidate.flags?.includes('on_approved_leave') && (
              <Badge variant="red">On approved leave</Badge>
            )}
            {candidate.flags?.includes('pending_leave') && (
              <Badge variant="blue">⚠ Pending leave</Badge>
            )}
            {candidate.flags?.includes('compliance_error') && (
              <Badge variant="red">Compliance issue</Badge>
            )}
            {candidate.flags?.includes('compliance_warning') && (
              <Badge variant="amber">Compliance warning</Badge>
            )}
            {candidate.flags?.includes('overtime_risk') && (
              <Badge variant="orange">Overtime risk</Badge>
            )}
            {candidate.flags?.includes('shift_conflict') && (
              <Badge variant="red">Shift conflict</Badge>
            )}
            {candidate.suitabilityWarnings?.map((w, i) => (
              <Badge key={i} variant="orange">{w.message}</Badge>
            ))}
          </div>

          {/* Compliance issues detail */}
          {candidate.complianceIssues?.length > 0 && (
            <div className="mt-1.5 space-y-0.5">
              {candidate.complianceIssues.map((issue, i) => (
                <p key={i} className={`text-xs ${issue.severity === 'error' ? 'text-status-red' : 'text-status-amber'}`}>
                  {issue.message}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Assign button */}
        {!isUnavailable && (
          <button
            onClick={() => onAssign && onAssign(worker.id)}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded font-medium transition-colors ${
              isMarginal || hasCompliance
                ? 'border border-border text-text-secondary hover:bg-gray-50'
                : 'bg-brand text-white hover:bg-blue-700'
            }`}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
