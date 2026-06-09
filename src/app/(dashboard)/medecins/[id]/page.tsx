'use client'

import { use, useState } from 'react'
import { medecins, feuillesMaladie, mettreAJourMotDePasse } from '@/data/mock'
import { FeuilleMaladie } from '@/lib/types'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import StatusBadge from '@/components/ui/StatusBadge'
import DataTable from '@/components/ui/DataTable'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { ArrowLeft, Mail, Calendar, User, Stethoscope, Activity, FileText, Trash2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDateShort } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function MedecinDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const medecin = medecins.find(m => m.numMedecin === Number(id))

  if (!medecin) {
    return (
      <div>
        <Link href="/medecins" className="inline-flex items-center gap-1 text-sm text-text-anthracite/50 hover:text-prune-main mb-4 transition-colors">
          <ArrowLeft size={16} /> Retour aux médecins
        </Link>
        <Card>
          <p className="text-text-anthracite/50 text-center py-8">Médecin introuvable</p>
        </Card>
      </div>
    )
  }

  const [showMdpForm, setShowMdpForm] = useState(false)
  const [ancienMdp, setAncienMdp] = useState('')
  const [nouveauMdp, setNouveauMdp] = useState('')
  const [confirmerMdp, setConfirmerMdp] = useState('')
  const [showAncien, setShowAncien] = useState(false)
  const [showNouveau, setShowNouveau] = useState(false)
  const [showConfirmer, setShowConfirmer] = useState(false)
  const [mdpError, setMdpError] = useState('')
  const [mdpSuccess, setMdpSuccess] = useState(false)
  const estProprietaire = user?.login === medecin.login

  const consultations = feuillesMaladie.filter(f => f.numMedecin === medecin.numMedecin)
  const patientsVus = new Set(consultations.map(f => f.numAssure)).size

  const handleChangerMdp = (e: React.FormEvent) => {
    e.preventDefault()
    setMdpError('')
    setMdpSuccess(false)

    if (ancienMdp !== user?.motDePasse) {
      setMdpError('Ancien mot de passe incorrect')
      return
    }
    if (nouveauMdp.length < 4) {
      setMdpError('Le nouveau mot de passe doit contenir au moins 4 caractères')
      return
    }
    if (nouveauMdp !== confirmerMdp) {
      setMdpError('Les mots de passe ne correspondent pas')
      return
    }

    mettreAJourMotDePasse(medecin.login, nouveauMdp)
    setMdpSuccess(true)
    setAncienMdp('')
    setNouveauMdp('')
    setConfirmerMdp('')
    setShowMdpForm(false)
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
        const aUnRejete = f.remboursements.some(r => r.statut === 'REJETEE')
        return <StatusBadge statut={tousEffectues ? 'EFFECTUE' : aUnRejete ? 'REJETEE' : 'EN_ATTENTE'} />
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

  return (
    <div>
      <Link href="/medecins" className="inline-flex items-center gap-1 text-sm text-text-anthracite/50 hover:text-prune-main mb-4 transition-colors">
        <ArrowLeft size={16} /> Retour aux médecins
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-semibold text-prune-main">Dr. {medecin.prenom} {medecin.nom}</h1>
            {medecin.estAssure && <Badge variant="alert">Assuré</Badge>}
          </div>
          <p className="text-sm text-text-anthracite/50">
            {medecin.typeMedecin === 'GENERALISTE' ? 'Médecin généraliste' : medecin.nomSpecialite}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={medecin.typeMedecin === 'GENERALISTE' ? 'prune' : 'gold'}>
            {medecin.typeMedecin === 'GENERALISTE' ? 'Généraliste' : 'Spécialiste'}
          </Badge>
          {user?.role === 'AGENT_OSS' && (
            <button
              onClick={() => {
                let msg = `Supprimer Dr. ${medecin.prenom} ${medecin.nom} ?`
                if (consultations.length > 0) {
                  msg += `\n\n⚠️ Ce médecin a ${consultations.length} consultation(s) associée(s). Elles seront également supprimées.`
                }
                msg += '\n\nCette action est irréversible.'
                if (window.confirm(msg)) {
                  router.push('/medecins')
                }
              }}
              className="p-2 text-alert-red/50 hover:text-alert-red hover:bg-alert-red/5 transition-colors"
              title="Supprimer le médecin"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-anthracite/50 mb-4">Informations</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User size={14} className="text-text-anthracite/30" />
              <span className="text-text-anthracite/50">Nom</span>
              <span className="ml-auto font-medium text-prune-main">{medecin.nom}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={14} className="text-text-anthracite/30" />
              <span className="text-text-anthracite/50">Prénom</span>
              <span className="ml-auto font-medium text-prune-main">{medecin.prenom}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-text-anthracite/30" />
              <span className="text-text-anthracite/50">Date naissance</span>
              <span className="ml-auto font-medium">{formatDateShort(medecin.dateNaissance)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-text-anthracite/30" />
              <span className="text-text-anthracite/50">Email</span>
              <span className="ml-auto font-medium">{medecin.email || '—'}</span>
            </div>
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <Stethoscope size={14} className="text-text-anthracite/30" />
                <span className="text-text-anthracite/50">Formation</span>
                <span className="ml-auto font-medium text-right">{medecin.typeFormation || medecin.nomSpecialite}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-3">
          <Card className="!p-4 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={14} className="text-prune-sec/40" />
              <span className="text-xs font-medium uppercase tracking-wider text-text-anthracite/50">Consultations</span>
            </div>
            <p className="text-lg font-semibold text-prune-main">{consultations.length}</p>
          </Card>
          <Card className="!p-4 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-prune-sec/40" />
              <span className="text-xs font-medium uppercase tracking-wider text-text-anthracite/50">Patients</span>
            </div>
            <p className="text-lg font-semibold text-prune-main">{patientsVus}</p>
          </Card>
        </div>
      </div>

      {estProprietaire && (
        <Card className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-anthracite/50 mb-4">
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
            <form onSubmit={handleChangerMdp} className="flex flex-col gap-4 max-w-sm">
              <Input
                label="Ancien mot de passe"
                type={showAncien ? 'text' : 'password'}
                value={ancienMdp}
                onChange={e => setAncienMdp(e.target.value)}
                required
                placeholder="••••••••"
                rightElement={
                  <button type="button" onClick={() => setShowAncien(!showAncien)} tabIndex={-1} className="text-text-anthracite/40 hover:text-prune-main transition-colors">
                    {showAncien ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              <Input
                label="Nouveau mot de passe"
                type={showNouveau ? 'text' : 'password'}
                value={nouveauMdp}
                onChange={e => setNouveauMdp(e.target.value)}
                required
                placeholder="••••••••"
                rightElement={
                  <button type="button" onClick={() => setShowNouveau(!showNouveau)} tabIndex={-1} className="text-text-anthracite/40 hover:text-prune-main transition-colors">
                    {showNouveau ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              <Input
                label="Confirmer le mot de passe"
                type={showConfirmer ? 'text' : 'password'}
                value={confirmerMdp}
                onChange={e => setConfirmerMdp(e.target.value)}
                required
                placeholder="••••••••"
                rightElement={
                  <button type="button" onClick={() => setShowConfirmer(!showConfirmer)} tabIndex={-1} className="text-text-anthracite/40 hover:text-prune-main transition-colors">
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
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-anthracite/50 mb-4">
          Consultations récentes
        </h2>
        <DataTable columns={columns} data={consultations} />
        {consultations.length === 0 && (
          <p className="text-center py-8 text-sm text-text-anthracite/40">Aucune consultation</p>
        )}
      </Card>
    </div>
  )
}
