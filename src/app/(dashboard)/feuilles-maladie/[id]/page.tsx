'use client'

import { useState, use } from 'react'
import { Remboursement, ModeReglement } from '@/lib/types'
import { useFeuille } from '@/hooks/data/useFeuilles'
import { useAssure } from '@/hooks/data/useAssures'
import { effectuerRemboursement } from '@/lib/services/remboursements'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import StatusBadge from '@/components/ui/StatusBadge'
import DataTable from '@/components/ui/DataTable'
import RemboursementFlow from '@/components/remboursements/RemboursementFlow'
import FacturePreview from '@/components/facture/FacturePreview'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { ArrowLeft, Printer, Calendar, Stethoscope, User, Crosshair, Heart, Weight, Ruler, Thermometer, Wind, Activity, HandCoins, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatDateShort, formatTaux } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

export default function FeuilleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const toast = useToast()
  const { feuille, isLoading, mutate } = useFeuille(Number(id))
  const { assure } = useAssure(feuille?.numAssure ?? NaN)
  const [modalRemb, setModalRemb] = useState<number | null>(null)
  const [factureRemb, setFactureRemb] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    )
  }

  if (!feuille) {
    return (
      <div>
        <Card>
          <p className="text-text-anthracite/60 text-center py-8">Feuille introuvable</p>
        </Card>
      </div>
    )
  }

  const handleRemboursementComplete = async (numRemb: number, mode: ModeReglement) => {
    setModalRemb(null)
    try {
      await effectuerRemboursement(numRemb, mode)
      await mutate()
    } catch {
      toast.show('Le remboursement a échoué', 'error')
    }
  }

  const rembColumns = [
    {
      key: 'nature',
      header: 'Nature',
      render: (r: Remboursement) => <span className="text-sm font-medium text-prune-main">{r.nature}</span>,
    },
    {
      key: 'taux',
      header: 'Taux',
      render: (r: Remboursement) => (
        <Badge variant={r.taux >= 1 ? 'success' : 'gold'}>{formatTaux(r.taux)}</Badge>
      ),
    },
    {
      key: 'montant',
      header: 'Montant',
      render: (r: Remboursement) => <span className="font-medium">{formatCurrency(r.montant)}</span>,
    },
    {
      key: 'modeReglement',
      header: 'Mode',
      render: (r: Remboursement) => (
        <span className="text-sm text-text-anthracite/60">
          {r.statut === 'EFFECTUE'
            ? (r.modeReglement === 'VIREMENT' ? 'Virement' : 'Cash')
            : <span className="text-text-anthracite/45">—</span>}
        </span>
      ),
    },
    {
      key: 'dateRemboursement',
      header: 'Date',
      render: (r: Remboursement) => (
        <span className="text-sm text-text-anthracite/60">
          {r.dateRemboursement ? formatDateShort(r.dateRemboursement) : '—'}
        </span>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      render: (r: Remboursement) => <StatusBadge statut={r.statut} />,
    },
    {
      key: 'actions',
      header: '',
      render: (r: Remboursement) => (
        <div className="flex gap-1 items-center">
          {r.statut === 'EN_ATTENTE' && user?.role === 'AGENT_OSS' && (
            <button
              onClick={() => setModalRemb(r.numRemboursement)}
              className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium border border-prune-main/30 text-prune-main hover:bg-prune-main/5 transition-colors"
            >
              <HandCoins size={13} />
              Rembourser
            </button>
          )}
          {r.statut === 'EFFECTUE' && user?.role === 'AGENT_OSS' && (
            <button
              onClick={() => setFactureRemb(r.numRemboursement)}
              className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium border border-prune-sec/30 text-prune-sec hover:bg-prune-sec/5 transition-colors"
              title="Voir la facture"
            >
              <Printer size={13} />
              Facture
            </button>
          )}
        </div>
      ),
    },
  ]

  const statutGlobal = feuille.remboursements.every(r => r.statut === 'EFFECTUE')
    ? 'REMBOURSEE' : 'EN_ATTENTE'

  return (
    <div>

        <div className="flex flex-col md:flex-row items-start gap-3 md:gap-0 justify-between mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-3xl font-semibold text-prune-main">Feuille n°{feuille.numFeuille}</h1>
            <StatusBadge statut={statutGlobal} />
          </div>
          <p className="text-sm text-text-anthracite/60">
            Émise le {formatDateShort(feuille.dateEmission)}
          </p>
        </div>
        <Badge variant={statutGlobal === 'REMBOURSEE' ? 'success' : 'prune'}>
          {statutGlobal === 'REMBOURSEE' ? 'Remboursement effectué' : 'Suivi remboursement'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-anthracite/60 mb-4">Consultation</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-text-anthracite/45" />
              <span className="text-text-anthracite/60 w-24">Date</span>
              <span className="font-medium text-prune-main">{formatDateShort(feuille.dateConsultation)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Crosshair size={14} className="text-text-anthracite/45" />
              <span className="text-text-anthracite/60 w-24">Motif</span>
              <span className="font-medium">{feuille.motif}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-anthracite/60 mb-4">Intervenants</h2>
          <div className="space-y-3 text-sm">
            <Link href={`/assures/${feuille.numAssure}`} className="flex items-center gap-2 hover:text-prune-main transition-colors group">
              <User size={14} className="text-text-anthracite/45 group-hover:text-prune-main" />
              <span className="text-text-anthracite/60 w-24">Patient</span>
              <span className="font-medium text-prune-main">{feuille.nomAssure}</span>
            </Link>
            <div className="flex items-center gap-2">
              <Stethoscope size={14} className="text-text-anthracite/45" />
              <span className="text-text-anthracite/60 w-24">Médecin</span>
              <span className="font-medium text-prune-sec">{feuille.nomMedecin}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Paramètres médicaux (caché à l'agent OSS) ── */}
      {user?.role === 'MEDECIN' && feuille.parametresMedicaux && (
        <Card className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-anthracite/60 mb-4">
            Paramètres médicaux
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
            {feuille.parametresMedicaux.poids && (
              <div>
                <div className="flex items-center gap-1 text-xs text-text-anthracite/60 uppercase tracking-wider mb-1"><Weight size={12} /> Poids</div>
                <p className="font-medium">{feuille.parametresMedicaux.poids} kg</p>
              </div>
            )}
            {feuille.parametresMedicaux.taille && (
              <div>
                <div className="flex items-center gap-1 text-xs text-text-anthracite/60 uppercase tracking-wider mb-1"><Ruler size={12} /> Taille</div>
                <p className="font-medium">{feuille.parametresMedicaux.taille} m</p>
              </div>
            )}
            {feuille.parametresMedicaux.temperature && (
              <div>
                <div className="flex items-center gap-1 text-xs text-text-anthracite/60 uppercase tracking-wider mb-1"><Thermometer size={12} /> Temp.</div>
                <p className="font-medium">{feuille.parametresMedicaux.temperature} °C</p>
              </div>
            )}
            {feuille.parametresMedicaux.tensionArterielle && (
              <div>
                <div className="flex items-center gap-1 text-xs text-text-anthracite/60 uppercase tracking-wider mb-1"><Heart size={12} /> Tension</div>
                <p className="font-medium">{feuille.parametresMedicaux.tensionArterielle}</p>
              </div>
            )}
            {feuille.parametresMedicaux.frequenceCardiaque && (
              <div>
                <div className="flex items-center gap-1 text-xs text-text-anthracite/60 uppercase tracking-wider mb-1"><Activity size={12} /> FC</div>
                <p className="font-medium">{feuille.parametresMedicaux.frequenceCardiaque} bpm</p>
              </div>
            )}
            {feuille.parametresMedicaux.frequenceRespiratoire && (
              <div>
                <div className="flex items-center gap-1 text-xs text-text-anthracite/60 uppercase tracking-wider mb-1"><Wind size={12} /> FR</div>
                <p className="font-medium">{feuille.parametresMedicaux.frequenceRespiratoire}</p>
              </div>
            )}
            {feuille.parametresMedicaux.saturationOxygene && (
              <div>
                <div className="flex items-center gap-1 text-xs text-text-anthracite/60 uppercase tracking-wider mb-1"><Wind size={12} /> SpO₂</div>
                <p className="font-medium">{feuille.parametresMedicaux.saturationOxygene} %</p>
              </div>
            )}
          </div>
          {feuille.parametresMedicaux.antecedents && (
            <div className="border-t border-text-anthracite/5 pt-3">
              <p className="text-xs text-text-anthracite/60 uppercase tracking-wider mb-1">Antécédents</p>
              <p className="text-sm">{feuille.parametresMedicaux.antecedents}</p>
            </div>
          )}
        </Card>
      )}

      {/* ── Diagnostic & Traitement (caché à l'agent OSS) ── */}
      {user?.role === 'MEDECIN' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {feuille.symptomes && (
            <Card>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-anthracite/60 mb-3">Symptômes</h2>
              <p className="text-sm">{feuille.symptomes}</p>
            </Card>
          )}
          <Card>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-anthracite/60 mb-3">Diagnostic</h2>
            <p className="text-sm">{feuille.diagnostic}</p>
          </Card>
          {feuille.traitementPrescrit && (
            <Card>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-anthracite/60 mb-3">Traitement prescrit</h2>
              <p className="text-sm">{feuille.traitementPrescrit}</p>
            </Card>
          )}
          {feuille.parametresMedicaux?.observations && (
            <Card>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-anthracite/60 mb-3">Observations</h2>
              <p className="text-sm">{feuille.parametresMedicaux.observations}</p>
            </Card>
          )}
        </div>
      )}

      {user?.role === 'MEDECIN' && feuille.prescriptions.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-anthracite/60 mb-4">
            Prescriptions ({feuille.prescriptions.length})
          </h2>
          <div className="space-y-3">
            {feuille.prescriptions.map(p => (
              <div key={p.numPrescription} className="border border-text-anthracite/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={p.type === 'MEDICAMENT' ? 'prune' : 'gold'}>
                    {p.type === 'MEDICAMENT' ? 'Médicament' : 'Consultation spécialiste'}
                  </Badge>
                </div>
                {p.type === 'MEDICAMENT' ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-sm">
                    <div>
                      <p className="text-xs text-text-anthracite/60 uppercase tracking-wider mb-1">Médicament</p>
                      <p className="font-medium text-prune-main">{p.nomMedicament}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-anthracite/60 uppercase tracking-wider mb-1">Dosage</p>
                      <p className="font-medium">{p.dosage}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-anthracite/60 uppercase tracking-wider mb-1">Posologie</p>
                      <p className="font-medium">{p.posologie}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-anthracite/60 uppercase tracking-wider mb-1">Durée</p>
                      <p className="font-medium">{p.duree}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm">
                    <div>
                      <p className="text-xs text-text-anthracite/60 uppercase tracking-wider mb-1">Spécialiste</p>
                      <p className="font-medium text-prune-sec">{p.nomSpecialiste}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-anthracite/60 uppercase tracking-wider mb-1">Motif</p>
                      <p className="font-medium">{p.motifMedical}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-anthracite/60">
            Remboursements ({feuille.remboursements.length})
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-text-anthracite/60">
              Total : <span className="font-semibold text-prune-main">{formatCurrency(feuille.remboursements.reduce((s, r) => s + r.montant, 0))}</span>
            </span>
          </div>
        </div>
        <DataTable columns={rembColumns} data={feuille.remboursements} />
        {statutGlobal === 'REMBOURSEE' && (
          <div className="mt-4 pt-4 border-t border-text-anthracite/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-success-green" />
              <span className="text-sm text-success-green font-medium">Tous les remboursements ont été effectués</span>
            </div>
            <Button onClick={() => router.push('/feuilles-maladie')}>
              Retour aux feuilles
            </Button>
          </div>
        )}
      </Card>

      {modalRemb !== null && (() => {
        const remb = feuille.remboursements.find(r => r.numRemboursement === modalRemb)
        if (!remb) return null
        return (
          <RemboursementFlow
            remboursement={remb}
            patientNom={feuille.nomAssure}
            patientIban={assure?.numCompteBancaire}
            onComplete={handleRemboursementComplete}
            onClose={() => setModalRemb(null)}
          />
        )
      })()}

      {factureRemb !== null && (() => {
        const remb = feuille.remboursements.find(r => r.numRemboursement === factureRemb)
        if (!remb) return null
        return (
          <FacturePreview
            feuille={feuille}
            remboursement={remb}
            onClose={() => setFactureRemb(null)}
          />
        )
      })()}
    </div>
  )
}
