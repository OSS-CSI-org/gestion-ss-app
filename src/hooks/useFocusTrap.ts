'use client'

import { useEffect, useRef } from 'react'

export function useFocusTrap(open: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previousFocus.current = document.activeElement as HTMLElement

    const trap = ref.current
    if (!trap) return

    const focusable = trap.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    first?.focus()

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    document.addEventListener('keydown', handler)
    trap.addEventListener('keydown', handler)

    return () => {
      document.removeEventListener('keydown', handler)
      trap.removeEventListener('keydown', handler)
      previousFocus.current?.focus()
    }
  }, [open])

  return ref
}
