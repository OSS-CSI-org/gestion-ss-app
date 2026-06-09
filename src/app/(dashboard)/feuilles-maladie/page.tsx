'use client'

import { useState, useMemo } from 'react'
import { feuillesMaladie, medecins, assures } from '@/data/mock'
import { Remboursement } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'
import Card from '@/components/ui/Card'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import RemboursementFlow from '@/components/remboursements/RemboursementFlow'
import { formatCurrency } from '@/lib/utils'
import { Plus, Filter, Search, HandCoins } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type RembWithMeta = Remboursement & {
  patientNom: string
  medecinNom: string
  dateConsult: string
  numFeuille: number
}

export default function FeuillesMaladiePage() {
  const router = useRouter()
  const { user } = useAuth()

  const mesFeuilles = useMemo(() => {
    if (user?.role !== 'MEDECIN') return feuillesMaladie
    const medecin = medecins.find(m => m.login === user.login)
    if (!medecin) return []
    return feuillesMaladie.filter(f => f.numMedecin === medecin.numMedecin)
  }, [user])

  const [remboursements, setRemboursements] = useState<RembWithMeta[]>(
    mesFeuilles.flatMap(f => f.remboursements.map(r => ({
      ...r,
      numFeuille: f.numFeuille,
      patientNom: f.nomAssure,
      medecinNom: f.nomMedecin,
      dateConsult: f.dateConsultation,
    })))
  )
  const [filterStatut, setFilterStatut] = useState<'TOUS' | 'EN_ATTENTE' | 'EFFECTUE'>('TOUS')
  const [search, setSearch] = useState('')
  const [modalRemb, setModalRemb] = useState<RembWithMeta | null>(null)

  const filtered = remboursements.filter(r => {
    const matchStatut = filterStatut === 'TOUS' || r.statut === filterStatut
    const matchSearch = r.patientNom.toLowerCase().includes(search.toLowerCase()) ||
      r.medecinNom.toLowerCase().includes(search.toLowerCase())
    return matchStatut && matchSearch
  })

  const handleRemboursementComplete = (numRemb: number) => {
    setRemboursements(prev =>
      prev.map(r =>
        r.numRemboursement === numRemb
          ? { ...r, statut: 'EFFECTUE' as const, dateRemboursement: new Date().toISOString().split('T')[0], agentLogin: 'admin' }
          : r
      )
    )
  }

  const selectedRemb = modalRemb
  const patientIban = selectedRemb
    ? assures.find(a => `${a.prenom} ${a.nom}` === selectedRemb.patientNom)?.numCompteBancaire
    : undefined

  const columns = [
    {
      key: 'numFeuille',
      header: 'N°',
      render: (r: RembWithMeta) => (
        <span className="font-mono text-xs text-text-anthracite/40">#{r.numFeuille}</span>
      ),
    },
    {
      key: 'patientNom',
      header: 'Patient',
      render: (r: RembWithMeta) => (
        <span className="font-medium text-prune-main">{r.patientNom}</span>
      ),
    },
    {
      key: 'medecinNom',
      header: 'Médecin',
      render: (r: RembWithMeta) => (
        <span className="text-sm text-text-anthracite/70">{r.medecinNom}</span>
      ),
    },
    {
      key: 'nature',
      header: 'Nature',
      render: (r: RembWithMeta) => (
        <span className="text-sm text-text-anthracite/60">{r.nature}</span>
      ),
    },
    {
      key: 'montant',
      header: 'Montant',
      render: (r: RembWithMeta) => (
        <span className="font-medium text-text-anthracite">{formatCurrency(r.montant)}</span>
      ),
    },
    {
      key: 'taux',
      header: 'Taux',
      render: (r: RembWithMeta) => (
        <Badge variant={r.taux >= 1 ? 'success' : 'gold'}>{Math.round(r.taux * 100)}%</Badge>
      ),
    },
    {
      key: 'modeReglement',
      header: 'Mode',
      render: (r: RembWithMeta) => (
        <span className="text-sm text-text-anthracite/60">
          {r.statut === 'EFFECTUE'
            ? (r.modeReglement === 'VIREMENT' ? 'Virement' : 'Cash')
            : <span className="text-text-anthracite/30">—</span>}
        </span>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      render: (r: RembWithMeta) => <StatusBadge statut={r.statut} />,
    },
    {
      key: 'actions',
      header: '',
      render: (r: RembWithMeta) => (
        <div className="flex gap-1 items-center">
          {r.statut === 'EN_ATTENTE' && user?.role === 'AGENT_OSS' && (
            <button
              onClick={e => { e.stopPropagation(); setModalRemb(r) }}
              className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium border border-prune-main/30 text-prune-main hover:bg-prune-main/5 transition-colors"
            >
              <HandCoins size={13} />
              Rembourser
            </button>
          )}
        </div>
      ),
    },
  ]

  const stats = {
    total: remboursements.length,
    effectue: remboursements.filter(r => r.statut === 'EFFECTUE').length,
    enAttente: remboursements.filter(r => r.statut === 'EN_ATTENTE').length,
    montantTotal: remboursements.reduce((sum, r) => sum + r.montant, 0),
    montantEffectue: remboursements.filter(r => r.statut === 'EFFECTUE').reduce((sum, r) => sum + r.montant, 0),
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-prune-main mb-1">Remboursements</h1>
          <p className="text-sm text-text-anthracite/50">Suivi des remboursements</p>
        </div>
        {user?.role === 'MEDECIN' && (
          <Link href="/feuilles-maladie/nouvelle">
            <Button>
              <Plus size={16} className="mr-1.5" />
              Nouvelle feuille
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="!p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-text-anthracite/50">Total</p>
          <p className="mt-1 text-lg font-semibold text-prune-main">{stats.total}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-text-anthracite/50">Effectués</p>
          <p className="mt-1 text-lg font-semibold text-success-green">{stats.effectue}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-text-anthracite/50">En attente</p>
          <p className="mt-1 text-lg font-semibold text-alert-red">{stats.enAttente}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-text-anthracite/50">Remboursé</p>
          <p className="mt-1 text-lg font-semibold text-prune-main">{formatCurrency(stats.montantEffectue)}</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-anthracite/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un patient ou médecin…"
              className="w-full border border-text-anthracite/15 bg-white-pure pl-9 pr-3 py-2 text-sm text-text-anthracite placeholder:text-text-anthracite/30 focus:outline-none focus:border-prune-main transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-text-anthracite/30" />
            {(['TOUS', 'EN_ATTENTE', 'EFFECTUE'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatut(s)}
                  className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                    filterStatut === s
                      ? 'bg-prune-main text-prune-light border-prune-main'
                      : 'bg-white-pure text-text-anthracite/60 border-text-anthracite/15 hover:border-text-anthracite/30'
                  }`}
                >
                  {s === 'TOUS' ? 'Tous' : s === 'EN_ATTENTE' ? 'En attente' : 'Effectués'}
                </button>
              ))}
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={(r: RembWithMeta) => router.push(`/feuilles-maladie/${r.numFeuille}`)}
        />
      </Card>

      {modalRemb && (
        <RemboursementFlow
          remboursement={modalRemb}
          patientNom={modalRemb.patientNom}
          patientIban={patientIban}
          onComplete={handleRemboursementComplete}
          onClose={() => setModalRemb(null)}
        />
      )}
    </div>
  )
}
