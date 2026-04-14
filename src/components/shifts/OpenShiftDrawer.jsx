import React from 'react'
import { X, MapPin } from 'lucide-react'
import { useRoster } from '../../context/RosterContext.jsx'
import ModeAPanel from './ModeAPanel.jsx'
import ModeBPanel from './ModeBPanel.jsx'
import Alert from '../ui/Alert.jsx'
import { formatDate, formatTime } from '../../lib/dateUtils.js'

export default function OpenShiftDrawer() {
  const { drawerOpen, selectedShiftId, shifts, careRecipients, workers, closeShiftDrawer } = useRoster()

  if (!drawerOpen || !selectedShiftId) return null

  const shift = shifts.find(s => s.id === selectedShiftId)
  if (!shift) return null

  const cr = careRecipients.find(c => c.id === shift.careRecipientId)
  const prevWorker = shift.previousAssignedWorkerId
    ? workers.find(w => w.id === shift.previousAssignedWorkerId)
    : null

  const isVacant = shift.status === 'originally_filled_vacant'
  const isModeA = shift.status === 'needs_filling' || isVacant
  const isModeB = shift.status === 'open_requests' || shift.status === 'published_awaiting'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={closeShiftDrawer}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[480px] bg-white border-l border-border shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">
              {isModeA ? 'Find a Worker' : 'Incoming Requests'}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={11} className="text-text-muted" />
              <span className="text-xs text-text-secondary">
                {cr?.name} · {shift.suburb}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              {formatDate(shift.date)} · {formatTime(shift.startTime)} – {formatTime(shift.endTime)} ({shift.durationHours}h)
            </p>
          </div>
          <button
            onClick={closeShiftDrawer}
            className="p-1 rounded hover:bg-gray-100 text-text-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Originally vacant banner */}
        {isVacant && prevWorker && (
          <div className="px-5 pt-4">
            <Alert
              severity="warning"
              title={`Originally assigned to ${prevWorker.name} — now vacant`}
              description="Worker became unavailable. Re-assign below."
            />
          </div>
        )}

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          {isModeA && <ModeAPanel shift={shift} />}
          {isModeB && <ModeBPanel shift={shift} />}
        </div>
      </div>
    </>
  )
}
