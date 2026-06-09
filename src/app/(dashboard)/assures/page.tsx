'use client'

import { useState, useMemo, useRef } from 'react'
import { Assure } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'
import { useAssures } from '@/hooks/data/useAssures'
import { useMedecins } from '@/hooks/data/useMedecins'
import { deleteAssure } from '@/lib/services/assures'
import { useConfirm } from '@/hooks/useConfirm'
import { useDebounce } from '@/hooks/useDebounce'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useToast } from '@/components/ui/Toast'
import Card from '@/components/ui/Card'
import DataTable from '@/components/ui/DataTable'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { TableSkeleton } from '@/components/ui/Skeleton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, Trash2 } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'

export default function AssuresPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { assures, isLoading, mutate } = useAssures()
  const { medecins } = useMedecins()
  const { confirm: ask, dialog: confirmDialog } = useConfirm()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const searchRef = useRef<HTMLInputElement>(null)

  const filteredAssures = useMemo(() => {
    if (user?.role !== 'MEDECIN') return assures
    const medecin = medecins.find(m => m.login === user.login)
    if (!medecin) return []
    return assures.filter(a => a.numMedecinTraitant === medecin.numMedecin)
  }, [user, assures, medecins])

  const filtered = filteredAssures.filter(a =>
    `${a.nom} ${a.prenom}`.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (a.email && a.email.toLowerCase().includes(debouncedSearch.toLowerCase()))
  )

  useKeyboard({
    '/': () => {
      if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        searchRef.current?.focus()
      }
    },
  })

  const handleDelete = async (a: Assure) => {
    const ok = await ask(`Êtes-vous sûr de vouloir supprimer ${a.prenom} ${a.nom} (N° ${a.numAssure}) ? Cette action est irréversible.`)
    if (ok) {
      try {
        await deleteAssure(a.numAssure)
        await mutate()
        toast.show(`${a.prenom} ${a.nom} a été supprimé`, 'success')
      } catch {
        toast.show('La suppression a échoué', 'error')
      }
    }
  }

  const columns = [
    {
      key: 'numAssure',
      header: 'N°',
      render: (a: Assure) => (
        <span className="text-xs text-text-anthracite/60 font-mono">#{a.numAssure}</span>
      ),
    },
    {
      key: 'nomComplet',
      header: 'Nom complet',
      sortable: true,
      render: (a: Assure) => (
        <div>
          <span className="font-medium text-prune-main">{a.prenom} {a.nom}</span>
          {a.email && <p className="text-xs text-text-anthracite/60">{a.email}</p>}
        </div>
      ),
    },
    {
      key: 'dateNaissance',
      header: 'Date naiss.',
      sortable: true,
      render: (a: Assure) => (
        <span className="text-sm">{formatDateShort(a.dateNaissance)}</span>
      ),
    },
    {
      key: 'sexe',
      header: 'Sexe',
      render: (a: Assure) => (
        <Badge variant="default">{a.sexe === 'M' ? 'Masculin' : 'Féminin'}</Badge>
      ),
    },
    {
      key: 'medecinTraitant',
      header: 'Médecin traitant',
      render: (a: Assure) => (
        <span className="text-sm">
          {a.nomMedecinTraitant ? (
            <span className="text-prune-sec">{a.nomMedecinTraitant}</span>
          ) : (
            <span className="text-text-anthracite/45 italic">Non attribué</span>
          )}
        </span>
      ),
    },
    {
      key: 'numCompteBancaire',
      header: 'IBAN',
      render: (a: Assure) => (
        <span className="text-xs font-mono text-text-anthracite/60">
          {a.numCompteBancaire ? a.numCompteBancaire.slice(0, 10) + '…' : '—'}
        </span>
      ),
    },
    ...(user?.role === 'AGENT_OSS' ? [{
      key: 'actions',
      header: '',
      render: (a: Assure) => (
        <button
          onClick={e => { e.stopPropagation(); handleDelete(a) }}
          className="p-1.5 text-alert-red/50 hover:text-alert-red hover:bg-alert-red/5 transition-colors"
          title="Supprimer"
        >
          <Trash2 size={15} />
        </button>
      ),
    }] : []),
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-prune-main mb-1">Assurés</h1>
          <p className="text-sm text-text-anthracite/60">{filteredAssures.length} personnes inscrites</p>
        </div>
        {user?.role === 'AGENT_OSS' && (
          <Link href="/assures/nouveau">
            <Button>
              <Plus size={16} className="mr-1.5" />
              Nouvel assuré
            </Button>
          </Link>
        )}
      </div>

      <Card className="mb-6">
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-anthracite/45" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un assuré…"
              aria-label="Rechercher un assuré"
            className="w-full border border-text-anthracite/15 bg-white-pure pl-9 pr-3 py-2 text-sm text-text-anthracite placeholder:text-text-anthracite/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-prune-main/40 focus-visible:border-prune-main transition-colors"
          />
        </div>
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={(a: Assure) => router.push(`/assures/${a.numAssure}`)}
          />
        )}
      </Card>
      {confirmDialog}
    </div>
  )
}
