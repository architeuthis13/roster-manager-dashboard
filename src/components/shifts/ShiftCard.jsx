import React from 'react'
import { MapPin, Clock } from 'lucide-react'
import ShiftStatusBadge from './ShiftStatusBadge.jsx'
import Badge from '../ui/Badge.jsx'
import CountdownBadge from '../ui/CountdownBadge.jsx'
import { useRoster } from '../../context/RosterContext.jsx'
import { formatDate, formatTime } from '../../lib/dateUtils.js'

const flagConfig = {
  compliance_mismatch: { label: 'Compliance issue', variant: 'red' },
  overtime_risk: { label: 'Overtime risk', variant: 'orange' },
  late_checkin: { label: 'Late check-in', variant: 'amber' },
  missed_checkin: { label: 'Missed check-in', variant: 'red' },
  missed_checkout: { label: 'Missed check-out', variant: 'amber' },
  schads_min_breach: { label: 'SCHADS < 2h', variant: 'amber' },
  broken_shift: { label: 'Broken shift', variant: 'blue' },
  originally_filled: { label: 'Originally filled', variant: 'orange' },
  escalated: { label: 'Escalated', variant: 'red' },
}

const openStatuses = ['needs_filling', 'open_requests', 'published_awaiting', 'originally_filled_vacant']

export default function ShiftCard({ shift }) {
  const { workers, careRecipients, openShiftDrawer } = useRoster()

  const worker = shift.assignedWorkerId ? workers.find(w => w.id === shift.assignedWorkerId) : null
  const cr = careRecipients.find(c => c.id === shift.careRecipientId)
  const isOpen = openStatuses.includes(shift.status)
  const isEscalated = shift.flags?.includes('escalated')

  const displayFlags = (shift.flags || []).filter(f => f !== 'originally_filled' || shift.status === 'originally_filled_vacant')

  return (
    <div
      className={`bg-card border rounded-lg p-4 transition-shadow ${
        isOpen && isEscalated ? 'border-l-4 border-l-status-orange border-border cursor-pointer hover:shadow-md' :
        isOpen ? 'border-l-4 border-l-status-red border-border cursor-pointer hover:shadow-md' :
        'border-border'
      }`}
      onClick={() => isOpen && openShiftDrawer(shift.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Date + time */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-text-primary">{formatDate(shift.date)}</span>
            <span className="text-xs text-text-secondary">
              {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
            </span>
            <span className="text-xs text-text-muted">({shift.durationHours}h)</span>
          </div>

          {/* Care recipient + suburb */}
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin size={11} className="text-text-muted flex-shrink-0" />
            <span className="text-xs text-text-secondary">
              {cr?.name || shift.careRecipientId} · {shift.suburb}
            </span>
          </div>

          {/* Assigned worker */}
          {worker && (
            <p className="text-xs text-text-secondary mb-2">
              Assigned: <span className="font-medium text-text-primary">{worker.name}</span>
            </p>
          )}

          {/* Check-in/out */}
          {shift.checkIn && (
            <div className="flex items-center gap-2 mb-2">
              <Clock size={11} className="text-text-muted" />
              <span className="text-xs text-text-muted">
                In: {formatTime(shift.checkIn)}
                {shift.checkOut && ` · Out: ${formatTime(shift.checkOut)}`}
              </span>
            </div>
          )}

          {/* Flags */}
          {displayFlags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {displayFlags.map(flag => {
                const cfg = flagConfig[flag]
                if (!cfg) return null
                return (
                  <Badge key={flag} variant={cfg.variant}>{cfg.label}</Badge>
                )
              })}
            </div>
          )}
        </div>

        {/* Right side: status + countdown */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <ShiftStatusBadge shift={shift} />
          {isEscalated && <CountdownBadge shift={shift} />}
          {isOpen && (
            <span className="text-xs text-brand font-medium">View →</span>
          )}
        </div>
      </div>
    </div>
  )
}
