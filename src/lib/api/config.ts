/**
 * Configuration de la source de données.
 *
 * - `mock` : l'app lit/écrit les données locales (src/data/mock.ts). Aucun backend requis.
 * - `http` : l'app appelle l'API REST sur NEXT_PUBLIC_API_URL.
 *
 * Le jour où le backend Spring Boot est disponible : passer NEXT_PUBLIC_DATA_SOURCE=http
 * et renseigner NEXT_PUBLIC_API_URL — aucun composant à modifier.
 */
export type DataSource = 'mock' | 'http'

export const DATA_SOURCE: DataSource =
  process.env.NEXT_PUBLIC_DATA_SOURCE === 'http' ? 'http' : 'mock'

export const API_URL: string =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '/api'

export const USE_MOCK = DATA_SOURCE === 'mock'

/** Clés de persistance (session) dans le localStorage. */
export const TOKEN_KEY = 'oss.token'
export const USER_KEY = 'oss.user'
