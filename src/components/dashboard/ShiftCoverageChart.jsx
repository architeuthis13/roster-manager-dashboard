import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useRoster } from '../../context/RosterContext.jsx'
import Card, { CardHeader } from '../ui/Card.jsx'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const openStatuses = ['needs_filling', 'open_requests', 'published_awaiting', 'originally_filled_vacant']

export default function ShiftCoverageChart() {
  const { shifts, config } = useRoster()

  // Generate 7-day array dynamically from config week start
  const weekStart = new Date(config.currentWeekStart + 'T00:00:00')
  const DAYS = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return {
      key: d.toISOString().slice(0, 10),
      label: DAY_LABELS[d.getDay()],
    }
  })

  const data = DAYS.map(({ key, label }) => {
    const dayShifts = shifts.filter(s => s.date === key)
    const filled = dayShifts.filter(s => s.status === 'filled').length
    const open = dayShifts.filter(s => openStatuses.includes(s.status)).length
    return { day: label, Filled: filled, Open: open }
  })

  return (
    <Card>
      <CardHeader title="Shift Coverage" subtitle="Filled vs open per day this week" />
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={12} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, border: '1px solid #E2E8F0', borderRadius: 6 }}
            cursor={{ fill: '#F8FAFC' }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: '#64748B' }} iconType="circle" iconSize={8} />
          <Bar dataKey="Filled" fill="#16A34A" radius={[2, 2, 0, 0]} />
          <Bar dataKey="Open" fill="#DC2626" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
