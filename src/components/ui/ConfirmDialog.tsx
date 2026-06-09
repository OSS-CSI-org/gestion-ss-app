'use client'

import Dialog from './Dialog'
import Button from './Button'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title = 'Confirmer',
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} title="">
      <div className="text-center">
        <div className={`w-12 h-12 border-2 flex items-center justify-center mx-auto mb-4 ${
          variant === 'danger'
            ? 'border-alert-red/30 bg-alert-red/5'
            : 'border-prune-main/20 bg-prune-main/5'
        }`}>
          <AlertTriangle size={22} className={
            variant === 'danger' ? 'text-alert-red' : 'text-prune-main'
          } />
        </div>
        <p className="text-sm font-semibold text-prune-main mb-1">{title}</p>
        <p className="text-sm text-text-anthracite/60 mb-6 leading-relaxed whitespace-pre-line">{message}</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
