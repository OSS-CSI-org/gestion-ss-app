'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useAssures } from '@/hooks/data/useAssures'
import { useMedecins } from '@/hooks/data/useMedecins'
import { createFeuille } from '@/lib/services/feuilles'
import { useToast } from '@/components/ui/Toast'
import { feuilleSchema, type FeuilleFormData } from '@/lib/schemas'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import SearchableSelect from '@/components/ui/SearchableSelect'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Plus, X, FileText, Heart, Activity } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import { useAuth } from '@/hooks/useAuth'

interface PrescriptionItem {
  type: 'MEDICAMENT' | 'CONSULTATION_SPECIALISTE'
  nomMedicament?: string
  posologie?: string
  dosage?: string
  numSpecialiste?: string
  nomSpecialiste?: string
  motifMedical?: string
}

import RoleGuard from '@/components/auth/RoleGuard'

export default function NouvelleFeuillePage() {
  return (
    <Suspense>
      <NouvelleFeuillePageContent />
    </Suspense>
  )
}

function NouvelleFeuillePageContent() {
  const searchParams = useSearchParams()
  const defaultPatientId = searchParams.get('patientId') || ''
  return (
    <RoleGuard role="MEDECIN">
      <NouvelleFeuilleForm defaultPatientId={defaultPatientId} />
    </RoleGuard>
  )
}

