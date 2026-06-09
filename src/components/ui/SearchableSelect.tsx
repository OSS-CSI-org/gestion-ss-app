'use client'

import { useState, useRef, useEffect } from 'react'

interface SearchableOption {
  value: string
  label: string
}

interface SearchableSelectProps {
  label?: string
  options: SearchableOption[]
  placeholder?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: string
  disabled?: boolean
  creatable?: boolean
}

export default function SearchableSelect({
  label,
  options,
  placeholder,
  value,
  onChange,
  required,
  error,
  disabled,
  creatable,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)

  const filtered = query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  const isExactMatch = query && options.some(o => o.label.toLowerCase() === query.toLowerCase())
  const showCreate = creatable && query && !isExactMatch

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const displayValue = open
    ? query
    : selected
      ? selected.label
      : value
        ? value
        : ''

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      {label && (
        <label className="text-xs font-medium uppercase tracking-wider text-text-anthracite/60">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          className={`w-full border bg-white-pure px-3 py-2 text-sm text-text-anthracite focus:outline-none focus:border-prune-main transition-colors ${
            error ? 'border-alert-red' : 'border-text-anthracite/15'
          }`}
          placeholder={selected ? selected.label : placeholder || ''}
          value={displayValue}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => { setOpen(true); setQuery('') }}
          required={required}
          disabled={disabled}
          readOnly={disabled}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-anthracite/30 pointer-events-none text-xs">
          {open ? '▲' : '▼'}
        </span>
      </div>
      {open && (
        <div className="relative">
          <div className="absolute z-10 top-0 left-0 w-full border border-text-anthracite/15 bg-white-pure shadow-lg max-h-48 overflow-y-auto">
            {filtered.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm hover:bg-prune-main/5 transition-colors ${
                  opt.value === value ? 'bg-prune-main/10 text-prune-main font-medium' : 'text-text-anthracite'
                }`}
                onClick={() => { onChange(opt.value); setOpen(false); setQuery('') }}
              >
                {opt.label}
              </button>
            ))}
            {filtered.length === 0 && !showCreate && (
              <div className="px-3 py-2 text-sm text-text-anthracite/40">Aucun résultat</div>
            )}
            {showCreate && (
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-prune-main font-medium hover:bg-prune-main/5 transition-colors border-t border-text-anthracite/10"
                onClick={() => { onChange(query); setOpen(false); setQuery('') }}
              >
                + Saisir &laquo;{query}&raquo;
              </button>
            )}
          </div>
        </div>
      )}
      {error && <p className="text-xs text-alert-red">{error}</p>}
    </div>
  )
}
