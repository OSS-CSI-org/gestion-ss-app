'use client'

import { useEffect } from 'react'

type KeyMap = Record<string, (...args: any[]) => void>

export function useKeyboard(keyMap: KeyMap, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    function handler(e: KeyboardEvent) {
      const key = [
        e.ctrlKey || e.metaKey ? 'Ctrl' : '',
        e.altKey ? 'Alt' : '',
        e.shiftKey ? 'Shift' : '',
        e.key.length === 1 ? e.key.toUpperCase() : e.key,
      ].filter(Boolean).join('+')

      if (keyMap[key]) {
        e.preventDefault()
        keyMap[key]()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [keyMap, enabled])
}
