import React from 'react'
import { useRoster } from '../context/RosterContext.jsx'
import ShiftListToolbar from '../components/shifts/ShiftListToolbar.jsx'
import ShiftCard from '../components/shifts/ShiftCard.jsx'
import OpenShiftDrawer from '../components/shifts/OpenShiftDrawer.jsx'
import { isDateInRange } from '../lib/dateUtils.js'

const openStatuses = ['needs_filling', 'open_requests', 'published_awaiting', 'originally_filled_vacant']

export default function ShiftsPage() {
  const { shifts, shiftsDateRange, shiftsFilter } = useRoster()

  const filtered = shifts.filter(shift => {
    // Date range
    if (!isDateInRange(shift.date, shiftsDateRange.start, shiftsDateRange.end)) return false

    // Filter tab
    if (shiftsFilter === 'open') return openStatuses.includes(shift.status)
    if (shiftsFilter === 'filled') return shift.status === 'filled'
    if (shiftsFilter === 'flagged') return (shift.flags || []).length > 0

    return true
  })

  // Sort: open shifts first, then by date/time
  const sorted = [...filtered].sort((a, b) => {
    const aOpen = openStatuses.includes(a.status) ? 0 : 1
    const bOpen = openStatuses.includes(b.status) ? 0 : 1
    if (aOpen !== bOpen) return aOpen - bOpen
    const aKey = `${a.date}T${a.startTime}`
    const bKey = `${b.date}T${b.startTime}`
    return aKey.localeCompare(bKey)
  })

  return (
    <div className="max-w-4xl">
      <ShiftListToolbar />

      {sorted.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-text-muted">No shifts match the current filters.</p>
        </div>
      )}

      <div className="space-y-2">
        {sorted.map(shift => (
          <ShiftCard key={shift.id} shift={shift} />
        ))}
      </div>

      <OpenShiftDrawer />
    </div>
  )
}
