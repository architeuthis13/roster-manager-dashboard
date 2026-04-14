import React from 'react'

export default function Card({ children, className = '', noPad = false }) {
  return (
    <div
      className={`bg-card border border-border rounded-lg shadow-sm ${noPad ? '' : 'p-4'} ${className}`}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div>
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="ml-3 flex-shrink-0">{action}</div>}
    </div>
  )
}
