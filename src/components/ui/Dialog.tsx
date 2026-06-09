'use client'

import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { useFocusTrap } from '@/hooks/useFocusTrap'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  className?: string
}

export default function Dialog({ open, onClose, children, title, className = '' }: DialogProps) {
  const ref = useFocusTrap(open)

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialogue'}
        className={`bg-white-pure w-full max-w-md mx-4 shadow-2xl ${className}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1 w-full bg-gradient-to-r from-prune-main/20 via-prune-main to-prune-main/20 animate-shimmer" />

        {title && (
          <div className="flex items-center justify-between px-6 pt-5 pb-0">
            <h3 className="text-sm font-semibold text-prune-main">{title}</h3>
            <button
              onClick={onClose}
              className="text-text-anthracite/45 hover:text-alert-red transition-colors"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
