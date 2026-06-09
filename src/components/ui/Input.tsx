'use client'

import { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  rightElement?: ReactNode
}

export default function Input({ label, error, rightElement, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium uppercase tracking-wider text-text-anthracite/60">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`w-full border border-text-anthracite/15 bg-white-pure px-3 py-2 text-sm text-text-anthracite placeholder:text-text-anthracite/30 focus:outline-none focus:border-prune-main transition-colors ${
            error ? 'border-alert-red' : ''
          } ${rightElement ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-alert-red">{error}</p>
      )}
    </div>
  )
}