function NouvelleFeuilleForm({ defaultPatientId }: { defaultPatientId?: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const { assures } = useAssures()
  const { medecins } = useMedecins()
  const toast = useToast()
  const currentMedecin = medecins.find(m => m.login === user?.login)
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([])
  const [submitted, setSubmitted] = useState(false)

  const { control, register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FeuilleFormData>({
    resolver: zodResolver(feuilleSchema),
    defaultValues: {
      numAssure: undefined as any,
      numMedecin: undefined as any,
      dateConsultation: new Date().toISOString().split('T')[0],
      motif: '',
      symptomes: '',
      diagnostic: '',
      traitementPrescrit: '',
      poids: '',
      taille: '',
      temperature: '',
      tensionArterielle: '',
      frequenceCardiaque: '',
      frequenceRespiratoire: '',
      saturationOxygene: '',
      antecedents: '',
      observations: '',
    },
  })

  useEffect(() => {
    if (currentMedecin) {
      setValue('numMedecin', currentMedecin.numMedecin)
    }
  }, [currentMedecin, setValue])

  useEffect(() => {
    if (defaultPatientId) {
      setValue('numAssure', Number(defaultPatientId))
    }
  }, [defaultPatientId, setValue])

  const patientOptions = assures.map(a => ({
    value: String(a.numAssure),
    label: `${a.prenom} ${a.nom}`,
  }))

  const medecinOptions = medecins.filter(m => m.actif).map(m => ({
    value: String(m.numMedecin),
    label: `Dr. ${m.prenom} ${m.nom} — ${m.typeMedecin === 'GENERALISTE' ? 'Généraliste' : m.nomSpecialite}`,
  }))

  const specialisteOptions = medecins
    .filter(m => m.typeMedecin === 'SPECIALISTE' && m.actif)
    .map(m => ({
      value: String(m.numMedecin),
      label: `Dr. ${m.prenom} ${m.nom} — ${m.nomSpecialite}`,
    }))

  const addPrescriptionMedicament = () => {
    setPrescriptions(prev => [...prev, {
      type: 'MEDICAMENT',
      nomMedicament: '',
      posologie: '',
      dosage: '',
    }])
  }

  const addPrescriptionSpecialiste = () => {
    setPrescriptions(prev => [...prev, {
      type: 'CONSULTATION_SPECIALISTE',
      motifMedical: '',
      numSpecialiste: '',
    }])
  }

  const updatePrescription = (idx: number, field: string, value: string) => {
    setPrescriptions(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p))
  }

  const removePrescription = (idx: number) => {
    setPrescriptions(prev => prev.filter((_, i) => i !== idx))
  }

  const onSubmit = async (data: FeuilleFormData) => {
    try {
      await createFeuille(data)
      setSubmitted(true)
    } catch {
      toast.show("L'enregistrement de la feuille a échoué", 'error')
    }
  }

  const watchedDateConsultation = watch('dateConsultation')
  const watchedNumAssure = watch('numAssure')
  const watchedDiagnostic = watch('diagnostic')

  if (submitted) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-prune-main mb-1">Nouvelle feuille de maladie</h1>
          <p className="text-sm text-text-anthracite/60">Enregistrement d&apos;une consultation</p>
        </div>
        <Card className="max-w-xl">
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-12 h-12 border-2 border-success-green/30 flex items-center justify-center mb-4">
              <FileText size={24} className="text-success-green" />
            </div>
            <h2 className="text-lg font-semibold text-prune-main mb-2">Feuille enregistrée</h2>
            <p className="text-sm text-text-anthracite/60 mb-1">
              Consultation du {watchedDateConsultation} — {assures.find(a => a.numAssure === watchedNumAssure)?.prenom} {assures.find(a => a.numAssure === watchedNumAssure)?.nom}
            </p>
            <p className="text-sm text-text-anthracite/60 mb-1">
              Diagnostic : {watchedDiagnostic}
            </p>
            <p className="text-sm text-text-anthracite/60 mb-4">En attente de validation par un agent OSS</p>
            <div className="flex gap-3">
              <Button onClick={() => setSubmitted(false)}>Nouvelle saisie</Button>
              <Button variant="secondary" onClick={() => router.push('/feuilles-maladie')}>
                Voir le suivi
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-prune-main mb-1">Nouvelle feuille de maladie</h1>
          <p className="text-sm text-text-anthracite/60">Saisie d&apos;une consultation médicale</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full lg:max-w-3xl flex flex-col gap-6">
        {/* ── Patient & Médecin ── */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold text-prune-main">Patient</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="numAssure"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  label="Patient (Assuré)"
                  options={patientOptions}
                  placeholder="Sélectionner un assuré"
                  value={field.value ? String(field.value) : ''}
                  onChange={v => field.onChange(v ? Number(v) : undefined)}
                  error={errors.numAssure?.message}
                  required
                />
              )}
            />
            {user?.role === 'MEDECIN' && currentMedecin ? (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium uppercase tracking-wider text-text-anthracite/60">
                  Médecin consultant
                </label>
                <div className="border border-text-anthracite/15 bg-text-anthracite/5 px-3 py-2 text-sm text-text-anthracite/70">
                  Dr. {currentMedecin.prenom} {currentMedecin.nom}
                </div>
              </div>
            ) : (
              <Controller
                name="numMedecin"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    label="Médecin consultant"
                    options={medecinOptions}
                    placeholder="Sélectionner un médecin"
                    value={field.value ? String(field.value) : ''}
                    onChange={v => field.onChange(v ? Number(v) : undefined)}
                    error={errors.numMedecin?.message}
                    required
                  />
                )}
              />
            )}
          </div>
        </Card>

        {/* ── Paramètres médicaux ── */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Heart size={16} className="text-prune-sec" />
            <span className="text-sm font-semibold text-prune-main">Paramètres médicaux</span>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-4">
            <Input label="Poids (kg)" {...register('poids')} placeholder="Ex: 72.5" />
            <Input label="Taille (m)" {...register('taille')} placeholder="Ex: 1.75" />
            <Input label="Température (°C)" {...register('temperature')} placeholder="Ex: 37.2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-4">
            <Input label="Tension artérielle" {...register('tensionArterielle')} placeholder="Ex: 12/8" />
            <Input label="Fréq. cardiaque (bpm)" {...register('frequenceCardiaque')} placeholder="Ex: 72" />
            <Input label="Fréq. respiratoire" {...register('frequenceRespiratoire')} placeholder="Ex: 16" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-4">
            <Input label="Saturation O₂ (%)" {...register('saturationOxygene')} placeholder="Ex: 98" />
            <div className="hidden md:block" />
            <div className="hidden md:block" />
          </div>

          <div>
            <Textarea
              label="Antécédents médicaux"
              {...register('antecedents')}
              placeholder="Antécédents du patient..."
              rows={2}
            />
          </div>
        </Card>

        {/* ── Consultation ── */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-prune-sec" />
            <span className="text-sm font-semibold text-prune-main">Consultation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Date de consultation"
              type="date"
              {...register('dateConsultation')}
              error={errors.dateConsultation?.message}
              required
            />
            <Input
              label="Motif"
              {...register('motif')}
              placeholder="Motif de la consultation"
              error={errors.motif?.message}
              required
            />
          </div>

          <div className="mb-4">
            <Textarea
              label="Symptômes"
              {...register('symptomes')}
              placeholder="Décrivez les symptômes..."
              rows={2}
            />
          </div>

          <div className="mb-4">
            <Textarea
              label="Diagnostic *"
              {...register('diagnostic')}
              placeholder="Diagnostic médical détaillé…"
              error={errors.diagnostic?.message}
              required
              rows={2}
            />
          </div>

          <div>
            <Textarea
              label="Traitement prescrit"
              {...register('traitementPrescrit')}
              placeholder="Traitement prescrit..."
              rows={2}
            />
          </div>
        </Card>

        {/* ── Prescriptions ── */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-prune-main">Prescriptions associées</span>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={addPrescriptionMedicament}>
                <Plus size={14} className="mr-1" /> Médicament
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={addPrescriptionSpecialiste}>
                <Plus size={14} className="mr-1" /> Consultation spécialiste
              </Button>
            </div>
          </div>

          {prescriptions.length === 0 && (
            <EmptyState icon={<Plus size={28} />} title="Aucune prescription" description="Ajoutez un médicament ou une orientation spécialiste" />
          )}

          <div className="space-y-3">
            {prescriptions.map((p, idx) => (
              <div key={idx} className="border border-text-anthracite/10 p-4 relative">
                <button
                  type="button"
                  onClick={() => removePrescription(idx)}
                  className="absolute top-3 right-3 text-text-anthracite/45 hover:text-alert-red transition-colors"
                >
                  <X size={14} />
                </button>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={p.type === 'MEDICAMENT' ? 'prune' : 'gold'}>
                    {p.type === 'MEDICAMENT' ? 'Médicament' : 'Consultation spécialiste'}
                  </Badge>
                </div>

                {p.type === 'MEDICAMENT' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      label="Médicament"
                      value={p.nomMedicament || ''}
                      onChange={e => updatePrescription(idx, 'nomMedicament', e.target.value)}
                      placeholder="Paracétamol"
                    />
                    <Input
                      label="Dosage"
                      value={p.dosage || ''}
                      onChange={e => updatePrescription(idx, 'dosage', e.target.value)}
                      placeholder="500mg"
                    />
                    <Input
                      label="Posologie"
                      value={p.posologie || ''}
                      onChange={e => updatePrescription(idx, 'posologie', e.target.value)}
                      placeholder="1 comprimé 3x/jour"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <SearchableSelect
                      label="Spécialiste"
                      options={specialisteOptions}
                      placeholder="Sélectionner un spécialiste"
                      value={p.numSpecialiste || ''}
                      onChange={v => {
                        const sp = medecins.find(m => String(m.numMedecin) === v)
                        updatePrescription(idx, 'numSpecialiste', v)
                        if (sp) updatePrescription(idx, 'nomSpecialiste', `Dr. ${sp.prenom} ${sp.nom}`)
                      }}
                    />
                    <Input
                      label="Motif médical"
                      value={p.motifMedical || ''}
                      onChange={e => updatePrescription(idx, 'motifMedical', e.target.value)}
                      placeholder="Motif de la consultation"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* ── Observations ── */}
        <Card>
          <Textarea
            label="Observations"
            {...register('observations')}
            placeholder="Observations complémentaires..."
            rows={2}
          />
        </Card>

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={isSubmitting}>
            <FileText size={16} className="mr-1.5" />
            Enregistrer la feuille
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push('/feuilles-maladie')}>
            Annuler
          </Button>
        </div>
      </form>
    </div>
  )
}
