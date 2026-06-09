'use client'

import { useState, useMemo } from 'react'
import { Banknote, Users, FileWarning, Activity, ArrowRight, Calendar, FilePlus, Plus, Play } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'
import MonthlyChart from '@/components/charts/MonthlyChart'
import PaymentModeChart from '@/components/charts/PaymentModeChart'
import RemboursementStatusChart from '@/components/charts/RemboursementStatusChart'
import { useAuth } from '@/hooks/useAuth'
import { assures, feuillesMaladie, medecins } from '@/data/mock'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Link from 'next/link'

type Period = 7 | 30 | 90

const periods: { label: string; value: Period }[] = [
  { label: '7 jours', value: 7 },
  { label: '30 jours', value: 30 },
  { label: '90 jours', value: 90 },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [period, setPeriod] = useState<Period>(30)

  const cutoff = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - period)
    return d
  }, [period])

  const filteredFeuilles = useMemo(
    () => feuillesMaladie.filter(f => new Date(f.dateEmission) >= cutoff),
    [cutoff]
  )

  const enAttente = useMemo(
    () => filteredFeuilles.filter(f => f.remboursements.some(r => r.statut === 'EN_ATTENTE')),
    [filteredFeuilles]
  )

  const statTotals = useMemo(() => {
    let virements = 0
    let cash = 0
    for (const f of filteredFeuilles) {
      for (const r of f.remboursements) {
        if (r.modeReglement === 'VIREMENT') virements += r.montant
        else cash += r.montant
      }
    }
    return { total: virements + cash, virements, cash }
  }, [filteredFeuilles])

  if (user?.role === 'MEDECIN') {
    const medecin = medecins.find(m => m.login === user.login)
    const aujourdhui = new Date().toISOString().split('T')[0]
    const mesConsultations = feuillesMaladie.filter(f => f.numMedecin === medecin?.numMedecin)
    const aujourdhuiCount = mesConsultations.filter(f => f.dateConsultation === aujourdhui).length
    const mesPatients = new Set(mesConsultations.map(f => f.numAssure)).size
    const enAttenteCount = mesConsultations.filter(f => f.remboursements.some(r => r.statut === 'EN_ATTENTE')).length

    return (
      <div>
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-xl font-semibold text-prune-main">
              Bonjour{' '}
              <Link href={`/medecins/${medecin?.numMedecin}`} className="hover:text-prune-sec transition-colors">
                Dr. {user.prenom}
              </Link>
            </h1>
            <p className="text-sm text-text-anthracite/50">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            {aujourdhuiCount > 0 && (
              <p className="text-xs text-prune-sec mt-1">
                {aujourdhuiCount} consultation{aujourdhuiCount > 1 ? 's' : ''} aujourd'hui
              </p>
            )}
          </div>
          <Link href="/feuilles-maladie/nouvelle">
            <Button size="sm">
              <FilePlus size={14} className="mr-1.5" />
              Nouvelle consultation
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 mt-6">
          <StatCard
            title="Mes consultations"
            value={mesConsultations.length}
            subtitle="Feuilles émises"
            icon={<Calendar size={24} />}
            href="/feuilles-maladie"
          />
          <StatCard
            title="Patients"
            value={mesPatients}
            subtitle="Patients suivis"
            icon={<Users size={24} />}
            href="/assures"
          />
          <StatCard
            title="En attente"
            value={enAttenteCount}
            subtitle="Remboursements en attente"
            icon={<FileWarning size={24} />}
            href="/feuilles-maladie"
          />
        </div>

        <Card className="max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-prune-main uppercase tracking-wider">
              Mes dernières consultations
            </h2>
            <Link href="/feuilles-maladie">
              <Button variant="ghost" size="sm">
                Voir tout <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-0">
            {mesConsultations.slice(-5).reverse().map(c => (
              <Link key={c.numFeuille} href={`/feuilles-maladie/${c.numFeuille}`} className="flex items-center gap-3 py-3 border-b border-text-anthracite/5 last:border-0 hover:bg-prune-main/[0.02] transition-colors group">
                <div className="w-1.5 h-1.5 rounded-full bg-prune-sec/30 flex-shrink-0" />
                <p className="flex-1 text-sm text-text-anthracite group-hover:text-prune-main transition-colors">
                  {c.nomAssure} — <span className="text-text-anthracite/60">{c.motif}</span>
                </p>
                <span className="text-xs text-text-anthracite/40 whitespace-nowrap">
                  {formatDateShort(c.dateConsultation)}
                </span>
              </Link>
            ))}
            {mesConsultations.length === 0 && (
              <p className="text-center py-6 text-sm text-text-anthracite/40">Aucune consultation</p>
            )}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-prune-main mb-1">Tableau de bord</h1>
          <p className="text-sm text-text-anthracite/50">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/assures/nouveau">
            <Button variant="ghost" size="sm">
              <Plus size={14} className="mr-1" /> Nouvel assuré
            </Button>
          </Link>
          <Link href="/medecins/nouveau">
            <Button variant="primary" size="sm">
              <Plus size={14} className="mr-1" /> Nouveau médecin
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs font-medium uppercase tracking-wider text-text-anthracite/50">Période</span>
        <div className="flex bg-white-pure border border-text-anthracite/5 text-sm">
          {periods.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 transition-colors ${
                period === p.value
                  ? 'bg-prune-main text-prune-light'
                  : 'text-text-anthracite/60 hover:text-prune-main'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total remboursements"
          value={formatCurrency(statTotals.total)}
          subtitle={`${formatCurrency(statTotals.virements)} virements · ${formatCurrency(statTotals.cash)} cash`}
          icon={<Banknote size={24} />}
          href="/feuilles-maladie"
        />
        <StatCard
          title="Assurés"
          value={assures.length}
          subtitle="Personnes inscrites"
          icon={<Users size={24} />}
          href="/assures"
        />
        <StatCard
          title="Médecins"
          value={new Set(filteredFeuilles.map(f => f.numMedecin)).size}
          subtitle="Praticiens"
          icon={<Activity size={24} />}
          href="/medecins"
        />
        <StatCard
          title="En attente"
          value={enAttente.length}
          subtitle="Feuilles à traiter"
          icon={<FileWarning size={24} />}
          href="/feuilles-maladie"
        />
      </div>

      {enAttente.length > 0 && (
        <Card className="mb-8 border-alert-red/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-prune-main uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-alert-red" />
              Feuilles en attente de traitement
            </h2>
            <span className="text-xs text-text-anthracite/40">{enAttente.length} feuille{enAttente.length > 1 ? 's' : ''}</span>
          </div>
          <div className="divide-y divide-text-anthracite/5">
            {enAttente.sort((a, b) => b.dateEmission.localeCompare(a.dateEmission)).slice(0, 5).map(f => (
              <div key={f.numFeuille} className="flex items-center gap-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-anthracite truncate">{f.nomAssure}</p>
                  <p className="text-xs text-text-anthracite/50 truncate">
                    {f.nomMedecin} — {f.motif}
                  </p>
                </div>
                <span className="text-xs text-text-anthracite/40 whitespace-nowrap">
                  {formatDateShort(f.dateEmission)}
                </span>
                <div className="flex gap-1.5">
                  {f.remboursements.filter(r => r.statut === 'EN_ATTENTE').map(r => (
                    <span
                      key={r.numRemboursement}
                      className="text-xs font-mono bg-prune-light/40 text-prune-main px-2 py-0.5"
                    >
                      {formatCurrency(r.montant)}
                    </span>
                  ))}
                </div>
                <Link href={`/feuilles-maladie/${f.numFeuille}`}>
                  <Button variant="primary" size="sm">
                    <Play size={12} className="mr-1" /> Traiter
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          {enAttente.length > 5 && (
            <div className="pt-3 border-t border-text-anthracite/5 text-center">
              <Link href="/feuilles-maladie">
                <Button variant="ghost" size="sm">
                  Voir les {enAttente.length - 5} autres <ArrowRight size={14} className="ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2">
          <MonthlyChart feuilles={filteredFeuilles} />
        </div>
        <PaymentModeChart feuilles={filteredFeuilles} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-prune-main uppercase tracking-wider">
              Dernières activités
            </h2>
            <Link href="/feuilles-maladie">
              <Button variant="ghost" size="sm">
                Voir tout <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-0">
            {filteredFeuilles.flatMap(f =>
              f.remboursements.map(r => ({ ...r, numFeuille: f.numFeuille, nomAssure: f.nomAssure }))
            ).sort((a, b) => {
              const da = a.dateRemboursement ?? a.numFeuille.toString()
              const db = b.dateRemboursement ?? b.numFeuille.toString()
              return db.localeCompare(da)
            }).slice(0, 5).map(r => (
              <div key={`${r.numFeuille}-${r.numRemboursement}`} className="flex items-center gap-3 py-3 border-b border-text-anthracite/5 last:border-0">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  r.statut === 'EFFECTUE' ? 'bg-success-green' : r.statut === 'REJETEE' ? 'bg-alert-red' : 'bg-sable-gold'
                }`} />
                <p className="flex-1 text-sm text-text-anthracite">
                  {r.nature} — {r.nomAssure}
                </p>
                <span className="text-xs text-text-anthracite/40 whitespace-nowrap">
                  {formatCurrency(r.montant)}
                </span>
              </div>
            ))}
            {filteredFeuilles.length === 0 && (
              <p className="text-center py-6 text-sm text-text-anthracite/40">Aucune activité</p>
            )}
          </div>
        </Card>
        <div className="lg:col-span-1">
          <RemboursementStatusChart feuilles={filteredFeuilles} />
        </div>
      </div>
    </div>
  )
}
