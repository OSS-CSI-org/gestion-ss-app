import { z } from 'zod'

export const assureSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  prenom: z.string().min(1, 'Le prénom est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  dateNaissance: z.string().min(1, 'La date de naissance est requise').refine(val => {
    const date = new Date(val)
    return !isNaN(date.getTime()) && date < new Date()
  }, 'La date de naissance doit être dans le passé'),
  sexe: z.enum(['M', 'F']),
  numCompteBancaire: z.string().optional().or(z.literal('')),
  numMedecinTraitant: z.number(),
})

export type AssureFormData = z.infer<typeof assureSchema>

export const medecinSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  prenom: z.string().min(1, 'Le prénom est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  dateNaissance: z.string().min(1, 'La date de naissance est requise').refine(val => {
    const date = new Date(val)
    return !isNaN(date.getTime()) && date < new Date()
  }, 'La date de naissance doit être dans le passé'),
  sexe: z.enum(['M', 'F']),
  login: z.string().min(1, 'Le login est requis'),
  typeMedecin: z.enum(['GENERALISTE', 'SPECIALISTE']),
  typeFormation: z.string().optional().or(z.literal('')),
  nomSpecialite: z.string().optional().or(z.literal('')),
  estAssure: z.boolean().optional(),
  numCompteBancaire: z.string().optional().or(z.literal('')),
  numMedecinTraitant: z.number().optional(),
})

export type MedecinFormData = z.infer<typeof medecinSchema>

export const feuilleSchema = z.object({
  numAssure: z.number(),
  numMedecin: z.number(),
  dateConsultation: z.string().min(1, 'La date est requise'),
  motif: z.string().min(1, 'Le motif est requis'),
  symptomes: z.string().optional().or(z.literal('')),
  diagnostic: z.string().min(1, 'Le diagnostic est requis'),
  traitementPrescrit: z.string().optional().or(z.literal('')),
  poids: z.string().optional().or(z.literal('')),
  taille: z.string().optional().or(z.literal('')),
  temperature: z.string().optional().or(z.literal('')),
  tensionArterielle: z.string().optional().or(z.literal('')),
  frequenceCardiaque: z.string().optional().or(z.literal('')),
  frequenceRespiratoire: z.string().optional().or(z.literal('')),
  saturationOxygene: z.string().optional().or(z.literal('')),
  antecedents: z.string().optional().or(z.literal('')),
  observations: z.string().optional().or(z.literal('')),
})

export type FeuilleFormData = z.infer<typeof feuilleSchema>

export const passwordSchema = z
  .object({
    ancienMdp: z.string().min(1, "L'ancien mot de passe est requis"),
    nouveauMdp: z.string().min(4, 'Le mot de passe doit contenir au moins 4 caractères'),
    confirmerMdp: z.string().min(1, 'La confirmation est requise'),
  })
  .refine(data => data.nouveauMdp === data.confirmerMdp, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmerMdp'],
  })

export type PasswordFormData = z.infer<typeof passwordSchema>

export const loginSchema = z.object({
  login: z.string().min(1, "L'identifiant est requis"),
  motDePasse: z.string().min(1, 'Le mot de passe est requis'),
})

export type LoginFormData = z.infer<typeof loginSchema>
