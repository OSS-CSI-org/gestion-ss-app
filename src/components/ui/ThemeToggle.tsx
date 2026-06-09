'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { applyTheme, isDarkTheme } from '@/lib/theme'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(isDarkTheme())
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    applyTheme(next)
    try { localStorage.setItem('theme', next ? 'dark' : 'light') } catch {}
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 w-full mt-1 px-2 py-2 text-xs text-prune-light/50 hover:text-prune-light hover:bg-white/5 transition-colors"
      title={dark ? 'Mode clair' : 'Mode sombre'}
    >
      {dark ? <Sun size={14} /> : <Moon size={14} />}
      <span>{dark ? 'Mode clair' : 'Mode sombre'}</span>
    </button>
  )
}
