'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useKeyboard } from '@/hooks/useKeyboard'
import { medecinSchema, type MedecinFormData } from '@/lib/schemas'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import SearchableSelect from '@/components/ui/SearchableSelect'
import RadioGroup from '@/components/ui/RadioGroup'
import Button from '@/components/ui/Button'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import RoleGuard from '@/components/auth/RoleGuard'
import { createMedecin } from '@/lib/services/medecins'
import { useToast } from '@/components/ui/Toast'
import { useMedecins } from '@/hooks/data/useMedecins'

export default function NouveauMedecinPage() {
  return (
    <RoleGuard role="AGENT_OSS">
      <NouveauMedecinForm />
    </RoleGuard>
  )
}

const FORMATIONS = [
  'Médecine générale - Université de Yaoundé I',
  'Médecine générale - Université de Douala',
  'Médecine générale - Université de Buéa',
  'Médecine générale - Université de Dschang',
  'Médecine générale - Université de Ngaoundéré',
  'Médecine générale - Université de Maroua',
  'Médecine générale - Université de Bamenda',
  'Médecine générale - Université de Garoua',
  'Médecine générale - Université des Montagnes (Bangangté)',
  "Médecine générale - Université Catholique d'Afrique Centrale (Yaoundé)",
  "Médecine générale - Institut Supérieur des Sciences de la Santé (Ngaoundéré)",
  "Médecine générale - Faculté de Médecine de l'Université de Yaoundé I",
  "Médecine générale - Faculté de Médecine de l'Université de Douala",
  "Médecine générale - Faculté de Médecine de l'Université de Buéa",
  'Médecine générale - Faculté des Sciences de la Santé de Bamenda',
  'Médecine générale - Université de Bertoua',
  'Médecine générale - Université de Kribi',
  "Médecine générale - Université d'Ebolowa",
  'Médecine générale - Université de Sangmélima',
]

const SPECIALITES = [
  'Cardiologie',
  'Dermatologie',
  'Ophtalmologie',
  'Gynécologie-obstétrique',
  'Pédiatrie',
  "Médecine d'urgence",
  'Neurologie',
  'Psychiatrie',
  'Radiologie',
  'Chirurgie générale',
  'Chirurgie orthopédique',
  'Chirurgie viscérale',
  'Anesthésie-réanimation',
  'Médecine interne',
  'Endocrinologie',
  'Gastro-entérologie',
  'Hépato-gastro-entérologie',
  'Pneumologie',
  'Rhumatologie',
  'Néphrologie',
  'Urologie',
  'Oto-rhino-laryngologie (ORL)',
  'Stomatologie',
  'Médecine physique et réadaptation',
  'Oncologie',
  'Hématologie',
  'Médecine nucléaire',
  'Biologie médicale',
  'Pharmacologie',
  'Santé publique',
  'Médecine du travail',
  'Médecine légale',
  'Gériatrie',
  'Allergologie',
  'Médecine vasculaire',
  'Infectiologie',
  'Génétique médicale',
  'Médecine sportive',
  'Nutrition',
  'Addictologie',
  'Soins palliatifs',
]

const DEFAULT_MDP = 'Medecin@2026'

