import React from 'react'
import { useRoster } from '../../context/RosterContext.jsx'

const filters = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'filled', label: 'Filled' },
  { key: 'flagged', label: 'Flagged' },
]

export default function ShiftListToolbar() {
  const { shiftsDateRange, setShiftsDateRange, shiftsFilter, setShiftsFilter } = useRoster()

  return (
    <div className="flex items-center gap-4 mb-4">
      {/* Date range */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-text-secondary font-medium">From</label>
        <input
          type="date"
          value={shiftsDateRange.start}
          onChange={e => setShiftsDateRange({ ...shiftsDateRange, start: e.target.value })}
          className="text-xs border border-border rounded px-2 py-1 text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <label className="text-xs text-text-secondary font-medium">To</label>
        <input
          type="date"
          value={shiftsDateRange.end}
          onChange={e => setShiftsDateRange({ ...shiftsDateRange, end: e.target.value })}
          className="text-xs border border-border rounded px-2 py-1 text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5 ml-auto">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setShiftsFilter(f.key)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              shiftsFilter === f.key
                ? 'bg-white text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}
