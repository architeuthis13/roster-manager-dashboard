import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Calendar, Users, ShieldCheck } from 'lucide-react'
import { useRoster } from '../../context/RosterContext.jsx'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/shifts', label: 'Shifts', icon: Calendar },
  { to: '/workers', label: 'Workers', icon: Users },
  { to: '/compliance', label: 'Compliance', icon: ShieldCheck },
]

export default function Sidebar() {
  const { shifts } = useRoster()

  const openCount = shifts.filter(
    s => s.status === 'needs_filling' || s.status === 'open_requests' || s.status === 'published_awaiting' || s.status === 'originally_filled_vacant'
  ).length

  const alertCount = shifts.filter(s =>
    s.flags?.some(f => ['missed_checkin', 'compliance_mismatch', 'escalated'].includes(f))
  ).length

  return (
    <aside className="flex flex-col w-56 min-h-screen bg-white border-r border-border">
      {/* Logo / App Name */}
      <div className="px-5 py-5 border-b border-border">
        <span className="text-sm font-semibold text-text-secondary uppercase tracking-widest">
          Roster Manager
        </span>
        <p className="text-xs text-text-muted mt-0.5">Command Centre</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-light text-brand'
                  : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
              }`
            }
          >
            <Icon size={16} />
            <span>{label}</span>
            {label === 'Shifts' && openCount > 0 && (
              <span className="ml-auto text-xs font-semibold bg-status-red text-white rounded-full px-1.5 py-0.5 leading-none">
                {openCount}
              </span>
            )}
            {label === 'Dashboard' && alertCount > 0 && (
              <span className="ml-auto text-xs font-semibold bg-status-red text-white rounded-full px-1.5 py-0.5 leading-none">
                {alertCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border">
        <p className="text-xs text-text-muted">
          Week of{' '}
          <span className="font-medium text-text-secondary">14–20 Apr 2026</span>
        </p>
      </div>
    </aside>
  )
}
