import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import { useRoster } from '../../context/RosterContext.jsx'
import Card, { CardHeader } from '../ui/Card.jsx'
import { daysBetween, todayStr } from '../../lib/dateUtils.js'

export default function ComplianceExpiryChart() {
  const { complianceDocs } = useRoster()
  const today = todayStr()

  const buckets = [
    { label: 'Expired', min: -Infinity, max: 0, color: '#DC2626' },
    { label: '0–7d', min: 0, max: 7, color: '#EA580C' },
    { label: '8–14d', min: 7, max: 14, color: '#D97706' },
    { label: '15–30d', min: 14, max: 30, color: '#2563EB' },
    { label: '31–90d', min: 30, max: 90, color: '#16A34A' },
  ]

  const data = buckets.map(bucket => {
    const count = complianceDocs.filter(doc => {
      const days = daysBetween(today, doc.expiryDate)
      return days >= bucket.min && days < bucket.max
    }).length
    return { ...bucket, count }
  })

  return (
    <Card>
      <CardHeader title="Compliance Timeline" subtitle="Docs by days until expiry" />
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={24} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            formatter={(value) => [value, 'Documents']}
            contentStyle={{ fontSize: 12, border: '1px solid #E2E8F0', borderRadius: 6 }}
            cursor={{ fill: '#F8FAFC' }}
          />
          <Bar dataKey="count" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
