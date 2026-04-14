import React from 'react'
import { useRoster } from '../context/RosterContext.jsx'
import ComplianceListToolbar from '../components/compliance/ComplianceListToolbar.jsx'
import ComplianceDocRow from '../components/compliance/ComplianceDocRow.jsx'
import Card from '../components/ui/Card.jsx'
import { daysBetween, todayStr } from '../lib/dateUtils.js'

export default function CompliancePage() {
  const { complianceDocs, workers, complianceFilter } = useRoster()
  const today = todayStr()

  const filtered = complianceDocs.filter(doc => {
    if (complianceFilter === 'expired') return doc.status === 'expired'
    if (complianceFilter === 'expiring_soon') return doc.status === 'expiring_soon'
    return true
  })

  // Sort: expired first, then expiring_soon by days remaining, then current
  const sorted = [...filtered].sort((a, b) => {
    const order = { expired: 0, expiring_soon: 1, current: 2 }
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status]
    return daysBetween(today, a.expiryDate) - daysBetween(today, b.expiryDate)
  })

  const expiredCount = complianceDocs.filter(d => d.status === 'expired').length
  const expiringCount = complianceDocs.filter(d => d.status === 'expiring_soon').length

  return (
    <div className="max-w-4xl">
      {/* Summary */}
      <div className="flex gap-4 mb-5">
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
    </div>
  )
}
