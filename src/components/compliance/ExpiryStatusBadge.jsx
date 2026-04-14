import React from 'react'
import Badge from '../ui/Badge.jsx'
import { daysBetween, todayStr } from '../../lib/dateUtils.js'

export default function ExpiryStatusBadge({ doc }) {
  const today = todayStr()
  const days = daysBetween(today, doc.expiryDate)

  if (doc.status === 'expired') {
    return <Badge variant="red">Expired {Math.abs(days)}d ago</Badge>
  }
  if (doc.status === 'expiring_soon') {
    return <Badge variant="amber">{days}d remaining</Badge>
  }
  return <Badge variant="green">{days}d remaining</Badge>
}
