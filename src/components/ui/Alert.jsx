import React from 'react'
import { AlertCircle, AlertTriangle, Info, XCircle } from 'lucide-react'

const severityConfig = {
  critical: {
    bg: 'bg-status-redLight border-status-red/30',
    icon: XCircle,
    iconColor: 'text-status-red',
    titleColor: 'text-status-red',
  },
  error: {
    bg: 'bg-status-redLight border-status-red/20',
    icon: AlertCircle,
    iconColor: 'text-status-red',
    titleColor: 'text-status-red',
  },
  warning: {
    bg: 'bg-status-amberLight border-status-amber/30',
    icon: AlertTriangle,
    iconColor: 'text-status-amber',
    titleColor: 'text-status-amber',
  },
  info: {
    bg: 'bg-status-blueLight border-status-blue/20',
    icon: Info,
    iconColor: 'text-status-blue',
    titleColor: 'text-status-blue',
  },
}

export default function Alert({ severity = 'info', title, description, action }) {
  const { bg, icon: Icon, iconColor, titleColor } = severityConfig[severity] || severityConfig.info
  return (
    <div className={`flex gap-3 p-3 rounded-md border ${bg}`}>
      <Icon size={16} className={`${iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold ${titleColor}`}>{title}</p>
        {description && <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{description}</p>}
        {action && <div className="mt-1.5">{action}</div>}
      </div>
    </div>
  )
}
