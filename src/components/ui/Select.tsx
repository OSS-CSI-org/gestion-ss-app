'use client'

import { SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  placeholder?: string
  error?: string
}

export default function Select({ label, options, placeholder, error, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium uppercase tracking-wider text-text-anthracite/60">
          {label}
        </label>
      )}
      <select
        className={`border border-text-anthracite/15 bg-white-pure px-3 py-2 text-sm text-text-anthracite focus:outline-none focus:border-prune-main transition-colors ${
          error ? 'border-alert-red' : ''
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-alert-red">{error}</p>
      )}
    </div>
  )
}
