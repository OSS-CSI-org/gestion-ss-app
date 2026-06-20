import { USE_MOCK } from '@/lib/api/config'
import { apiFetch, ApiError } from '@/lib/api/client'
import { feuillesMaladie, assures, medecins } from '@/data/mock'
import { FeuilleMaladie, Prescription } from '@/lib/types'
import { FeuilleFormData } from '@/lib/schemas'
import { mockDelay } from './_mock'

export async function listFeuilles(): Promise<FeuilleMaladie[]> {
  if (USE_MOCK) {
    await mockDelay()
    return [...feuillesMaladie]
  }
  // En mode http, le backend filtre selon le rôle du token (médecin → les siennes).
  return apiFetch<FeuilleMaladie[]>('/feuilles')
}

export async function getFeuille(id: number): Promise<FeuilleMaladie | null> {
  if (USE_MOCK) {
    await mockDelay()
    return feuillesMaladie.find(f => f.numFeuille === id) ?? null
  }
  try {
    return await apiFetch<FeuilleMaladie>(`/feuilles/${id}`)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

interface CreateFeuilleInput extends FeuilleFormData {
  prescriptions?: Array<{
    type: 'MEDICAMENT' | 'CONSULTATION_SPECIALISTE'
    nomMedicament?: string
    posologie?: string
    dosage?: string
    duree?: string
    numSpecialiste?: string
    nomSpecialiste?: string
    motifMedical?: string
  }>
}

export async function createFeuille(data: CreateFeuilleInput): Promise<FeuilleMaladie> {
  if (USE_MOCK) {
    await mockDelay()
    const numFeuille = Math.max(0, ...feuillesMaladie.map(f => f.numFeuille)) + 1
    const assure = assures.find(a => a.numAssure === data.numAssure)
    const medecin = medecins.find(m => m.numMedecin === data.numMedecin)
    const feuille: FeuilleMaladie = {
      numFeuille,
      dateEmission: new Date().toISOString().split('T')[0],
      statut: 'EN_ATTENTE',
      numConsultation: numFeuille,
      numAssure: data.numAssure,
      nomAssure: assure ? `${assure.prenom} ${assure.nom}` : '',
      numMedecin: data.numMedecin,
      nomMedecin: medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : '',
      dateConsultation: data.dateConsultation,
      motif: data.motif,
      symptomes: data.symptomes || '',
      diagnostic: data.diagnostic,
      traitementPrescrit: data.traitementPrescrit || '',
      parametresMedicaux: {
        poids: data.poids || undefined,
        taille: data.taille || undefined,
        temperature: data.temperature || undefined,
        tensionArterielle: data.tensionArterielle || undefined,
        frequenceCardiaque: data.frequenceCardiaque || undefined,
        frequenceRespiratoire: data.frequenceRespiratoire || undefined,
        saturationOxygene: data.saturationOxygene || undefined,
        antecedents: data.antecedents || undefined,
        observations: data.observations || undefined,
      },
      prescriptions: (data.prescriptions || []).map((p, i) => {
        const base = {
          numPrescription: i + 1,
          datePrescription: data.dateConsultation,
          type: p.type as 'MEDICAMENT' | 'CONSULTATION_SPECIALISTE',
          contenu: p.type === 'MEDICAMENT'
            ? `${p.nomMedicament} ${p.dosage ? '- ' + p.dosage : ''}${p.posologie ? ' - ' + p.posologie : ''}${p.duree ? ' pendant ' + p.duree : ''}`
            : `Consultation ${p.nomSpecialiste || ''}${p.motifMedical ? ' - ' + p.motifMedical : ''}`,
          numConsultation: numFeuille,
        }
        if (p.type === 'MEDICAMENT') {
          return { ...base, nomMedicament: p.nomMedicament, dosage: p.dosage, posologie: p.posologie, duree: p.duree }
        }
        return { ...base, numSpecialiste: p.numSpecialiste ? Number(p.numSpecialiste) : undefined, nomSpecialiste: p.nomSpecialiste, motifMedical: p.motifMedical }
      }) as Prescription[],
      remboursements: [],
    }
    feuillesMaladie.push(feuille)
    return feuille
  }
  return apiFetch<FeuilleMaladie>('/feuilles', { method: 'POST', body: data })
}
