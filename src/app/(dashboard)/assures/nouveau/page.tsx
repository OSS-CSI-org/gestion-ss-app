'use client'

import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useMedecins } from '@/hooks/data/useMedecins'
import { createAssure } from '@/lib/services/assures'
import { useToast } from '@/components/ui/Toast'
import { assureSchema, type AssureFormData } from '@/lib/schemas'
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
  const { medecins } = useMedecins()
  const toast = useToast()

  const { control, register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AssureFormData>({
    resolver: zodResolver(assureSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      dateNaissance: '',
      sexe: 'M',
      numCompteBancaire: '',
      numMedecinTraitant: undefined as any,
    },
  })

  const generalistes = medecins
    .filter(m => m.typeMedecin === 'GENERALISTE' && m.actif)
    .map(m => ({ value: String(m.numMedecin), label: `Dr. ${m.prenom} ${m.nom}` }))

  const onSubmit = async (data: AssureFormData) => {
    try {
      await createAssure(data)
      toast.show('Assuré inscrit avec succès', 'success')
      router.push('/assures')
    } catch {
      toast.show("L'inscription a échoué", 'error')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/assures" className="text-text-anthracite/60 hover:text-prune-main transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-prune-main mb-1">Nouvel assuré</h1>
          <p className="text-sm text-text-anthracite/60">Inscription d&apos;une personne à la sécurité sociale</p>
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
              placeholder="Biya"
            />
            <Input
              label="Prénom"
              {...register('prenom')}
              error={errors.prenom?.message}
              required
              placeholder="Paul"
            />
          </div>

          <Input
            label="Email"
            type="email"
            {...register('email')}
            placeholder="paulbiya@gmail.com"
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
            label="Numéro de compte bancaire (IBAN)"
            {...register('numCompteBancaire')}
            placeholder="CM21 XXXX XXXX XXXX XXXX XXXX XXX"
          />

          <Controller
            name="numMedecinTraitant"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                label="Médecin traitant *"
                options={generalistes}
                placeholder="Sélectionner un généraliste"
                value={field.value ? String(field.value) : ''}
                onChange={v => field.onChange(v ? Number(v) : undefined)}
                error={errors.numMedecinTraitant?.message}
                required
              />
            )}
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isSubmitting}>Inscrire l&apos;assuré</Button>
            <Link href="/assures">
              <Button type="button" variant="secondary">Annuler</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
