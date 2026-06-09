'use client'

import { use } from 'react'
import { assures, feuillesMaladie } from '@/data/mock'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import StatusBadge from '@/components/ui/StatusBadge'
import DataTable from '@/components/ui/DataTable'
import Button from '@/components/ui/Button'
import { ArrowLeft, Mail, Calendar, User, CreditCard, Stethoscope, FileText, FilePlus, Euro, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import { FeuilleMaladie } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function AssureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const assure = assures.find(a => a.numAssure === Number(id))

  if (!assure) {
    return (
      <div>
        <Link href="/assures" className="inline-flex items-center gap-1 text-sm text-text-anthracite/50 hover:text-prune-main mb-4 transition-colors">
          <ArrowLeft size={16} /> Retour aux assurés
        </Link>
        <Card>
          <p className="text-text-anthracite/50 text-center py-8">Assuré introuvable</p>
        </Card>
      </div>
    )
  }

  const feuilles = feuillesMaladie.filter(f => f.numAssure === assure.numAssure)

  const totalRembourse = feuilles.reduce((sum, f) =>
    sum + f.remboursements.filter(r => r.statut === 'EFFECTUE').reduce((s, r) => s + r.montant, 0), 0
  )
  const totalAttente = feuilles.reduce((sum, f) =>
    sum + f.remboursements.filter(r => r.statut === 'EN_ATTENTE').reduce((s, r) => s + r.montant, 0), 0
  )

  const columns = [
    {
      key: 'numFeuille',
      header: 'N°',
      render: (f: FeuilleMaladie) => (
        <span className="font-mono text-xs text-text-anthracite/40">#{f.numFeuille}</span>
      ),
    },
    {
      key: 'dateConsultation',
      header: 'Date',
      render: (f: FeuilleMaladie) => (
        <span className="text-sm">{formatDateShort(f.dateConsultation)}</span>
      ),
    },
    {
      key: 'nomMedecin',
      header: 'Médecin',
      render: (f: FeuilleMaladie) => (
        <span className="text-sm text-prune-sec">{f.nomMedecin}</span>
      ),
    },
    {
      key: 'motif',
      header: 'Motif',
      render: (f: FeuilleMaladie) => (
        <span className="text-sm text-text-anthracite/70">{f.motif}</span>
      ),
    },
    {
      key: 'montant',
      header: 'Montant',
      render: (f: FeuilleMaladie) => (
        <span className="text-sm font-medium">
          {formatCurrency(f.remboursements.reduce((s, r) => s + r.montant, 0))}
        </span>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      render: (f: FeuilleMaladie) => {
        const tousEffectues = f.remboursements.every(r => r.statut === 'EFFECTUE')
        const aUnRejete = f.remboursements.some(r => r.statut === 'REJETEE')
        return (
          <StatusBadge statut={tousEffectues ? 'EFFECTUE' : aUnRejete ? 'REJETEE' : 'EN_ATTENTE'} />
        )
      },
    },
    {
      key: 'actions',
      header: '',
      render: (f: FeuilleMaladie) => (
        <Link href={`/feuilles-maladie/${f.numFeuille}`}>
          <Button variant="ghost" size="sm">Voir</Button>
        </Link>
      ),
    },
  ]

  return (
    <div>
      <Link href="/assures" className="inline-flex items-center gap-1 text-sm text-text-anthracite/50 hover:text-prune-main mb-4 transition-colors">
        <ArrowLeft size={16} /> Retour aux assurés
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-prune-main mb-1">{assure.prenom} {assure.nom}</h1>
          <p className="text-sm text-text-anthracite/50">Assuré n°{assure.numAssure}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={assure.sexe === 'M' ? 'prune' : 'gold'}>
            {assure.sexe === 'M' ? 'Masculin' : 'Féminin'}
          </Badge>
          {user?.role === 'AGENT_OSS' && (
            <button
              onClick={() => {
                if (window.confirm(`Supprimer l'assuré ${assure.prenom} ${assure.nom} ? Cette action est irréversible.`)) {
                  router.push('/assures')
                }
              }}
              className="p-2 text-alert-red/50 hover:text-alert-red hover:bg-alert-red/5 transition-colors"
              title="Supprimer l'assuré"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-anthracite/50 mb-4">Informations personnelles</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User size={14} className="text-text-anthracite/30" />
              <span className="text-text-anthracite/50">Nom</span>
              <span className="ml-auto font-medium text-prune-main">{assure.nom}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={14} className="text-text-anthracite/30" />
              <span className="text-text-anthracite/50">Prénom</span>
              <span className="ml-auto font-medium text-prune-main">{assure.prenom}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-text-anthracite/30" />
              <span className="text-text-anthracite/50">Date naissance</span>
              <span className="ml-auto font-medium">{formatDateShort(assure.dateNaissance)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-text-anthracite/30" />
              <span className="text-text-anthracite/50">Email</span>
              <span className="ml-auto font-medium">{assure.email || '—'}</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <CreditCard size={14} className="text-text-anthracite/30" />
              <span className="text-text-anthracite/50">IBAN</span>
              <span className="ml-auto font-mono text-xs">{assure.numCompteBancaire || '—'}</span>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-3">
          <Card className="!p-4 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope size={14} className="text-prune-sec/40" />
              <span className="text-xs font-medium uppercase tracking-wider text-text-anthracite/50">Médecin traitant</span>
            </div>
            <p className="text-sm font-medium text-prune-main">
              {assure.nomMedecinTraitant || 'Non attribué'}
            </p>
          </Card>
          <Card className="!p-4 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-prune-sec/40" />
              <span className="text-xs font-medium uppercase tracking-wider text-text-anthracite/50">Feuilles</span>
            </div>
            <p className="text-lg font-semibold text-prune-main">{feuilles.length}</p>
          </Card>
          <Card className="!p-4 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Euro size={14} className="text-success-green/40" />
              <span className="text-xs font-medium uppercase tracking-wider text-text-anthracite/50">Remboursé</span>
            </div>
            <p className="text-lg font-semibold text-success-green">{formatCurrency(totalRembourse)}</p>
            {totalAttente > 0 && (
              <p className="text-xs text-alert-red mt-1">{formatCurrency(totalAttente)} en attente</p>
            )}
          </Card>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-anthracite/50">
            Historique des feuilles de maladie
          </h2>
          {user?.role === 'MEDECIN' && (
            <Link href={`/feuilles-maladie/nouvelle?patientId=${assure.numAssure}`}>
              <Button size="sm">
                <FilePlus size={14} className="mr-1.5" />
                Nouvelle feuille
              </Button>
            </Link>
          )}
        </div>
        <DataTable columns={columns} data={feuilles} />
        {feuilles.length === 0 && (
          <p className="text-center py-8 text-sm text-text-anthracite/40">Aucune feuille de maladie</p>
        )}
      </Card>
    </div>
  )
}
