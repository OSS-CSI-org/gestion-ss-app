'use client'

import { use, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMedecin } from '@/hooks/data/useMedecins'
import { useAssures } from '@/hooks/data/useAssures'
import { useFeuilles } from '@/hooks/data/useFeuilles'
import { changePassword, deleteMedecin } from '@/lib/services/medecins'
import { FeuilleMaladie } from '@/lib/types'
import Skeleton from '@/components/ui/Skeleton'
import { passwordSchema, type PasswordFormData } from '@/lib/schemas'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import StatusBadge from '@/components/ui/StatusBadge'
import DataTable from '@/components/ui/DataTable'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { ArrowLeft, Mail, Calendar, User, Stethoscope, Activity, FileText, Trash2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import Link from 'next/link'
import { formatDateShort } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useConfirm } from '@/hooks/useConfirm'
import { useToast } from '@/components/ui/Toast'
import { useRouter } from 'next/navigation'

export default function MedecinDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const { confirm: ask, dialog: confirmDialog } = useConfirm()
  const toast = useToast()
  const router = useRouter()
  const { medecin, isLoading } = useMedecin(Number(id))
  const { assures } = useAssures()
  const { feuilles } = useFeuilles()

  const [showMdpForm, setShowMdpForm] = useState(false)
  const [showAncien, setShowAncien] = useState(false)
  const [showNouveau, setShowNouveau] = useState(false)
  const [showConfirmer, setShowConfirmer] = useState(false)
  const [mdpError, setMdpError] = useState('')
  const [mdpSuccess, setMdpSuccess] = useState(false)

  const { register: pwdRegister, handleSubmit: pwdHandleSubmit, formState: { errors: pwdErrors }, reset: pwdReset } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const estProprietaire = user?.login === medecin?.login
  const consultations = feuilles.filter(f => medecin && f.numMedecin === medecin.numMedecin)
  const patientsVus = new Set(consultations.map(f => f.numAssure)).size

  const handleChangerMdp = async (data: PasswordFormData) => {
    if (!medecin) return
    setMdpError('')
    setMdpSuccess(false)
    try {
      await changePassword(medecin.numMedecin, data.ancienMdp, data.nouveauMdp)
      setMdpSuccess(true)
      pwdReset()
      setShowMdpForm(false)
    } catch (e) {
      setMdpError(e instanceof Error ? e.message : 'Ancien mot de passe incorrect')
    }
  }

  const handleSupprimer = async () => {
    if (!medecin) return
    let msg = `Êtes-vous sûr de vouloir supprimer Dr. ${medecin.prenom} ${medecin.nom} ?`
    const assuresAffectes = assures.filter(a => a.numMedecinTraitant === medecin.numMedecin)
    if (consultations.length > 0 || assuresAffectes.length > 0) {
      msg += '\n\n'
      if (consultations.length > 0) {
        msg += `• ${consultations.length} consultation(s) resteront dans le système\n`
      }
      if (assuresAffectes.length > 0) {
        msg += `• ${assuresAffectes.length} assuré(s) perdront leur médecin traitant\n`
      }
    }
    msg += '\nCette action est irréversible.'
    const ok = await ask(msg)
    if (ok) {
      try {
        await deleteMedecin(medecin.numMedecin)
        toast.show(`Dr. ${medecin.prenom} ${medecin.nom} a été supprimé`, 'success')
        router.push('/medecins')
      } catch {
        toast.show('La suppression a échoué', 'error')
      }
    }
  }

  const columns = [
    {
      key: 'dateConsultation',
      header: 'Date',
      render: (f: FeuilleMaladie) => <span className="text-sm">{formatDateShort(f.dateConsultation)}</span>,
    },
    {
      key: 'nomAssure',
      header: 'Patient',
      render: (f: FeuilleMaladie) => (
        <Link href={`/assures/${f.numAssure}`} className="font-medium text-prune-main hover:underline">
          {f.nomAssure}
        </Link>
      ),
    },
    {
      key: 'motif',
      header: 'Motif',
      render: (f: FeuilleMaladie) => <span className="text-sm text-text-anthracite/70">{f.motif}</span>,
    },
    {
      key: 'statut',
      header: 'Statut',
      render: (f: FeuilleMaladie) => {
        const tousEffectues = f.remboursements.every(r => r.statut === 'EFFECTUE')
        return <StatusBadge statut={tousEffectues ? 'EFFECTUE' : 'EN_ATTENTE'} />
      },
    },
    {
      key: 'actions',
      header: '',
      render: (f: FeuilleMaladie) => (
        <Link href={`/feuilles-maladie/${f.numFeuille}`}>
          <Button variant="ghost" size="sm">Détail</Button>
        </Link>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-40" />
      </div>
    )
  }

  if (!medecin) {
    return (
      <div>
        <Card>
          <p className="text-text-anthracite/60 text-center py-8">Médecin introuvable</p>
        </Card>
      </div>
    )
  }

  return (
    <div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-semibold text-prune-main break-words">Dr. {medecin.prenom} {medecin.nom}</h1>
            {medecin.estAssure && <Badge variant="alert">Assuré</Badge>}
          </div>
          <p className="text-sm text-text-anthracite/60">
            {medecin.typeMedecin === 'GENERALISTE' ? 'Médecin généraliste' : medecin.nomSpecialite}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={medecin.typeMedecin === 'GENERALISTE' ? 'prune' : 'gold'}>
            {medecin.typeMedecin === 'GENERALISTE' ? 'Généraliste' : 'Spécialiste'}
          </Badge>
          {user?.role === 'AGENT_OSS' && (
            <button
              onClick={handleSupprimer}
              className="p-2 text-alert-red/50 hover:text-alert-red hover:bg-alert-red/5 transition-colors"
              title="Supprimer le médecin"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        <Card className="lg:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-anthracite/60 mb-4">Informations</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User size={14} className="text-text-anthracite/45" />
              <span className="text-text-anthracite/60">Nom</span>
              <span className="ml-auto font-medium text-prune-main">{medecin.nom}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={14} className="text-text-anthracite/45" />
              <span className="text-text-anthracite/60">Prénom</span>
              <span className="ml-auto font-medium text-prune-main">{medecin.prenom}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-text-anthracite/45" />
              <span className="text-text-anthracite/60">Date naissance</span>
              <span className="ml-auto font-medium">{formatDateShort(medecin.dateNaissance)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-text-anthracite/45" />
              <span className="text-text-anthracite/60">Email</span>
              <span className="ml-auto font-medium">{medecin.email || '—'}</span>
            </div>
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <Stethoscope size={14} className="text-text-anthracite/45" />
                <span className="text-text-anthracite/60">Formation</span>
                <span className="ml-auto font-medium text-right">{medecin.typeFormation || medecin.nomSpecialite}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-3">
          <Card className="!p-4 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={14} className="text-prune-sec/60" />
              <span className="text-xs font-medium uppercase tracking-wider text-text-anthracite/60">Consultations</span>
            </div>
            <p className="text-lg font-semibold text-prune-main">{consultations.length}</p>
          </Card>
          <Card className="!p-4 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-prune-sec/60" />
              <span className="text-xs font-medium uppercase tracking-wider text-text-anthracite/60">Patients</span>
            </div>
            <p className="text-lg font-semibold text-prune-main">{patientsVus}</p>
          </Card>
        </div>
      </div>

      {estProprietaire && (
        <Card className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-anthracite/60 mb-4">
            Mot de passe
          </h2>

          {mdpSuccess && (
            <div className="flex items-center gap-2 text-sm text-success-green mb-4">
              <CheckCircle size={16} />
              Mot de passe modifié avec succès
            </div>
          )}

          {!showMdpForm ? (
            <button
              onClick={() => { setShowMdpForm(true); setMdpSuccess(false) }}
              className="text-sm text-prune-main underline underline-offset-2 hover:text-prune-sec transition-colors"
            >
              Changer le mot de passe
            </button>
          ) : (
            <form onSubmit={pwdHandleSubmit(handleChangerMdp)} className="flex flex-col gap-4 max-w-sm">
              <Input
                label="Ancien mot de passe"
                type={showAncien ? 'text' : 'password'}
                {...pwdRegister('ancienMdp')}
                required
                placeholder="••••••••"
                error={pwdErrors.ancienMdp?.message}
                rightElement={
                  <button type="button" onClick={() => setShowAncien(!showAncien)} tabIndex={-1} className="text-text-anthracite/60 hover:text-prune-main transition-colors">
                    {showAncien ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              <Input
                label="Nouveau mot de passe"
                type={showNouveau ? 'text' : 'password'}
                {...pwdRegister('nouveauMdp')}
                required
                placeholder="••••••••"
                error={pwdErrors.nouveauMdp?.message}
                rightElement={
                  <button type="button" onClick={() => setShowNouveau(!showNouveau)} tabIndex={-1} className="text-text-anthracite/60 hover:text-prune-main transition-colors">
                    {showNouveau ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              <Input
                label="Confirmer le mot de passe"
                type={showConfirmer ? 'text' : 'password'}
                {...pwdRegister('confirmerMdp')}
                required
                placeholder="••••••••"
                error={pwdErrors.confirmerMdp?.message}
                rightElement={
                  <button type="button" onClick={() => setShowConfirmer(!showConfirmer)} tabIndex={-1} className="text-text-anthracite/60 hover:text-prune-main transition-colors">
                    {showConfirmer ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              {mdpError && (
                <p className="text-xs text-alert-red">{mdpError}</p>
              )}
              <div className="flex gap-2">
                <Button type="submit" size="sm">Enregistrer</Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowMdpForm(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          )}
        </Card>
      )}

      <Card>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-anthracite/60 mb-4">
          Consultations récentes
        </h2>
        <DataTable columns={columns} data={consultations} />
        {consultations.length === 0 && (
          <EmptyState icon={<Activity size={28} />} title="Aucune consultation" />
        )}
      </Card>
      {confirmDialog}
    </div>
  )
}
