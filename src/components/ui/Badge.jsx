import React from 'react'

const variants = {
  default: 'bg-gray-100 text-gray-700',
  red: 'bg-status-redLight text-status-red',
  amber: 'bg-status-amberLight text-status-amber',
  orange: 'bg-status-orangeLight text-status-orange',
  blue: 'bg-status-blueLight text-status-blue',
  green: 'bg-status-greenLight text-status-green',
  grey: 'bg-gray-100 text-text-muted',
  brand: 'bg-brand-light text-brand',
}

/**
 * Small pill badge.
 * variant: 'default' | 'red' | 'amber' | 'orange' | 'blue' | 'green' | 'grey' | 'brand'
 */
export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  )
}
