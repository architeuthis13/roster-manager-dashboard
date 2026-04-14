import React from 'react'
import { useRoster } from '../context/RosterContext.jsx'
import WorkerListToolbar from '../components/workers/WorkerListToolbar.jsx'
import WorkerCard from '../components/workers/WorkerCard.jsx'
import { calculateWorkerHours } from '../lib/hoursEngine.js'
import { getExpiredCompliance } from '../lib/complianceChecker.js'

export default function WorkersPage() {
  const state = useRoster()
  const { workers, leaveRequests, workersFilter, config } = state

  const weekStart = config.currentWeekStart
  const weekEnd = config.currentWeekEnd
  const expiredWorkerIds = new Set(getExpiredCompliance(state).map(e => e.worker.id))

  const filtered = workers.filter(worker => {
    if (workersFilter === 'all') return true

    if (workersFilter === 'compliance_issue') {
      return expiredWorkerIds.has(worker.id)
    }

    if (workersFilter === 'overtime_risk') {
      const hours = calculateWorkerHours(worker.id, state)
      return ['red', 'critical'].includes(hours?.warningLevel)
    }

    if (workersFilter === 'on_leave') {
      return leaveRequests.some(
        lr =>
          lr.workerId === worker.id &&
          (lr.status === 'approved' || lr.status === 'pending') &&
          lr.startDate <= weekEnd &&
          lr.endDate >= weekStart
      )
    }

    return true
  })

  return (
    <div className="max-w-4xl">
      <WorkerListToolbar />
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-text-muted">No workers match the current filter.</p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map(worker => (
          <WorkerCard key={worker.id} worker={worker} />
        ))}
      </div>
    </div>
  )
}
