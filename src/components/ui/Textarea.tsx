'use client'

import { TextareaHTMLAttributes, useId } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export default function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const genId = useId()
  const textareaId = id || genId
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={textareaId} className="text-xs font-medium uppercase tracking-wider text-text-anthracite/60">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full border bg-white-pure px-3 py-2 text-sm text-text-anthracite placeholder:text-text-anthracite/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-prune-main/40 focus-visible:border-prune-main transition-colors resize-y min-h-[80px] ${
          error ? 'border-alert-red' : 'border-text-anthracite/15'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-alert-red">{error}</p>
      )}
    </div>
  )
}
