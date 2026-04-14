import React, { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { minutesUntil } from '../../lib/dateUtils.js'

/**
 * Pulsing red countdown badge showing time until shift starts.
 * Used for EC-01 escalation.
 */
export default function CountdownBadge({ shift }) {
  const [mins, setMins] = useState(() => minutesUntil(shift.date, shift.startTime))

  useEffect(() => {
    const interval = setInterval(() => {
      setMins(minutesUntil(shift.date, shift.startTime))
    }, 60000)
    return () => clearInterval(interval)
  }, [shift.date, shift.startTime])

  if (mins === null) return null

  const isPast = mins <= 0
  const hours = Math.floor(Math.abs(mins) / 60)
  const minutes = Math.abs(mins) % 60

  let label
  if (isPast) {
    label = `Started ${hours > 0 ? `${hours}h ` : ''}${minutes}m ago`
  } else if (hours > 0) {
    label = `Starts in ${hours}h ${minutes}m`
  } else {
    label = `Starts in ${minutes}m`
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-status-redLight text-status-red border border-status-red/20 pulse-red">
      <Clock size={10} />
      {label}
    </span>
  )
}
