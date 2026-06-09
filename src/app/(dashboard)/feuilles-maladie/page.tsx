'use client'

import { useState, useMemo, useRef } from 'react'
import { Remboursement, ModeReglement } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'
import { useFeuilles } from '@/hooks/data/useFeuilles'
import { useMedecins } from '@/hooks/data/useMedecins'
import { useAssures } from '@/hooks/data/useAssures'
import { effectuerRemboursement } from '@/lib/services/remboursements'
import { useDebounce } from '@/hooks/useDebounce'
import { useKeyboard } from '@/hooks/useKeyboard'
import Card from '@/components/ui/Card'
import DataTable from '@/components/ui/DataTable'
import StatusBadge from '@/components/ui/StatusBadge'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import RemboursementFlow from '@/components/remboursements/RemboursementFlow'
import FacturePreview from '@/components/facture/FacturePreview'
import { formatCurrency } from '@/lib/utils'
import { Plus, Filter, Search, HandCoins, Printer } from 'lucide-react'
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
  const { feuilles, isLoading, mutate } = useFeuilles()
  const { medecins } = useMedecins()
  const { assures } = useAssures()
  const toast = useToast()

  const mesFeuilles = useMemo(() => {
    if (user?.role !== 'MEDECIN') return feuilles
    const medecin = medecins.find(m => m.login === user.login)
    if (!medecin) return []
    return feuilles.filter(f => f.numMedecin === medecin.numMedecin)
  }, [user, feuilles, medecins])

  const remboursements = useMemo<RembWithMeta[]>(
    () =>
      mesFeuilles.flatMap(f =>
        f.remboursements.map(r => ({
          ...r,
          numFeuille: f.numFeuille,
          patientNom: f.nomAssure,
          medecinNom: f.nomMedecin,
          dateConsult: f.dateConsultation,
        })),
      ),
    [mesFeuilles],
  )
  const [filterStatut, setFilterStatut] = useState<'TOUS' | 'EN_ATTENTE' | 'EFFECTUE'>('TOUS')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [modalRemb, setModalRemb] = useState<RembWithMeta | null>(null)
  const [factureRemb, setFactureRemb] = useState<RembWithMeta | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [justCompletedId, setJustCompletedId] = useState<number | null>(null)

  const filtered = remboursements.filter(r => {
    const matchStatut = filterStatut === 'TOUS' || r.statut === filterStatut
    const matchSearch = r.patientNom.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      r.medecinNom.toLowerCase().includes(debouncedSearch.toLowerCase())
    return matchStatut && matchSearch
  })

  useKeyboard({
    '/': () => {
      if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        searchRef.current?.focus()
      }
    },
  })

  const handleRemboursementComplete = async (numRemb: number, mode: ModeReglement) => {
    try {
      await effectuerRemboursement(numRemb, mode)
      await mutate()
      setJustCompletedId(numRemb)
      setTimeout(() => setJustCompletedId(null), 4000)
    } catch {
      toast.show('Le remboursement a échoué', 'error')
    }
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
        <span className="font-mono text-xs text-text-anthracite/60">#{r.numFeuille}</span>
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
            : <span className="text-text-anthracite/45">—</span>}
        </span>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      render: (r: RembWithMeta) => (
        <span className={r.numRemboursement === justCompletedId ? 'animate-status-pulse inline-block' : ''}>
          <StatusBadge statut={r.statut} />
        </span>
      ),
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
          {r.statut === 'EFFECTUE' && user?.role === 'AGENT_OSS' && (
            <button
              onClick={e => { e.stopPropagation(); setFactureRemb(r) }}
              className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium border border-prune-sec/30 text-prune-sec hover:bg-prune-sec/5 transition-colors"
            >
              <Printer size={13} />
              Facture
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
          <h1 className="text-2xl md:text-3xl font-semibold text-prune-main mb-1">
            {user?.role === 'MEDECIN' ? 'Feuilles de maladie' : 'Remboursements'}
          </h1>
          <p className="text-sm text-text-anthracite/60">
            {user?.role === 'MEDECIN' ? 'Gestion des feuilles de maladie' : 'Gestion des remboursements'}
          </p>
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
          <p className="text-xs font-medium uppercase tracking-wider text-text-anthracite/60">Total</p>
          <p className="mt-1 text-lg font-semibold text-prune-main">{stats.total}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-text-anthracite/60">Effectués</p>
          <p className="mt-1 text-lg font-semibold text-success-green">{stats.effectue}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-text-anthracite/60">En attente</p>
          <p className="mt-1 text-lg font-semibold text-alert-red">{stats.enAttente}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-text-anthracite/60">Remboursé</p>
          <p className="mt-1 text-lg font-semibold text-prune-main">{formatCurrency(stats.montantEffectue)}</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-anthracite/45" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un patient ou médecin…"
              aria-label="Rechercher un patient ou médecin"
              className="w-full border border-text-anthracite/15 bg-white-pure pl-9 pr-3 py-2 text-sm text-text-anthracite placeholder:text-text-anthracite/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-prune-main/40 focus-visible:border-prune-main transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-text-anthracite/45" />
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
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={(r: RembWithMeta) => router.push(`/feuilles-maladie/${r.numFeuille}`)}
          />
        )}
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

      {factureRemb && (() => {
        const feuille = mesFeuilles.find(f => f.numFeuille === factureRemb.numFeuille)
        if (!feuille) return null
        return (
          <FacturePreview
            feuille={feuille}
            remboursement={factureRemb}
            onClose={() => setFactureRemb(null)}
          />
        )
      })()}
    </div>
  )
}
