import React from 'react'
import Card, { CardHeader } from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'
import { useRoster } from '../../context/RosterContext.jsx'
import { formatDate, formatDateRange } from '../../lib/dateUtils.js'

const leaveTypeLabels = {
  annual_leave: 'Annual Leave',
  personal_leave: 'Personal Leave',
  compassionate_leave: 'Compassionate Leave',
}

export default function LeaveRequestsPanel() {
  const { leaveRequests, workers, shifts, approveLeaveRequest, declineLeaveRequest } = useRoster()

  const pending = leaveRequests.filter(lr => lr.status === 'pending')

  return (
    <Card>
      <CardHeader
        title="Leave Requests"
        subtitle={`${pending.length} pending request${pending.length !== 1 ? 's' : ''}`}
      />

      {pending.length === 0 && (
        <p className="text-xs text-text-muted">No pending leave requests.</p>
      )}

      <div className="space-y-3">
        {pending.map(lr => {
          const worker = workers.find(w => w.id === lr.workerId)
          const overlappingShifts = (lr.overlappingShiftIds || [])
            .map(id => shifts.find(s => s.id === id))
            .filter(Boolean)

          return (
            <div key={lr.id} className="p-3 border border-border rounded-md">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-xs font-semibold text-text-primary">{worker?.name}</p>
                  <p className="text-xs text-text-secondary">
                    {leaveTypeLabels[lr.type] || lr.type} — {formatDateRange(lr.startDate, lr.endDate)}
                  </p>
                </div>
                <Badge variant="blue">Pending</Badge>
              </div>

              {overlappingShifts.length > 0 && (
                <div className="mb-2 p-2 rounded bg-status-amberLight border border-status-amber/20">
                  <p className="text-xs font-medium text-status-amber mb-1">
                    ⚠ Overlaps {overlappingShifts.length} filled shift{overlappingShifts.length !== 1 ? 's' : ''}
                  </p>
                  {overlappingShifts.map(s => (
                    <p key={s.id} className="text-xs text-text-secondary">
                      {formatDate(s.date)} — {s.suburb} ({s.startTime}–{s.endTime})
                    </p>
                  ))}
                  <p className="text-xs text-status-amber mt-1">
                    Approving will reopen affected shifts as vacant.
                  </p>
                </div>
              )}

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => approveLeaveRequest(lr.id)}
                  className="text-xs px-3 py-1 rounded bg-status-green text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Approve
                </button>
                <button
                  onClick={() => declineLeaveRequest(lr.id)}
                  className="text-xs px-3 py-1 rounded border border-border text-text-secondary hover:bg-gray-50 font-medium transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
