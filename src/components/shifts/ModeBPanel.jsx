import React from 'react'
import { useRoster } from '../../context/RosterContext.jsx'
import { rankCandidatesForShift } from '../../lib/candidateRanker.js'
import RequestCard from './RequestCard.jsx'
import CandidateCard from './CandidateCard.jsx'
import Alert from '../ui/Alert.jsx'

export default function ModeBPanel({ shift }) {
  const state = useRoster()
  const {
    shiftRequests,
    approveShiftRequest,
    declineShiftRequest,
    declineAllRequestsAndConvertToModeA,
    closeShiftDrawer,
  } = state

  // Get pending requests for this shift
  const requests = (shift.requestIds || [])
    .map(rid => shiftRequests.find(r => r.id === rid && r.status === 'pending'))
    .filter(Boolean)

  // EC-03: Best candidate not in the request list
  const allCandidates = rankCandidatesForShift(shift.id, state)
  const requestorWorkerIds = new Set(requests.map(r => r.workerId))
  const bestNotRequested = allCandidates.find(
    c => !requestorWorkerIds.has(c.workerId) && !c.flags?.includes('on_approved_leave')
  )

  function handleApprove(requestId) {
    approveShiftRequest(shift.id, requestId)
    closeShiftDrawer()
  }

  function handleDeclineAll() {
    declineAllRequestsAndConvertToModeA(shift.id)
    // Drawer stays open — it will re-render as Mode A
  }

  return (
    <div className="space-y-4">
      {/* Escalation alert */}
      {shift.flags?.includes('escalated') && (
        <Alert
          severity="critical"
          title="Shift nearing start — no requests received"
          description="This shift has been published but no workers have responded. Consider finding someone directly."
        />
      )}

      {/* Requests queue */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-text-primary">
            Staff Requests ({requests.length})
          </h3>
          {requests.length > 0 && (
            <button
              onClick={handleDeclineAll}
              className="text-xs text-status-red hover:underline font-medium"
            >
              Decline All & Find Someone →
            </button>
          )}
        </div>

        {requests.length === 0 ? (
          <p className="text-xs text-text-muted py-2">No requests received yet.</p>
        ) : (
          <div className="space-y-2">
            {requests.map(request => (
              <RequestCard
                key={request.id}
                request={request}
                shift={shift}
                onApprove={handleApprove}
                onDecline={rid => declineShiftRequest(shift.id, rid)}
              />
            ))}
          </div>
        )}
      </div>

      {/* EC-03: Best available not yet requested */}
      {bestNotRequested && (
        <div>
          <h3 className="text-xs font-semibold text-text-secondary mb-2">
            Best available (not yet requested)
          </h3>
          <CandidateCard
            candidate={bestNotRequested}
            shiftSuburb={shift.suburb}
            onAssign={workerId => {
              state.assignWorkerToShift(shift.id, workerId)
              closeShiftDrawer()
            }}
            actionLabel="Assign Directly"
          />
        </div>
      )}

      {/* Decline All when no requests */}
      {requests.length === 0 && (
        <button
          onClick={handleDeclineAll}
          className="w-full text-xs px-3 py-2 border border-border rounded text-text-secondary hover:bg-gray-50 font-medium transition-colors"
        >
          Find Someone Directly (Mode A)
        </button>
      )}
    </div>
  )
}
