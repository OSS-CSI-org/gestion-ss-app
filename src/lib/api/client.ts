import { API_URL, TOKEN_KEY, USER_KEY } from './config'

/** Erreur normalisée pour tous les appels API. */
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Lit le token JWT persisté (côté navigateur uniquement). */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

/**
 * Wrapper fetch typé : préfixe l'URL de base, sérialise le JSON, injecte le
 * header Authorization, et lève une ApiError sur réponse non-OK.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options
  const token = getToken()

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let message = `Erreur ${res.status}`
    try {
      const data = await res.json()
      message = data?.message || data?.error || message
    } catch {
      // réponse non-JSON : on garde le message par défaut
    }

    if (res.status === 401 && token && !path.includes('/auth/')) {
      window.localStorage.removeItem(TOKEN_KEY)
      window.localStorage.removeItem(USER_KEY)
      const redirect = encodeURIComponent(window.location.pathname)
      window.location.href = `/login?reason=session_expired&redirect=${redirect}`
    }

    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
