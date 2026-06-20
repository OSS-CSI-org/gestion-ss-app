export type TypeMedecin = 'GENERALISTE' | 'SPECIALISTE'
export type StatutRemboursement = 'EN_ATTENTE' | 'EFFECTUE'
export type ModeReglement = 'VIREMENT' | 'CASH'
export type Sexe = 'M' | 'F'
export type Role = 'AGENT_OSS' | 'MEDECIN'

export interface Assure {
  numAssure: number
  nom: string
  prenom: string
  email?: string
  dateNaissance: string
  sexe: Sexe
  numCompteBancaire?: string
  numMedecinTraitant?: number
  nomMedecinTraitant?: string
}

export interface Medecin {
  numMedecin: number
  nom: string
  prenom: string
  email?: string
  dateNaissance: string
  sexe: Sexe
  login: string
  typeMedecin: TypeMedecin
  typeFormation?: string
  nomSpecialite?: string
  actif: boolean
  estAssure?: boolean
}

export interface Consultation {
  numConsultation: number
  dateConsult: string
  motif: string
  diagnostic: string
  numMedecin: number
  numAssure: number
  nomMedecin?: string
  nomAssure?: string
}

export interface Prescription {
  numPrescription: number
  datePrescription: string
  type: 'MEDICAMENT' | 'CONSULTATION_SPECIALISTE'
  contenu: string
  numConsultation: number
  codeMedicament?: string
  nomMedicament?: string
  posologie?: string
  dosage?: string
  duree?: string
  typeExamen?: string
  motifMedical?: string
  numSpecialiste?: number
  nomSpecialiste?: string
}

export interface ParametresMedicaux {
  poids?: string
  taille?: string
  temperature?: string
  tensionArterielle?: string
  frequenceCardiaque?: string
  frequenceRespiratoire?: string
  saturationOxygene?: string
  antecedents?: string
  observations?: string
}

export interface FeuilleMaladie {
  numFeuille: number
  dateEmission: string
  statut: string
  numConsultation: number
  numAssure: number
  nomAssure: string
  numMedecin: number
  nomMedecin: string
  dateConsultation: string
  motif: string
  symptomes: string
  diagnostic: string
  traitementPrescrit: string
  parametresMedicaux?: ParametresMedicaux
  prescriptions: Prescription[]
  remboursements: Remboursement[]
}

export interface Remboursement {
  numRemboursement: number
  nature: string
  taux: number
  montant: number
  modeReglement: ModeReglement
  statut: StatutRemboursement
  numFeuille: number
  dateRemboursement?: string
  agentLogin?: string
}

export interface Utilisateur {
  login: string
  nom: string
  prenom: string
  role: Role
  motDePasse: string
}
