'use client'

import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'alert' | 'gold' | 'prune'
  className?: string
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-prune-sec/10 text-prune-sec border-prune-sec/20',
    success: 'bg-success-green/10 text-success-green border-success-green/20',
    alert: 'bg-alert-red/10 text-alert-red border-alert-red/20',
    gold: 'bg-sable-gold/10 text-sable-gold border-sable-gold/20',
    prune: 'bg-prune-main/10 text-prune-main border-prune-main/20',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
