import React from 'react'
import Card from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'
import WorkerHoursSection from './WorkerHoursSection.jsx'
import WorkerComplianceSection from './WorkerComplianceSection.jsx'
import WorkerLeaveSection from './WorkerLeaveSection.jsx'
import { useRoster } from '../../context/RosterContext.jsx'
import { calculateWorkerHours } from '../../lib/hoursEngine.js'
import { getExpiredCompliance } from '../../lib/complianceChecker.js'

const employmentLabels = {
  permanent_ft: 'Perm FT',
  permanent_pt: 'Perm PT',
  casual: 'Casual',
}

const employmentVariants = {
  permanent_ft: 'brand',
  permanent_pt: 'blue',
  casual: 'default',
}

export default function WorkerCard({ worker }) {
  const state = useRoster()
  const hours = calculateWorkerHours(worker.id, state)
  const expiredDocs = getExpiredCompliance(state).filter(e => e.worker.id === worker.id)
  const hasOvertimeRisk = ['red', 'critical'].includes(hours?.warningLevel)
  const hasComplianceIssue = expiredDocs.length > 0

  return (
    <Card className={hasComplianceIssue || hasOvertimeRisk ? 'border-l-4 border-l-status-red' : ''}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-text-primary">{worker.name}</h3>
            <Badge variant={employmentVariants[worker.employmentType] || 'default'}>
              {employmentLabels[worker.employmentType] || worker.employmentType}
            </Badge>
          </div>
          <p className="text-xs text-text-muted">
            {worker.homeSuburb} · {worker.languages?.join(', ')}
          </p>
        </div>
        <div className="flex gap-1">
          {hasComplianceIssue && <Badge variant="red">Compliance</Badge>}
          {hasOvertimeRisk && <Badge variant="orange">Overtime</Badge>}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-1">
          {(worker.skills || []).map(skill => (
            <span key={skill} className="text-xs bg-gray-100 text-text-secondary px-2 py-0.5 rounded">
              {skill.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <WorkerHoursSection worker={worker} />
        <WorkerComplianceSection worker={worker} />
        <WorkerLeaveSection worker={worker} />
      </div>
    </Card>
  )
}
