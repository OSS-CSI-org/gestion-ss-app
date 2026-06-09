'use client'

import { ReactNode } from 'react'
import Link from 'next/link'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  href?: string
  className?: string
}

export default function StatCard({ title, value, subtitle, icon, href, className = '' }: StatCardProps) {
  const inner = (
    <div className={`bg-white-pure border border-text-anthracite/5 p-6 ${href ? 'cursor-pointer hover:border-prune-sec/20 hover:shadow-sm transition-all' : ''} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-text-anthracite/60">
            {title}
          </p>
          <p className="mt-2 text-2xl font-semibold text-prune-main">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-text-anthracite/50">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="text-prune-sec/40">{icon}</div>
        )}
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{inner}</Link>
  }

  return inner
}
