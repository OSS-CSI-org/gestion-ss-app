'use client'

import { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-14 h-14 border-2 border-text-anthracite/10 flex items-center justify-center mb-4 text-text-anthracite/20">
        {icon || <Inbox size={28} />}
      </div>
      <p className="text-sm font-medium text-text-anthracite/60 mb-1">{title}</p>
      {description && (
        <p className="text-xs text-text-anthracite/60 mb-4 text-center max-w-xs">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
