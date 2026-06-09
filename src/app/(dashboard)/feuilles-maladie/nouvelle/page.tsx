'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { assures, medecins } from '@/data/mock'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import SearchableSelect from '@/components/ui/SearchableSelect'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Plus, X, FileText, Heart, Activity } from 'lucide-react'
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
  const { user } = useAuth()
  const currentMedecin = medecins.find(m => m.login === user?.login)
  const [patientId, setPatientId] = useState(defaultPatientId || '')
  const [medecinId, setMedecinId] = useState(currentMedecin ? String(currentMedecin.numMedecin) : '')
  const [dateConsult, setDateConsult] = useState(() => new Date().toISOString().split('T')[0])
  const [motif, setMotif] = useState('')
  const [diagnostic, setDiagnostic] = useState('')
  const [traitementPrescrit, setTraitementPrescrit] = useState('')
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([])
  const [submitted, setSubmitted] = useState(false)

  const [poids, setPoids] = useState('')
  const [taille, setTaille] = useState('')
  const [temperature, setTemperature] = useState('')
  const [tensionArterielle, setTensionArterielle] = useState('')
  const [frequenceCardiaque, setFrequenceCardiaque] = useState('')
  const [frequenceRespiratoire, setFrequenceRespiratoire] = useState('')
  const [saturationOxygene, setSaturationOxygene] = useState('')
  const [antecedents, setAntecedents] = useState('')
  const [symptomes, setSymptomes] = useState('')
  const [observations, setObservations] = useState('')

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-prune-main mb-1">Nouvelle feuille de maladie</h1>
          <p className="text-sm text-text-anthracite/50">Enregistrement d&apos;une consultation</p>
        </div>
        <Card className="max-w-xl">
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-12 h-12 border-2 border-success-green/30 flex items-center justify-center mb-4">
              <FileText size={24} className="text-success-green" />
            </div>
            <h2 className="text-lg font-semibold text-prune-main mb-2">Feuille enregistrée</h2>
            <p className="text-sm text-text-anthracite/60 mb-1">
              Consultation du {dateConsult} — {assures.find(a => String(a.numAssure) === patientId)?.prenom} {assures.find(a => String(a.numAssure) === patientId)?.nom}
            </p>
            <p className="text-sm text-text-anthracite/60 mb-1">
              Diagnostic : {diagnostic}
            </p>
            <p className="text-sm text-text-anthracite/40 mb-4">En attente de validation par un agent OSS</p>
            <div className="flex gap-3">
              <Button onClick={() => setSubmitted(false)}>Nouvelle saisie</Button>
              <Button variant="secondary" onClick={() => window.location.href = '/feuilles-maladie'}>
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
        <h1 className="text-xl font-semibold text-prune-main mb-1">Nouvelle feuille de maladie</h1>
        <p className="text-sm text-text-anthracite/50">Saisie d&apos;une consultation médicale</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl flex flex-col gap-6">
        {/* ── Patient & Médecin ── */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold text-prune-main">Patient</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SearchableSelect
              label="Patient (Assuré)"
              options={patientOptions}
              placeholder="Sélectionner un assuré"
              value={patientId}
              onChange={setPatientId}
              required
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
              <SearchableSelect
                label="Médecin consultant"
                options={medecinOptions}
                placeholder="Sélectionner un médecin"
                value={medecinId}
                onChange={setMedecinId}
                required
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

          <div className="grid grid-cols-3 gap-4 mb-4">
            <Input label="Poids (kg)" value={poids} onChange={e => setPoids(e.target.value)} placeholder="Ex: 72.5" />
            <Input label="Taille (m)" value={taille} onChange={e => setTaille(e.target.value)} placeholder="Ex: 1.75" />
            <Input label="Température (°C)" value={temperature} onChange={e => setTemperature(e.target.value)} placeholder="Ex: 37.2" />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <Input label="Tension artérielle" value={tensionArterielle} onChange={e => setTensionArterielle(e.target.value)} placeholder="Ex: 12/8" />
            <Input label="Fréq. cardiaque (bpm)" value={frequenceCardiaque} onChange={e => setFrequenceCardiaque(e.target.value)} placeholder="Ex: 72" />
            <Input label="Fréq. respiratoire" value={frequenceRespiratoire} onChange={e => setFrequenceRespiratoire(e.target.value)} placeholder="Ex: 16" />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <Input label="Saturation O₂ (%)" value={saturationOxygene} onChange={e => setSaturationOxygene(e.target.value)} placeholder="Ex: 98" />
            <div />
            <div />
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-text-anthracite/60 mb-1.5 block">
              Antécédents médicaux
            </label>
            <textarea
              value={antecedents}
              onChange={e => setAntecedents(e.target.value)}
              placeholder="Antécédents du patient..."
              rows={2}
              className="w-full border border-text-anthracite/15 bg-white-pure px-3 py-2 text-sm text-text-anthracite placeholder:text-text-anthracite/30 focus:outline-none focus:border-prune-main transition-colors resize-y"
            />
          </div>
        </Card>

        {/* ── Consultation ── */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-prune-sec" />
            <span className="text-sm font-semibold text-prune-main">Consultation</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label="Date de consultation"
              type="date"
              value={dateConsult}
              onChange={e => setDateConsult(e.target.value)}
              required
            />
            <Input
              label="Motif"
              value={motif}
              onChange={e => setMotif(e.target.value)}
              placeholder="Motif de la consultation"
              required
            />
          </div>

          <div className="mb-4">
            <label className="text-xs font-medium uppercase tracking-wider text-text-anthracite/60 mb-1.5 block">
              Symptômes
            </label>
            <textarea
              value={symptomes}
              onChange={e => setSymptomes(e.target.value)}
              placeholder="Décrivez les symptômes..."
              rows={2}
              className="w-full border border-text-anthracite/15 bg-white-pure px-3 py-2 text-sm text-text-anthracite placeholder:text-text-anthracite/30 focus:outline-none focus:border-prune-main transition-colors resize-y"
            />
          </div>

          <div className="mb-4">
            <label className="text-xs font-medium uppercase tracking-wider text-text-anthracite/60 mb-1.5 block">
              Diagnostic *
            </label>
            <textarea
              value={diagnostic}
              onChange={e => setDiagnostic(e.target.value)}
              placeholder="Diagnostic médical détaillé…"
              required
              rows={2}
              className="w-full border border-text-anthracite/15 bg-white-pure px-3 py-2 text-sm text-text-anthracite placeholder:text-text-anthracite/30 focus:outline-none focus:border-prune-main transition-colors resize-y"
            />
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-text-anthracite/60 mb-1.5 block">
              Traitement prescrit
            </label>
            <textarea
              value={traitementPrescrit}
              onChange={e => setTraitementPrescrit(e.target.value)}
              placeholder="Traitement prescrit..."
              rows={2}
              className="w-full border border-text-anthracite/15 bg-white-pure px-3 py-2 text-sm text-text-anthracite placeholder:text-text-anthracite/30 focus:outline-none focus:border-prune-main transition-colors resize-y"
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
            <p className="text-sm text-text-anthracite/30 italic py-2">
              Aucune prescription — ajoutez un médicament ou une orientation spécialiste
            </p>
          )}

          <div className="space-y-3">
            {prescriptions.map((p, idx) => (
              <div key={idx} className="border border-text-anthracite/10 p-4 relative">
                <button
                  type="button"
                  onClick={() => removePrescription(idx)}
                  className="absolute top-3 right-3 text-text-anthracite/30 hover:text-alert-red transition-colors"
                >
                  <X size={14} />
                </button>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={p.type === 'MEDICAMENT' ? 'prune' : 'gold'}>
                    {p.type === 'MEDICAMENT' ? 'Médicament' : 'Consultation spécialiste'}
                  </Badge>
                </div>

                {p.type === 'MEDICAMENT' ? (
                  <div className="grid grid-cols-3 gap-3">
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
                  <div className="grid grid-cols-2 gap-3">
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
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-prune-main">Observations</span>
          </div>
          <textarea
            value={observations}
            onChange={e => setObservations(e.target.value)}
            placeholder="Observations complémentaires..."
            rows={2}
            className="w-full border border-text-anthracite/15 bg-white-pure px-3 py-2 text-sm text-text-anthracite placeholder:text-text-anthracite/30 focus:outline-none focus:border-prune-main transition-colors resize-y"
          />
        </Card>

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-2">
          <Button type="submit">
            <FileText size={16} className="mr-1.5" />
            Enregistrer la feuille
          </Button>
          <Button type="button" variant="secondary" onClick={() => window.location.href = '/feuilles-maladie'}>
            Annuler
          </Button>
        </div>
      </form>
    </div>
  )
}
