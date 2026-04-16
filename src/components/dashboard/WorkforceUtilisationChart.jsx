import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import { useRoster } from '../../context/RosterContext.jsx'
import Card, { CardHeader } from '../ui/Card.jsx'
import { calculateWorkerHours } from '../../lib/hoursEngine.js'

const levelColors = {
  none: '#16A34A',
  amber: '#D97706',
  orange: '#EA580C',
  red: '#DC2626',
  critical: '#991B1B',
}

export default function WorkforceUtilisationChart() {
  const state = useRoster()
  const { workers } = state

  // Only show permanent workers (they have contracted hours)
  const permWorkers = workers.filter(w => w.employmentType !== 'casual')

  const data = permWorkers.map(worker => {
    const hours = calculateWorkerHours(worker.id, state)
    // Use pendingUpper (worst-case including pending requests) so chart shows full risk exposure
    const worstCase = hours?.pendingUpper ?? hours?.baseHours ?? 0
    const pct = hours?.contractedHours
      ? Math.round((worstCase / hours.contractedHours) * 100)
      : 0
    // Derive warning level from pendingUpper so bar colour reflects worst-case too
    const pendingLevel = !hours?.contractedHours ? 'none'
      : pct >= 110 ? 'critical'
      : pct >= 100 ? 'red'
      : pct >= 90 ? 'orange'
      : pct >= 80 ? 'amber'
      : 'none'
    return {
      name: worker.name.split(' ')[0],
      pct,
      warningLevel: pendingLevel,
      hasPending: (hours?.pendingHours ?? 0) > 0,
    }
  })

  return (
    <Card>
      <CardHeader title="Workforce Utilisation" subtitle="% of contracted hours incl. pending (permanent staff)" />
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} layout="vertical" barSize={10} margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 120]}
            tick={{ fontSize: 10, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 10, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            formatter={(value, name, props) => [
              `${value}%${props.payload?.hasPending ? ' (incl. pending)' : ''}`,
              'Utilisation',
            ]}
            contentStyle={{ fontSize: 12, border: '1px solid #E2E8F0', borderRadius: 6 }}
            cursor={{ fill: '#F8FAFC' }}
          />
          <Bar dataKey="pct" radius={[0, 2, 2, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={levelColors[entry.warningLevel] || levelColors.none} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
