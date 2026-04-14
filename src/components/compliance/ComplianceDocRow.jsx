import React from 'react'
import ExpiryStatusBadge from './ExpiryStatusBadge.jsx'
import { formatDate } from '../../lib/dateUtils.js'

export default function ComplianceDocRow({ doc, worker }) {
  const isExpired = doc.status === 'expired'
  const isExpiring = doc.status === 'expiring_soon'

  return (
    <tr className={`border-b border-border last:border-0 ${isExpired ? 'bg-status-redLight' : isExpiring ? 'bg-status-amberLight' : ''}`}>
      <td className="py-2.5 px-4">
        <p className="text-xs font-medium text-text-primary">{worker?.name || '—'}</p>
        <p className="text-xs text-text-muted">{worker?.employmentType?.replace('_', ' ')}</p>
      </td>
      <td className="py-2.5 px-4">
        <p className="text-xs text-text-primary">{doc.docType}</p>
      </td>
      <td className="py-2.5 px-4">
        <p className="text-xs text-text-secondary">{formatDate(doc.expiryDate)}</p>
      </td>
      <td className="py-2.5 px-4">
        <ExpiryStatusBadge doc={doc} />
      </td>
    </tr>
  )
}
