'use client'

import { useState, useCallback, ReactNode } from 'react'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

interface ConfirmOptions {
  message: string
  title?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
}

export function useConfirm() {
  const [state, setState] = useState<{
    options: ConfirmOptions
    resolve: (value: boolean) => void
  } | null>(null)

  const confirm = useCallback(
    (messageOrOptions: string | ConfirmOptions): Promise<boolean> => {
      const options: ConfirmOptions =
        typeof messageOrOptions === 'string'
          ? { message: messageOrOptions }
          : messageOrOptions

      return new Promise(resolve => {
        setState({ options, resolve })
      })
    },
    []
  )

  const handleConfirm = useCallback(() => {
    state?.resolve(true)
    setState(null)
  }, [state])

  const handleCancel = useCallback(() => {
    state?.resolve(false)
    setState(null)
  }, [state])

  let dialog: ReactNode = null

  if (state) {
    dialog = (
      <ConfirmDialog
        open={!!state}
        title={state.options.title}
        message={state.options.message}
        confirmLabel={state.options.confirmLabel}
        cancelLabel={state.options.cancelLabel}
        variant={state.options.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    )
  }

  return { confirm, dialog }
}
