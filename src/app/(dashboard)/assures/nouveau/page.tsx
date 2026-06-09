'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { medecins } from '@/data/mock'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import SearchableSelect from '@/components/ui/SearchableSelect'
import RadioGroup from '@/components/ui/RadioGroup'
import Button from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import RoleGuard from '@/components/auth/RoleGuard'

export default function NouvelAssurePage() {
  return (
    <RoleGuard role="AGENT_OSS">
      <NouvelAssureForm />
    </RoleGuard>
  )
}

function NouvelAssureForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    dateNaissance: '',
    sexe: 'M',
    numCompteBancaire: '',
    numMedecinTraitant: '',
  })
  const [error, setError] = useState('')

  const generalistes = medecins
    .filter(m => m.typeMedecin === 'GENERALISTE' && m.actif)
    .map(m => ({ value: String(m.numMedecin), label: `Dr. ${m.prenom} ${m.nom}` }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.numMedecinTraitant) {
      setError('Veuillez sélectionner un médecin traitant')
      return
    }
    setError('')
    console.log('Nouvel assuré:', form)
    router.push('/assures')
  }

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/assures" className="text-text-anthracite/40 hover:text-prune-main transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-prune-main mb-1">Nouvel assuré</h1>
          <p className="text-sm text-text-anthracite/50">Inscription d&apos;une personne à la sécurité sociale</p>
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
              placeholder="Dupont"
            />
            <Input
              label="Prénom"
              value={form.prenom}
              onChange={e => update('prenom', e.target.value)}
              required
              placeholder="Jean"
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={e => update('email', e.target.value)}
            placeholder="jean.dupont@email.fr"
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
            label="Numéro de compte bancaire (IBAN)"
            value={form.numCompteBancaire}
            onChange={e => update('numCompteBancaire', e.target.value)}
            placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
          />

          <SearchableSelect
            label="Médecin traitant *"
            options={generalistes}
            placeholder="Sélectionner un généraliste"
            value={form.numMedecinTraitant}
            onChange={v => { setError(''); update('numMedecinTraitant', v) }}
            required
          />

          {error && (
            <p className="text-xs text-alert-red -mt-3">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit">Inscrire l&apos;assuré</Button>
            <Link href="/assures">
              <Button type="button" variant="secondary">Annuler</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
