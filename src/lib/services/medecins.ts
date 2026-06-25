import { USE_MOCK } from '@/lib/api/config'
import { apiFetch, ApiError } from '@/lib/api/client'
import {
  medecins,
  assures,
  utilisateurs,
  ajouterUtilisateur,
  mettreAJourMotDePasse,
  supprimerMedecin as supprimerMedecinMock,
} from '@/data/mock'
import { Medecin } from '@/lib/types'
import { MedecinFormData } from '@/lib/schemas'
import { mockDelay } from './_mock'

const MOT_DE_PASSE_DEFAUT = 'med@2026'

export async function listMedecins(): Promise<Medecin[]> {
  if (USE_MOCK) {
    await mockDelay()
    return [...medecins]
  }
  return apiFetch<Medecin[]>('/medecins')
}

export async function getMedecin(id: number): Promise<Medecin | null> {
  if (USE_MOCK) {
    await mockDelay()
    return medecins.find(m => m.numMedecin === id) ?? null
  }
  try {
    return await apiFetch<Medecin>(`/medecins/${id}`)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

export async function createMedecin(data: MedecinFormData): Promise<Medecin> {
  if (USE_MOCK) {
    await mockDelay()
    const numMedecin = Math.max(0, ...medecins.map(m => m.numMedecin)) + 1
    const nouveau: Medecin = {
      numMedecin,
      nom: data.nom,
      prenom: data.prenom,
      email: data.email || undefined,
      dateNaissance: data.dateNaissance,
      sexe: data.sexe,
      login: data.login,
      typeMedecin: data.typeMedecin,
      typeFormation: data.typeFormation || undefined,
      nomSpecialite: data.nomSpecialite || undefined,
      actif: true,
      estAssure: data.estAssure ?? false,
    }
    medecins.push(nouveau)
    ajouterUtilisateur({
      login: data.login,
      nom: data.nom,
      prenom: data.prenom,
      role: 'MEDECIN',
      motDePasse: MOT_DE_PASSE_DEFAUT,
    })
    // Si le médecin est aussi assuré, créer une fiche d'assuré correspondante
    if (data.estAssure) {
      const numAssure = Math.max(0, ...assures.map(a => a.numAssure)) + 1
      const traitant = data.numMedecinTraitant
        ? medecins.find(m => m.numMedecin === data.numMedecinTraitant)
        : undefined
      assures.push({
        numAssure,
        nom: data.nom,
        prenom: data.prenom,
        email: data.email || undefined,
        dateNaissance: data.dateNaissance,
        sexe: data.sexe,
        numCompteBancaire: data.numCompteBancaire || undefined,
        numMedecinTraitant: data.numMedecinTraitant || undefined,
        nomMedecinTraitant: traitant ? `Dr. ${traitant.prenom} ${traitant.nom}` : undefined,
      })
    }
    return nouveau
  }
  return apiFetch<Medecin>('/medecins', { method: 'POST', body: data })
}

export async function deleteMedecin(id: number): Promise<void> {
  if (USE_MOCK) {
    await mockDelay()
    supprimerMedecinMock(id)
    return
  }
  await apiFetch<void>(`/medecins/${id}`, { method: 'DELETE' })
}

export async function changePassword(
  id: number,
  ancienMdp: string,
  nouveauMdp: string,
): Promise<void> {
  if (USE_MOCK) {
    await mockDelay()
    const medecin = medecins.find(m => m.numMedecin === id)
    const compte = medecin && utilisateurs.find(u => u.login === medecin.login)
    if (!compte || compte.motDePasse !== ancienMdp) {
      throw new Error('Ancien mot de passe incorrect')
    }
    mettreAJourMotDePasse(medecin.login, nouveauMdp)
    return
  }
  await apiFetch<void>(`/medecins/${id}/motdepasse`, {
    method: 'PUT',
    body: { ancienMdp, nouveauMdp },
  })
}
