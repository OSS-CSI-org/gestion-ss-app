'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import SearchableSelect from '@/components/ui/SearchableSelect'
import RadioGroup from '@/components/ui/RadioGroup'
import Button from '@/components/ui/Button'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import RoleGuard from '@/components/auth/RoleGuard'
import { ajouterUtilisateur } from '@/data/mock'

export default function NouveauMedecinPage() {
  return (
    <RoleGuard role="AGENT_OSS">
      <NouveauMedecinForm />
    </RoleGuard>
  )
}

const FORMATIONS = [
  'Médecine générale - Université de Yaoundé I',
  'Médecine générale - Université de Yaoundé II',
  'Médecine générale - Université de Douala',
  'Médecine générale - Université de Buéa',
  'Médecine générale - Université de Dschang',
  'Médecine générale - Université de Ngaoundéré',
  'Médecine générale - Université de Maroua',
  'Médecine générale - Université de Bamenda',
  'Médecine générale - Université de Garoua',
  'Médecine générale - Université des Montagnes (Bangangté)',
  'Médecine générale - Université Catholique d\'Afrique Centrale (Yaoundé)',
  'Médecine générale - Institut Supérieur des Sciences de la Santé (Ngaoundéré)',
  'Médecine générale - Faculté de Médecine de l\'Université de Yaoundé I',
  'Médecine générale - Faculté de Médecine de l\'Université de Douala',
  'Médecine générale - Faculté de Médecine de l\'Université de Buéa',
  'Médecine générale - Faculté des Sciences de la Santé de Bamenda',
  'Médecine générale - Université de Bertoua',
  'Médecine générale - Université de Kribi',
  'Médecine générale - Université d\'Ebolowa',
  'Médecine générale - Université de Sangmélima',
]

const SPECIALITES = [
  'Cardiologie',
  'Dermatologie',
  'Ophtalmologie',
  'Gynécologie-obstétrique',
  'Pédiatrie',
  'Médecine d\'urgence',
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

function NouveauMedecinForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    dateNaissance: '',
    sexe: 'M',
    login: '',
    typeMedecin: 'GENERALISTE',
    typeFormation: '',
    nomSpecialite: '',
  })

  const [added, setAdded] = useState(false)
  const DEFAULT_MDP = 'med@2026'

  useEffect(() => {
    const trimmed = form.prenom.trim().toLowerCase().replace(/\s+/g, '')
    if (trimmed) {
      update('login', `dr${trimmed}`)
    }
  }, [form.prenom])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    ajouterUtilisateur({
      login: form.login,
      nom: form.nom,
      prenom: form.prenom,
      role: 'MEDECIN',
      motDePasse: DEFAULT_MDP,
    })
    setAdded(true)
  }

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  if (added) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <Link href="/medecins" className="text-text-anthracite/40 hover:text-prune-main transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-prune-main mb-1">Médecin ajouté</h1>
            <p className="text-sm text-text-anthracite/50">Le compte a été créé avec succès</p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle size={48} className="text-success-green" />
            <p className="text-lg font-medium text-prune-main">
              {form.prenom} {form.nom}
            </p>
            <p className="text-sm text-text-anthracite/70">
              Identifiant : <span className="font-mono font-semibold text-prune-main">{form.login}</span>
            </p>
            <p className="text-sm text-text-anthracite/70">
              Mot de passe par défaut : <span className="font-mono font-semibold text-prune-main">{DEFAULT_MDP}</span>
            </p>
            <p className="text-xs text-text-anthracite/40 text-center max-w-sm">
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
        <Link href="/medecins" className="text-text-anthracite/40 hover:text-prune-main transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-prune-main mb-1">Nouveau médecin</h1>
          <p className="text-sm text-text-anthracite/50">Ajout d&apos;un praticien au registre</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nom"
              value={form.nom}
              onChange={e => update('nom', e.target.value)}
              required
              placeholder="ETCHOME"
            />
            <Input
              label="Prénom"
              value={form.prenom}
              onChange={e => update('prenom', e.target.value)}
              required
              placeholder="Chris"
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={e => update('email', e.target.value)}
            placeholder="etchomechris2000@gmail.com"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date de naissance"
              type="date"
              value={form.dateNaissance}
              onChange={e => update('dateNaissance', e.target.value)}
              required
            />
            <RadioGroup
              label="Sexe"
              name="sexe"
              options={[{ value: 'M', label: 'Masculin' }, { value: 'F', label: 'Féminin' }]}
              value={form.sexe}
              onChange={v => update('sexe', v)}
            />
          </div>

          <Input
            label="Identifiant de connexion"
            value={form.login}
            onChange={e => update('login', e.target.value)}
            required
            placeholder="drchris"
          />

          <div className="bg-prune-main/5 border border-prune-main/15 px-4 py-3 text-sm text-prune-main">
            Mot de passe par défaut : <span className="font-mono font-semibold">{DEFAULT_MDP}</span>
          </div>

          <SearchableSelect
            label="Type de médecin"
            options={[
              { value: 'GENERALISTE', label: 'Généraliste' },
              { value: 'SPECIALISTE', label: 'Spécialiste' },
            ]}
            value={form.typeMedecin}
            onChange={v => update('typeMedecin', v)}
          />

          {form.typeMedecin === 'GENERALISTE' ? (
            <SearchableSelect
              label="Formation"
              options={FORMATIONS.map(f => ({ value: f, label: f }))}
              value={form.typeFormation}
              onChange={v => update('typeFormation', v)}
              placeholder="Rechercher ou saisir une formation..."
              creatable
            />
          ) : (
            <SearchableSelect
              label="Spécialité"
              options={SPECIALITES.map(s => ({ value: s, label: s }))}
              value={form.nomSpecialite}
              onChange={v => update('nomSpecialite', v)}
              placeholder="Rechercher ou saisir une spécialité..."
              required
              creatable
            />
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit">Ajouter le médecin</Button>
            <Link href="/medecins">
              <Button type="button" variant="secondary">Annuler</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
