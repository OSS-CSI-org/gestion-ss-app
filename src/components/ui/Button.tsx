'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger'
  size?: 'sm' | 'md'
  children: ReactNode
}

export default function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-prune-main text-prune-light hover:bg-prune-sec border border-prune-main',
    secondary: 'bg-white-pure text-text-anthracite hover:bg-bg-offwhite border border-text-anthracite/20',
    ghost: 'bg-transparent text-text-anthracite hover:bg-text-anthracite/5 border border-transparent',
    success: 'bg-success-green text-white-pure hover:opacity-90 border border-success-green',
    danger: 'bg-alert-red text-white-pure hover:opacity-90 border border-alert-red',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
  }

  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
