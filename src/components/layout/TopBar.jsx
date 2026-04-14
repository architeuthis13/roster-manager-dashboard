import React from 'react'
import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useRoster } from '../../context/RosterContext.jsx'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/shifts': 'Shifts',
  '/workers': 'Workers',
  '/compliance': 'Compliance',
}

export default function TopBar() {
  const location = useLocation()
  const { shifts } = useRoster()
  const title = pageTitles[location.pathname] || 'Dashboard'

  const criticalCount = shifts.filter(s =>
    s.flags?.some(f => ['missed_checkin', 'missed_checkout', 'compliance_mismatch', 'escalated'].includes(f))
  ).length

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-border flex-shrink-0">
      <h1 className="text-base font-semibold text-text-primary">{title}</h1>
      <div className="flex items-center gap-3">
        {criticalCount > 0 && (
          <div className="relative">
            <Bell size={18} className="text-text-secondary" />
            <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[10px] font-bold bg-status-red text-white rounded-full">
              {criticalCount}
            </span>
          </div>
        )}
        <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white text-xs font-semibold">
          RM
        </div>
      </div>
    </header>
  )
}
