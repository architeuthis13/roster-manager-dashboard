import React from 'react'
import Badge from './Badge.jsx'
import { daysBetween } from '../../lib/dateUtils.js'

export default function ComplianceTag({ doc }) {
  const today = new Date().toISOString().slice(0, 10)
  const days = daysBetween(today, doc.expiryDate)

  let variant = 'green'
  let label = doc.docType

  if (doc.status === 'expired') {
    variant = 'red'
    label = `${doc.docType} — EXPIRED`
  } else if (doc.status === 'expiring_soon') {
    variant = 'amber'
    label = `${doc.docType} — ${days}d`
  }

  return <Badge variant={variant}>{label}</Badge>
}
