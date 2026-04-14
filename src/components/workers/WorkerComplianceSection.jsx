import React from 'react'
import { useRoster } from '../../context/RosterContext.jsx'
import ComplianceTag from '../ui/ComplianceTag.jsx'

export default function WorkerComplianceSection({ worker }) {
  const { complianceDocs } = useRoster()
  const docs = complianceDocs.filter(d => d.workerId === worker.id)

  if (docs.length === 0) return null

  return (
    <div>
      <p className="text-xs font-medium text-text-secondary mb-1.5">Compliance</p>
      <div className="flex flex-wrap gap-1">
        {docs.map(doc => (
          <ComplianceTag key={doc.id} doc={doc} />
        ))}
      </div>
    </div>
  )
}
