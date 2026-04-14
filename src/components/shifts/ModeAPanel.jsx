import React from 'react'
import { useRoster } from '../../context/RosterContext.jsx'
import { rankCandidatesForShift } from '../../lib/candidateRanker.js'
import CandidateCard from './CandidateCard.jsx'

export default function ModeAPanel({ shift }) {
  const state = useRoster()
  const { assignWorkerToShift, closeShiftDrawer } = state

  const candidates = rankCandidatesForShift(shift.id, state)

  function handleAssign(workerId) {
    assignWorkerToShift(shift.id, workerId)
    closeShiftDrawer()
  }

  return (
    <div>
      <p className="text-xs text-text-secondary mb-3">
        All eligible workers ranked by priority. Unsuitable candidates are shown below — demoted but not hidden.
      </p>

      {candidates.length === 0 && (
        <p className="text-xs text-text-muted text-center py-8">No workers available.</p>
      )}

      <div className="space-y-2">
        {candidates.map(candidate => (
          <CandidateCard
            key={candidate.workerId}
            candidate={candidate}
            shiftSuburb={shift.suburb}
            onAssign={handleAssign}
          />
        ))}
      </div>
    </div>
  )
}