function NouveauMedecinForm() {
  const router = useRouter()
  const toast = useToast()
  const { medecins } = useMedecins()
  const [added, setAdded] = useState(false)

  const { control, register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<MedecinFormData>({
    resolver: zodResolver(medecinSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      dateNaissance: '',
      sexe: 'M',
      login: '',
      typeMedecin: 'GENERALISTE',
      typeFormation: '',
      nomSpecialite: '',
      estAssure: false,
      numCompteBancaire: '',
      numMedecinTraitant: undefined as any,
    },
  })

  const prenom = watch('prenom')
  const typeMedecin = watch('typeMedecin')
  const estAssure = watch('estAssure')

  const generalistes = medecins
    .filter(m => m.typeMedecin === 'GENERALISTE' && m.actif)
    .map(m => ({ value: String(m.numMedecin), label: `Dr. ${m.prenom} ${m.nom}` }))

  useEffect(() => {
    const trimmed = prenom.trim().toLowerCase().replace(/\s+/g, '')
    if (trimmed) {
      setValue('login', `dr${trimmed}`)
    }
  }, [prenom, setValue])

  const onSubmit = async (data: MedecinFormData) => {
    try {
      await createMedecin(data)
      setAdded(true)
    } catch {
      toast.show("La création du médecin a échoué", 'error')
    }
  }

  if (added) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Link href="/medecins" className="text-text-anthracite/60 hover:text-prune-main transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-prune-main mb-1">Médecin ajouté</h1>
            <p className="text-sm text-text-anthracite/60">Le compte a été créé avec succès</p>
          </div>
        </div>

        <Card className="w-full lg:max-w-2xl">
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle size={48} className="text-success-green" />
            <p className="text-lg font-medium text-prune-main">
              {watch('prenom')} {watch('nom')}
            </p>
            <p className="text-sm text-text-anthracite/70">
              Identifiant : <span className="font-mono font-semibold text-prune-main">{watch('login')}</span>
            </p>
            <p className="text-sm text-text-anthracite/70">
              Mot de passe par défaut : <span className="font-mono font-semibold text-prune-main">{DEFAULT_MDP}</span>
            </p>
            <p className="text-xs text-text-anthracite/60 text-center max-w-sm">
              Le médecin pourra changer son mot de passe depuis son profil.
            </p>
            <Link href="/medecins">
              <Button>Retour à la liste</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
          <Link href="/medecins" className="text-text-anthracite/60 hover:text-prune-main transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-prune-main mb-1">Nouveau médecin</h1>
            <p className="text-sm text-text-anthracite/60">Inscrire un nouveau médecin</p>
          </div>
        </div>

        <Card className="w-full lg:max-w-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom"
              {...register('nom')}
              error={errors.nom?.message}
              required
              placeholder="ETCHOME"
            />
            <Input
              label="Prénom"
              {...register('prenom')}
              error={errors.prenom?.message}
              required
              placeholder="Chris"
            />
          </div>

          <Input
            label="Email"
            type="email"
            {...register('email')}
            placeholder="etchomechris2000@gmail.com"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date de naissance"
              type="date"
              {...register('dateNaissance')}
              error={errors.dateNaissance?.message}
              required
            />
            <Controller
              name="sexe"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  label="Sexe"
                  name="sexe"
                  options={[{ value: 'M', label: 'Masculin' }, { value: 'F', label: 'Féminin' }]}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <Input
            label="Identifiant de connexion"
            {...register('login')}
            error={errors.login?.message}
            required
            placeholder="drchris"
          />

          <div className="bg-prune-main/5 border border-prune-main/15 px-4 py-3 text-sm text-prune-main">
            Mot de passe par défaut : <span className="font-mono font-semibold">{DEFAULT_MDP}</span>
          </div>

          <Controller
            name="typeMedecin"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                label="Type de médecin"
                options={[
                  { value: 'GENERALISTE', label: 'Généraliste' },
                  { value: 'SPECIALISTE', label: 'Spécialiste' },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          {typeMedecin === 'GENERALISTE' ? (
            <Controller
              name="typeFormation"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  label="Formation"
                  options={FORMATIONS.map(f => ({ value: f, label: f }))}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="Rechercher ou saisir une formation..."
                  creatable
                />
              )}
            />
          ) : (
            <Controller
              name="nomSpecialite"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  label="Spécialité"
                  options={SPECIALITES.map(s => ({ value: s, label: s }))}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  error={errors.nomSpecialite?.message}
                  placeholder="Rechercher ou saisir une spécialité..."
                  required
                  creatable
                />
              )}
            />
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('estAssure')}
              className="w-4 h-4 rounded border-text-anthracite/30 text-prune-main focus:ring-prune-main/40"
            />
            <span className="text-sm text-text-anthracite">Ce médecin est également assuré</span>
          </label>

          {estAssure && (
            <div className="flex flex-col gap-5 pl-4 border-l-2 border-prune-main/20">
              <Input
                label="Numéro de compte bancaire (IBAN)"
                {...register('numCompteBancaire')}
                placeholder="CM21 XXXX XXXX XXXX XXXX XXXX XXX"
              />
              <Controller
                name="numMedecinTraitant"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    label="Médecin traitant"
                    options={generalistes}
                    placeholder="Sélectionner un généraliste"
                    value={field.value ? String(field.value) : ''}
                    onChange={v => field.onChange(v ? Number(v) : undefined)}
                  />
                )}
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isSubmitting}>Ajouter le médecin</Button>
            <Link href="/medecins">
              <Button type="button" variant="secondary">Annuler</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
