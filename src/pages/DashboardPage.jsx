import React from 'react'
import OverviewPanel from '../components/dashboard/OverviewPanel.jsx'
import CriticalAlertsPanel from '../components/dashboard/CriticalAlertsPanel.jsx'
import OpenShiftsSummaryPanel from '../components/dashboard/OpenShiftsSummaryPanel.jsx'
import ComplianceExpiryPanel from '../components/dashboard/ComplianceExpiryPanel.jsx'
import LeaveRequestsPanel from '../components/dashboard/LeaveRequestsPanel.jsx'
import ShiftCoverageChart from '../components/dashboard/ShiftCoverageChart.jsx'
import WorkforceUtilisationChart from '../components/dashboard/WorkforceUtilisationChart.jsx'
import ComplianceExpiryChart from '../components/dashboard/ComplianceExpiryChart.jsx'

export default function DashboardPage() {
  return (
    <div className="space-y-5 max-w-7xl">
      {/* Operations Overview — 8 clickable stat cards */}
      <OverviewPanel />

      {/* Second row: Alerts + Open Shifts + Compliance */}
      <div className="grid grid-cols-3 gap-5">
        <CriticalAlertsPanel />
        <OpenShiftsSummaryPanel />
        <ComplianceExpiryPanel />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-5">
        <ShiftCoverageChart />
        <WorkforceUtilisationChart />
        <ComplianceExpiryChart />
      </div>

      {/* Leave requests — full width */}
      <LeaveRequestsPanel />
    </div>
  )
}
