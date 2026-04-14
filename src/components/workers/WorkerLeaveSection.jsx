import React from 'react'
import { useRoster } from '../../context/RosterContext.jsx'
import Badge from '../ui/Badge.jsx'
import { formatDateRange } from '../../lib/dateUtils.js'

const leaveTypeLabels = {
  annual_leave: 'Annual Leave',
  personal_leave: 'Personal Leave',
  compassionate_leave: 'Compassionate Leave',
}

export default function WorkerLeaveSection({ worker }) {
  const { leaveRequests } = useRoster()
  const workerLeave = leaveRequests.filter(lr => lr.workerId === worker.id)

  if (workerLeave.length === 0) return null

  return (
    <div>
      <p className="text-xs font-medium text-text-secondary mb-1.5">Leave</p>
      <div className="space-y-1">
        {workerLeave.map(lr => (
          <div key={lr.id} className="flex items-center justify-between gap-2">
            <span className="text-xs text-text-secondary">
              {leaveTypeLabels[lr.type] || lr.type} · {formatDateRange(lr.startDate, lr.endDate)}
            </span>
            <Badge variant={lr.status === 'approved' ? 'green' : lr.status === 'pending' ? 'blue' : 'grey'}>
              {lr.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
