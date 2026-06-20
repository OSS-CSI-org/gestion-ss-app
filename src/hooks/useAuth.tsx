'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { login as loginService, me, type AuthUser } from '@/lib/services/auth'
import { ApiError } from '@/lib/api/client'
import { TOKEN_KEY, USER_KEY, USE_MOCK } from '@/lib/api/config'

export type AuthLoginResult =
  | { success: true }
  | { success: false; message: string }

interface AuthContextType {
  user: AuthUser | null
  login: (login: string, password: string) => Promise<AuthLoginResult>
  logout: () => void
  isAuthenticated: boolean
  /** true tant que la session n'a pas été restaurée depuis le localStorage. */
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function loginErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return 'Identifiant ou mot de passe incorrect'
    if (err.status >= 500) return 'Le serveur est indisponible. Réessayez plus tard.'
    return err.message
  }
  if (err instanceof Error) {
    if (err.message.includes('incorrect')) return err.message
    if (err.message.includes('fetch') || err.message.includes('network')) {
      return 'Impossible de joindre le serveur. Vérifiez votre connexion.'
    }
  }
  return 'Impossible de joindre le serveur. Vérifiez votre connexion.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      try {
        const raw = window.localStorage.getItem(USER_KEY)
        const token = window.localStorage.getItem(TOKEN_KEY)

        if (!raw || !token) return

        if (USE_MOCK) {
          if (!cancelled) setUser(JSON.parse(raw) as AuthUser)
          return
        }

        const freshUser = await me()
        if (cancelled) return
        setUser(freshUser)
        window.localStorage.setItem(USER_KEY, JSON.stringify(freshUser))
      } catch {
        window.localStorage.removeItem(TOKEN_KEY)
        window.localStorage.removeItem(USER_KEY)
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    restoreSession()
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (loginValue: string, password: string): Promise<AuthLoginResult> => {
    try {
      const { token, user: loggedInUser } = await loginService(loginValue, password)
      window.localStorage.setItem(TOKEN_KEY, token)
      window.localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser))
      setUser(loggedInUser)
      return { success: true }
    } catch (err) {
      return { success: false, message: loginErrorMessage(err) }
    }
  }, [])

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: user !== null, loading }}>
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
