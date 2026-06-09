'use client'

import { useState, useEffect } from 'react'

export function useCSSVar(name: string, fallback: string): string {
  const [value, setValue] = useState(fallback)

  useEffect(() => {
    const update = () => {
      const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
      if (val) setValue(val)
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    })
    return () => observer.disconnect()
  }, [name])

  return value
}
