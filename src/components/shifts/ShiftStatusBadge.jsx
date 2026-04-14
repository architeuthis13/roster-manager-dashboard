import React from 'react'
import Badge from '../ui/Badge.jsx'

const statusConfig = {
  needs_filling: { label: 'Needs Filling', variant: 'red' },
  open_requests: { label: null, variant: 'amber' }, // label set dynamically
  published_awaiting: { label: 'Published – Awaiting Requests', variant: 'orange' },
  originally_filled_vacant: { label: 'Originally Filled – Now Vacant', variant: 'orange' },
  filled: { label: 'Filled', variant: 'green' },
}

export default function ShiftStatusBadge({ shift }) {
  const config = statusConfig[shift.status] || { label: shift.status, variant: 'default' }
  const label =
    shift.status === 'open_requests'
      ? `${(shift.requestIds || []).length} Request${(shift.requestIds || []).length !== 1 ? 's' : ''}`
      : config.label

  return <Badge variant={config.variant}>{label}</Badge>
}
