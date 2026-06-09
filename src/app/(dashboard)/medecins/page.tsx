'use client'

import { useState, useRef } from 'react'
import { Medecin, TypeMedecin } from '@/lib/types'
import { useMedecins } from '@/hooks/data/useMedecins'
import { deleteMedecin } from '@/lib/services/medecins'
import Card from '@/components/ui/Card'
import DataTable from '@/components/ui/DataTable'
import Badge from '@/components/ui/Badge'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { Search, Filter, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useConfirm } from '@/hooks/useConfirm'
import { useDebounce } from '@/hooks/useDebounce'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useToast } from '@/components/ui/Toast'

export default function MedecinsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { medecins, isLoading, mutate } = useMedecins()
  const { confirm: ask, dialog: confirmDialog } = useConfirm()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [filterType, setFilterType] = useState<TypeMedecin | 'TOUS'>('TOUS')
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = medecins.filter(m => {
    const matchesSearch = `${m.nom} ${m.prenom}`.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (m.email && m.email.toLowerCase().includes(debouncedSearch.toLowerCase()))
    const matchesType = filterType === 'TOUS' || m.typeMedecin === filterType
    return matchesSearch && matchesType
  })

  useKeyboard({
    '/': () => {
      if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        searchRef.current?.focus()
      }
    },
  })

  const handleDelete = async (m: Medecin) => {
    const ok = await ask(`Êtes-vous sûr de vouloir supprimer Dr. ${m.prenom} ${m.nom} ? Cette action est irréversible.`)
    if (ok) {
      try {
        await deleteMedecin(m.numMedecin)
        await mutate()
        toast.show(`Dr. ${m.prenom} ${m.nom} a été supprimé`, 'success')
      } catch {
        toast.show('La suppression a échoué', 'error')
      }
    }
  }

  const columns = [
    {
      key: 'nomComplet',
      header: 'Nom complet',
      sortable: true,
      render: (m: Medecin) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-prune-main">Dr. {m.prenom} {m.nom}</span>
          {m.estAssure && (
            <Badge variant="alert">Assuré</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (m: Medecin) => (
        <span className="text-sm text-text-anthracite/60">{m.email || '—'}</span>
      ),
    },
    {
      key: 'typeMedecin',
      header: 'Spécialité',
      render: (m: Medecin) => (
        <Badge variant={m.typeMedecin === 'GENERALISTE' ? 'prune' : 'gold'}>
          {m.typeMedecin === 'GENERALISTE' ? 'Généraliste' : 'Spécialiste'}
        </Badge>
      ),
    },
    {
      key: 'detail',
      header: 'Détail',
      render: (m: Medecin) => (
        <span className="text-sm text-text-anthracite/60">
          {m.typeMedecin === 'GENERALISTE' ? m.typeFormation : m.nomSpecialite}
        </span>
      ),
    },
    ...(user?.role === 'AGENT_OSS' ? [{
      key: 'actions',
      header: '',
      render: (m: Medecin) => (
        <button
          onClick={e => { e.stopPropagation(); handleDelete(m) }}
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
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-prune-main mb-1">Médecins</h1>
          <p className="text-sm text-text-anthracite/60">{filtered.length} praticiens référencés</p>
        </div>
        {user?.role === 'AGENT_OSS' && (
          <Link href="/medecins/nouveau">
            <Button variant="primary">
              <Plus size={16} className="mr-1" />
              Nouveau médecin
            </Button>
          </Link>
        )}
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
              placeholder="Rechercher un médecin…"
              aria-label="Rechercher un médecin"
              className="w-full border border-text-anthracite/15 bg-white-pure pl-9 pr-3 py-2 text-sm text-text-anthracite placeholder:text-text-anthracite/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-prune-main/40 focus-visible:border-prune-main transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-text-anthracite/45" />
            {(['TOUS', 'GENERALISTE', 'SPECIALISTE'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                  filterType === type
                    ? 'bg-prune-main text-prune-light border-prune-main'
                    : 'bg-white-pure text-text-anthracite/60 border-text-anthracite/15 hover:border-text-anthracite/30'
                }`}
              >
                {type === 'TOUS' ? 'Tous' : type === 'GENERALISTE' ? 'Généralistes' : 'Spécialistes'}
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
            onRowClick={(m: Medecin) => router.push(`/medecins/${m.numMedecin}`)}
          />
        )}
      </Card>
      {confirmDialog}
    </div>
  )
}
