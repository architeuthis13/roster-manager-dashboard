import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle, Clock, LogOut, ShieldAlert, FileWarning,
  CalendarClock, CalendarCheck, Users
} from 'lucide-react'
import { useRoster } from '../../context/RosterContext.jsx'
import { getExpiringCompliance, getExpiredCompliance } from '../../lib/complianceChecker.js'

export default function OverviewPanel() {
  const state = useRoster()
  const { shifts, leaveRequests, setShiftsFilter, setWorkersFilter, setComplianceFilter } = state
  const navigate = useNavigate()

  // Counts
  const openShifts = shifts.filter(s =>
    s.status === 'needs_filling' || s.status === 'originally_filled_vacant'
  ).length

  const incomingRequests = shifts.filter(s => s.status === 'open_requests').length

  const lateCheckins = shifts.filter(s => s.flags?.includes('late_checkin')).length
  const missedCheckins = shifts.filter(s => s.flags?.includes('missed_checkin')).length
  const totalCheckinIssues = lateCheckins + missedCheckins

  const missedCheckouts = shifts.filter(s => s.flags?.includes('missed_checkout')).length

  const complianceWarnings = shifts.filter(s => s.flags?.includes('compliance_mismatch')).length

  const expiringDocs = getExpiringCompliance(14, state).length
  const expiredDocs = getExpiredCompliance(state).length
  const totalDocIssues = expiringDocs + expiredDocs

  const pendingLeave = leaveRequests.filter(lr => lr.status === 'pending').length

  const cards = [
    {
      label: 'Open Shifts',
      count: openShifts,
      icon: CalendarClock,
      urgentColor: 'text-status-red',
      urgentBg: 'bg-status-redLight border-status-red/30',
      neutralBg: 'bg-white border-border',
      action: () => { setShiftsFilter('open'); navigate('/shifts') },
    },
    {
      label: 'Incoming Requests',
      count: incomingRequests,
      icon: CalendarCheck,
      urgentColor: 'text-status-amber',
      urgentBg: 'bg-status-amberLight border-status-amber/30',
      neutralBg: 'bg-white border-border',
      action: () => { setShiftsFilter('open'); navigate('/shifts') },
    },
    {
      label: 'Check-in Issues',
      count: totalCheckinIssues,
      icon: Clock,
      urgentColor: 'text-status-red',
      urgentBg: 'bg-status-redLight border-status-red/30',
      neutralBg: 'bg-white border-border',
      action: () => { setShiftsFilter('flagged'); navigate('/shifts') },
    },
    {
      label: 'Missed Check-outs',
      count: missedCheckouts,
      icon: LogOut,
      urgentColor: 'text-status-amber',
      urgentBg: 'bg-status-amberLight border-status-amber/30',
      neutralBg: 'bg-white border-border',
      action: () => { setShiftsFilter('flagged'); navigate('/shifts') },
    },
    {
      label: 'Compliance Warnings',
      count: complianceWarnings,
      icon: AlertCircle,
      urgentColor: 'text-status-red',
      urgentBg: 'bg-status-redLight border-status-red/30',
      neutralBg: 'bg-white border-border',
      action: () => { setShiftsFilter('flagged'); navigate('/shifts') },
    },
    {
      label: 'Document Issues',
      count: totalDocIssues,
      icon: FileWarning,
      urgentColor: 'text-status-orange',
      urgentBg: 'bg-status-orangeLight border-status-orange/30',
      neutralBg: 'bg-white border-border',
      action: () => { setComplianceFilter('all'); navigate('/compliance') },
    },
    {
      label: 'Pending Leave',
      count: pendingLeave,
      icon: Users,
      urgentColor: 'text-status-blue',
      urgentBg: 'bg-status-blueLight border-status-blue/30',
      neutralBg: 'bg-white border-border',
      action: () => navigate('/dashboard'),
    },
    {
      label: 'Overtime Risk',
      count: shifts.filter(s => s.flags?.includes('overtime_risk')).length,
      icon: ShieldAlert,
      urgentColor: 'text-status-orange',
      urgentBg: 'bg-status-orangeLight border-status-orange/30',
      neutralBg: 'bg-white border-border',
      action: () => { setWorkersFilter('overtime_risk'); navigate('/workers') },
    },
  ]

  return (
    <div className="grid grid-cols-8 gap-3 mb-5">
      {cards.map(({ label, count, icon: Icon, urgentColor, urgentBg, neutralBg, action }) => {
        const isUrgent = count > 0
        return (
          <button
            key={label}
            onClick={action}
            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-center transition-all hover:shadow-md cursor-pointer ${
              isUrgent ? urgentBg : neutralBg
            }`}
          >
            <Icon
              size={18}
              className={isUrgent ? urgentColor : 'text-text-muted'}
            />
            <span
              className={`text-2xl font-bold leading-none ${
                isUrgent ? urgentColor : 'text-text-muted'
              }`}
            >
              {count}
            </span>
            <span className="text-xs text-text-secondary leading-tight">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
