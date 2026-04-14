import React from 'react'
import { useNavigate } from 'react-router-dom'
import Card, { CardHeader } from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'
import { useRoster } from '../../context/RosterContext.jsx'
import { getExpiringCompliance, getExpiredCompliance } from '../../lib/complianceChecker.js'

export default function ComplianceExpiryPanel() {
  const state = useRoster()
  const navigate = useNavigate()

  const expired = getExpiredCompliance(state)
  const expiring = getExpiringCompliance(14, state)

  const total = expired.length + expiring.length

  return (
    <Card>
      <CardHeader
        title="Compliance Alerts"
        subtitle={`${total} document${total !== 1 ? 's' : ''} need attention`}
        action={
          <button
            onClick={() => navigate('/compliance')}
            className="text-xs text-brand hover:underline font-medium"
          >
            View all →
          </button>
        }
      />

      {expired.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-status-red mb-1.5">Expired</p>
          <div className="space-y-1.5">
            {expired.map(({ worker, doc, daysExpired }) => (
              <div key={doc.id} className="flex items-center justify-between gap-2 p-2 rounded bg-status-redLight">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">{worker.name}</p>
                  <p className="text-xs text-text-secondary truncate">{doc.docType}</p>
                </div>
                <Badge variant="red" className="flex-shrink-0">
                  Expired {daysExpired}d ago
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {expiring.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-status-amber mb-1.5">Expiring Soon</p>
          <div className="space-y-1.5">
            {expiring.map(({ worker, doc, daysUntilExpiry }) => (
              <div key={doc.id} className="flex items-center justify-between gap-2 p-2 rounded bg-status-amberLight">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">{worker.name}</p>
                  <p className="text-xs text-text-secondary truncate">{doc.docType}</p>
                </div>
                <Badge variant="amber" className="flex-shrink-0">
                  {daysUntilExpiry}d remaining
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <p className="text-xs text-text-muted">All compliance documents are current.</p>
      )}
    </Card>
  )
}
