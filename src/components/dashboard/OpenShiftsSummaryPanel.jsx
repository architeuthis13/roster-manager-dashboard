import React from 'react'
import { useNavigate } from 'react-router-dom'
import Card, { CardHeader } from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'
import { useRoster } from '../../context/RosterContext.jsx'

export default function OpenShiftsSummaryPanel() {
  const { shifts } = useRoster()
  const navigate = useNavigate()

  const modeA = shifts.filter(s => s.status === 'needs_filling')
  const modeB = shifts.filter(s => s.status === 'open_requests')
  const awaiting = shifts.filter(s => s.status === 'published_awaiting' && !s.flags?.includes('escalated'))
  const escalated = shifts.filter(s => s.flags?.includes('escalated'))
  const vacant = shifts.filter(s => s.status === 'originally_filled_vacant')

  const totalOpen = modeA.length + modeB.length + awaiting.length + escalated.length + vacant.length

  const rows = [
    { label: 'Needs Filling', count: modeA.length, variant: 'red', description: 'Unassigned, not published' },
    { label: 'Incoming Requests', count: modeB.length, variant: 'amber', description: 'Staff have self-selected' },
    { label: 'Awaiting Requests', count: awaiting.length, variant: 'orange', description: 'Published, no requests yet' },
    { label: 'Escalated — Urgent', count: escalated.length, variant: 'red', description: 'Near start time, no requests' },
    { label: 'Originally Filled — Now Vacant', count: vacant.length, variant: 'orange', description: 'Worker became unavailable' },
  ]

  return (
    <Card>
      <CardHeader
        title="Open Shifts"
        subtitle={`${totalOpen} shift${totalOpen !== 1 ? 's' : ''} require action`}
        action={
          <button
            onClick={() => { navigate('/shifts'); }}
            className="text-xs text-brand hover:underline font-medium"
          >
            View all →
          </button>
        }
      />
      <div className="space-y-2">
        {rows.map(row => (
          <div
            key={row.label}
            className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
          >
            <div>
              <span className="text-xs font-medium text-text-primary">{row.label}</span>
              <p className="text-xs text-text-muted">{row.description}</p>
            </div>
            <Badge variant={row.count > 0 ? row.variant : 'grey'}>{row.count}</Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}
