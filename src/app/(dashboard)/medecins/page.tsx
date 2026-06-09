'use client'

import { useState } from 'react'
import { medecins } from '@/data/mock'
import { Medecin, TypeMedecin } from '@/lib/types'
import Card from '@/components/ui/Card'
import DataTable from '@/components/ui/DataTable'
import Badge from '@/components/ui/Badge'
import { Search, Filter, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

export default function MedecinsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<TypeMedecin | 'TOUS'>('TOUS')
  const [deletedIds, setDeletedIds] = useState<number[]>([])

  const filtered = medecins.filter(m => {
    if (deletedIds.includes(m.numMedecin)) return false
    const matchesSearch = `${m.nom} ${m.prenom}`.toLowerCase().includes(search.toLowerCase()) ||
      (m.email && m.email.toLowerCase().includes(search.toLowerCase()))
    const matchesType = filterType === 'TOUS' || m.typeMedecin === filterType
    return matchesSearch && matchesType
  })

  const handleDelete = (m: Medecin) => {
    if (window.confirm(`Supprimer Dr. ${m.prenom} ${m.nom} ? Cette action est irréversible.`)) {
      setDeletedIds(prev => [...prev, m.numMedecin])
    }
  }

  const columns = [
    {
      key: 'nomComplet',
      header: 'Nom complet',
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
          <h1 className="text-xl font-semibold text-prune-main mb-1">Médecins</h1>
          <p className="text-sm text-text-anthracite/50">{medecins.length} praticiens référencés</p>
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
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-anthracite/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un médecin…"
              className="w-full border border-text-anthracite/15 bg-white-pure pl-9 pr-3 py-2 text-sm text-text-anthracite placeholder:text-text-anthracite/30 focus:outline-none focus:border-prune-main transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-text-anthracite/30" />
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
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={(m: Medecin) => router.push(`/medecins/${m.numMedecin}`)}
        />
      </Card>
    </div>
  )
}
