import React from 'react'
import { useRoster } from '../context/RosterContext.jsx'
import ComplianceListToolbar from '../components/compliance/ComplianceListToolbar.jsx'
import ComplianceDocRow from '../components/compliance/ComplianceDocRow.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import { daysBetween, todayStr } from '../lib/dateUtils.js'
import { getMissingCompliance } from '../lib/complianceChecker.js'

export default function CompliancePage() {
  const state = useRoster()
  const { complianceDocs, workers, complianceFilter } = state
  const today = todayStr()

  const missingWorkers = getMissingCompliance(state)

  const filtered = complianceDocs.filter(doc => {
    if (complianceFilter === 'missing') return false // missing are shown separately
    if (complianceFilter === 'expired') return doc.status === 'expired'
    if (complianceFilter === 'expiring_soon') return doc.status === 'expiring_soon'
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    const order = { expired: 0, expiring_soon: 1, current: 2 }
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status]
    return daysBetween(today, a.expiryDate) - daysBetween(today, b.expiryDate)
  })

  const expiredCount = complianceDocs.filter(d => d.status === 'expired').length
  const expiringCount = complianceDocs.filter(d => d.status === 'expiring_soon').length
  const missingCount = missingWorkers.reduce((n, w) => n + w.missingDocs.length, 0)

  const showMissing = complianceFilter === 'all' || complianceFilter === 'missing'

  return (
    <div className="max-w-4xl">
      {/* Summary tiles */}
      <div className="flex gap-4 mb-5">
        <div className="bg-status-redLight border border-status-red/20 rounded-lg px-4 py-3 flex-1">
          <p className="text-lg font-bold text-status-red">{missingCount}</p>
          <p className="text-xs text-status-red font-medium">Missing (no record)</p>
        </div>
        <div className="bg-status-redLight border border-status-red/20 rounded-lg px-4 py-3 flex-1">
          <p className="text-lg font-bold text-status-red">{expiredCount}</p>
          <p className="text-xs text-status-red font-medium">Expired</p>
        </div>
        <div className="bg-status-amberLight border border-status-amber/20 rounded-lg px-4 py-3 flex-1">
          <p className="text-lg font-bold text-status-amber">{expiringCount}</p>
          <p className="text-xs text-status-amber font-medium">Expiring within 14 days</p>
        </div>
        <div className="bg-status-greenLight border border-status-green/20 rounded-lg px-4 py-3 flex-1">
          <p className="text-lg font-bold text-status-green">
            {complianceDocs.length - expiredCount - expiringCount}
          </p>
          <p className="text-xs text-status-green font-medium">Current</p>
        </div>
      </div>

      <ComplianceListToolbar />

      {/* Missing documents section */}
      {showMissing && missingWorkers.length > 0 && (
        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-status-red">Missing Documents</h3>
            <Badge variant="red">{missingCount} required doc{missingCount !== 1 ? 's' : ''} absent</Badge>
          </div>
          <p className="text-xs text-text-muted mb-3">
            These workers have no record at all for a required document type. Separate from expired — no document has ever been lodged.
          </p>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-text-muted py-2 px-2">Worker</th>
                <th className="text-left text-xs font-medium text-text-muted py-2 px-2">Missing Documents</th>
              </tr>
            </thead>
            <tbody>
              {missingWorkers.map(({ worker, missingDocs }) => (
                <tr key={worker.id} className="border-b border-border last:border-0 bg-status-redLight">
                  <td className="py-2.5 px-2">
                    <p className="text-xs font-medium text-text-primary">{worker.name}</p>
                    <p className="text-xs text-text-muted">{worker.employmentType.replace('_', ' ')}</p>
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex flex-wrap gap-1">
                      {missingDocs.map(doc => (
                        <Badge key={doc} variant="red">{doc} — Missing</Badge>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* All other documents table */}
      {complianceFilter !== 'missing' && (
        <Card noPad>
          {sorted.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-8">No documents match the current filter.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-text-muted py-2.5 px-4">Worker</th>
                  <th className="text-left text-xs font-medium text-text-muted py-2.5 px-4">Document</th>
                  <th className="text-left text-xs font-medium text-text-muted py-2.5 px-4">Expiry Date</th>
                  <th className="text-left text-xs font-medium text-text-muted py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(doc => {
                  const worker = workers.find(w => w.id === doc.workerId)
                  return <ComplianceDocRow key={doc.id} doc={doc} worker={worker} />
                })}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  )
}
