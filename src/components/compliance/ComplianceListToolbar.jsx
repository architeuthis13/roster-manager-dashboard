import React from 'react'
import { useRoster } from '../../context/RosterContext.jsx'

const filters = [
  { key: 'all', label: 'All' },
  { key: 'missing', label: 'Missing' },
  { key: 'expired', label: 'Expired' },
  { key: 'expiring_soon', label: 'Expiring Soon' },
]

export default function ComplianceListToolbar() {
  const { complianceFilter, setComplianceFilter } = useRoster()

  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setComplianceFilter(f.key)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              complianceFilter === f.key
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
