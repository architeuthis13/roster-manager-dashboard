import React from 'react'
import { useRoster } from '../../context/RosterContext.jsx'

const filters = [
  { key: 'all', label: 'All' },
  { key: 'compliance_issue', label: 'Compliance Issue' },
  { key: 'overtime_risk', label: 'Overtime Risk' },
  { key: 'on_leave', label: 'On Leave' },
]

export default function WorkerListToolbar() {
  const { workersFilter, setWorkersFilter } = useRoster()

  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setWorkersFilter(f.key)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              workersFilter === f.key
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
