import { USE_MOCK } from '@/lib/api/config'
import { apiFetch } from '@/lib/api/client'
import { utilisateurs, medecins } from '@/data/mock'
import { Role } from '@/lib/types'
import { mockDelay } from './_mock'

/** Utilisateur authentifié exposé à l'app (jamais de mot de passe). */
export interface AuthUser {
  login: string
  nom: string
  prenom: string
  role: Role
  numMedecin?: number
}

export interface LoginResult {
  token: string
  user: AuthUser
}

/** Réponse brute du backend Spring Boot */
interface BackendLoginResponse {
  token: string
  user?: {
    login: string
    nom: string
    prenom: string
    role: string
    numMedecin?: number | null
  }
  // Ancienne structure (compatibilité) : { token, login, roles[] }
  login?: string
  roles?: string[]
}

/**
 * Normalise la réponse du backend en LoginResult compatible frontend.
 * Gère deux formats possibles :
 *   - Nouveau : { token, user: { login, nom, prenom, role, numMedecin? } }
 *   - Ancien  : { token, login, roles: string[] }
 */
function normalizeBackendResponse(raw: BackendLoginResponse): LoginResult {
  if (raw.user) {
    // Format nouveau conforme au contrat
    const backendRole = raw.user.role ?? ''
    // Normalisation du rôle (on accepte avec ou sans préfixe ROLE_)
    let role: Role = 'AGENT_OSS'
    if (backendRole.includes('MEDECIN')) {
      role = 'MEDECIN'
    } else if (backendRole.includes('AGENT_OSS')) {
      role = 'AGENT_OSS'
    }
    return {
      token: raw.token,
      user: {
        login: raw.user.login,
        nom: raw.user.nom ?? raw.user.login,
        prenom: raw.user.prenom ?? '',
        role,
        ...(raw.user.numMedecin ? { numMedecin: raw.user.numMedecin } : {}),
      },
    }
  }

  // Format ancien (fallback) : { token, login, roles[] }
  const roles = raw.roles ?? []
  let role: Role = 'AGENT_OSS'
  if (roles.some((r) => r.includes('MEDECIN'))) role = 'MEDECIN'

  return {
    token: raw.token,
    user: {
      login: raw.login ?? 'unknown',
      nom: raw.login ?? 'Utilisateur',
      prenom: '',
      role,
    },
  }
}

export async function login(loginValue: string, motDePasse: string): Promise<LoginResult> {
  if (USE_MOCK) {
    await mockDelay()
    const found = utilisateurs.find((u) => u.login === loginValue && u.motDePasse === motDePasse)
    if (!found) {
      throw new Error('Identifiant ou mot de passe incorrect')
    }
    const numMedecin = medecins.find((m) => m.login === found.login)?.numMedecin
    const user: AuthUser = {
      login: found.login,
      nom: found.nom,
      prenom: found.prenom,
      role: found.role,
      ...(numMedecin ? { numMedecin } : {}),
    }
    return { token: `mock.${found.login}`, user }
  }

  // Mode HTTP — appel au backend Spring Boot
  // Le backend attend { login, password } (champ "password" dans LoginRequest.java)
  const raw = await apiFetch<BackendLoginResponse>('/auth/login', {
    method: 'POST',
    body: { login: loginValue, password: motDePasse },
  })
  return normalizeBackendResponse(raw)
}

/** Récupère l'utilisateur courant depuis le token (mode http uniquement). */
export async function me(): Promise<AuthUser> {
  if (USE_MOCK) {
    throw new Error('me() non disponible en mode mock')
  }
  return apiFetch<AuthUser>('/auth/me')
}
