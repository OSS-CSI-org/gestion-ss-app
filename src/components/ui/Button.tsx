'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger'
  size?: 'sm' | 'md'
  loading?: boolean
  children: ReactNode
}

export default function Button({ variant = 'primary', size = 'md', loading = false, children, className = '', disabled, ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-prune-main text-prune-light hover:bg-prune-sec border border-prune-main',
    secondary: 'bg-white-pure text-text-anthracite hover:bg-bg-offwhite border border-text-anthracite/20',
    ghost: 'bg-transparent text-text-anthracite hover:bg-text-anthracite/5 border border-transparent',
    success: 'bg-success-green text-white-pure hover:opacity-90 border border-success-green',
    danger: 'bg-alert-red text-white-pure hover:opacity-90 border border-alert-red',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs min-h-[36px]',
    md: 'px-4 py-2 text-sm min-h-[44px]',
  }

  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-prune-main/40 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin -ml-1 mr-1.5" />}
      {children}
    </button>
  )
}
