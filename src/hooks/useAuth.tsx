'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Utilisateur } from '@/lib/types'
import { utilisateurs } from '@/data/mock'

interface AuthContextType {
  user: Utilisateur | null
  login: (login: string, password: string) => boolean
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Utilisateur | null>(null)

  const login = useCallback((loginValue: string, password: string): boolean => {
    const found = utilisateurs.find(u => u.login === loginValue && u.motDePasse === password)
    if (found) {
      setUser(found)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: user !== null }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
