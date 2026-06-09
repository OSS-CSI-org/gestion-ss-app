'use client'

import { useState, useEffect } from 'react'
import { Remboursement } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import Input from '@/components/ui/Input'
import { HandCoins, Check, ArrowRight, Building, User as UserIcon, X } from 'lucide-react'

interface RemboursementFlowProps {
  remboursement: Remboursement
  patientNom: string
  patientIban?: string
  onComplete: (rembId: number) => void
  onClose: () => void
}

type Step = 'select_mode' | 'virement_input' | 'simulating' | 'success'

const STATUS_LABELS = [
  'Initialisation de la transaction...',
  'Débit du compte émetteur...',
  'Transfert vers le compte bénéficiaire...',
  'Virement effectué avec succès',
]

export default function RemboursementFlow({
  remboursement,
  patientNom,
  patientIban,
  onComplete,
  onClose,
}: RemboursementFlowProps) {
  const [step, setStep] = useState<Step>('select_mode')
  const [mode, setMode] = useState<'VIREMENT' | 'CASH'>('VIREMENT')
  const [simStep, setSimStep] = useState(0)
  const [iban, setIban] = useState(patientIban || '')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step !== 'simulating' && step !== 'success') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step, onClose])

  useEffect(() => {
    if (step !== 'simulating') return
    const t1 = setTimeout(() => setSimStep(1), 900)
    const t2 = setTimeout(() => setSimStep(2), 2000)
    const t3 = setTimeout(() => setSimStep(3), 3200)
    const t4 = setTimeout(() => setStep('success'), 3800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [step])

  const handleValider = () => {
    if (mode === 'CASH') {
      const ok = window.confirm(
        `Êtes-vous sûr de vouloir valider le remboursement de ${formatCurrency(remboursement.montant)} FCFA à ${patientNom} ? Cette action est irréversible, la feuille de maladie sera marquée complétée.`
      )
      if (ok) setStep('success')
    } else {
      setStep('virement_input')
    }
  }

  const handleEffectuerVirement = () => {
    setStep('simulating')
    setSimStep(0)
  }

  const handleCompleter = () => {
    onComplete(remboursement.numRemboursement)
    onClose()
  }

  const progressPct = simStep === 0 ? 5 : (simStep / 3) * 100

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white-pure w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="h-1 w-full bg-gradient-to-r from-prune-main/20 via-prune-main to-prune-main/20 animate-shimmer" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 border border-prune-main/20 flex items-center justify-center">
              <HandCoins size={18} className="text-prune-main" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-prune-main">
                Remboursement n°{remboursement.numRemboursement}
              </h3>
              <p className="text-xs text-text-anthracite/40">{remboursement.nature}</p>
            </div>
            {step !== 'simulating' && step !== 'success' && (
              <button onClick={onClose} className="ml-auto text-text-anthracite/30 hover:text-alert-red transition-colors">
                <X size={18} />
              </button>
            )}
          </div>

          {/* ── Select mode ── */}
          {step === 'select_mode' && (
            <>
              <p className="text-xs font-medium uppercase tracking-wider text-text-anthracite/50 mb-3">
                Mode de paiement
              </p>
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setMode('VIREMENT')}
                  className={`flex-1 border py-3 text-center text-sm transition-colors ${
                    mode === 'VIREMENT'
                      ? 'border-prune-main bg-prune-main/5 text-prune-main font-medium'
                      : 'border-text-anthracite/15 text-text-anthracite/60 hover:border-text-anthracite/30'
                  }`}
                >
                  Virement bancaire
                </button>
                <button
                  onClick={() => setMode('CASH')}
                  className={`flex-1 border py-3 text-center text-sm transition-colors ${
                    mode === 'CASH'
                      ? 'border-prune-main bg-prune-main/5 text-prune-main font-medium'
                      : 'border-text-anthracite/15 text-text-anthracite/60 hover:border-text-anthracite/30'
                  }`}
                >
                  Cash
                </button>
              </div>
              <div className="border border-text-anthracite/5 bg-text-anthracite/[0.02] p-4 mb-6 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-text-anthracite/60">Montant à rembourser</span>
                  <span className="text-lg font-semibold text-prune-main">{formatCurrency(remboursement.montant)}</span>
                </div>
              </div>
              <button
                onClick={handleValider}
                className="w-full bg-prune-main text-prune-light py-2.5 text-sm font-medium hover:bg-prune-sec transition-colors"
              >
                Valider le remboursement
              </button>
            </>
          )}

          {/* ── Virement input ── */}
          {step === 'virement_input' && (
            <>
              <p className="text-xs font-medium uppercase tracking-wider text-text-anthracite/50 mb-3">
                Compte bénéficiaire
              </p>
              <Input
                label="IBAN"
                value={iban}
                onChange={e => setIban(e.target.value)}
                placeholder="FR76XXXXXXXXXXXX"
                className="font-mono text-sm"
              />
              <p className="text-xs text-text-anthracite/40 mb-6 -mt-1">{patientNom}</p>
              <div className="border border-text-anthracite/5 bg-text-anthracite/[0.02] p-4 mb-6 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-text-anthracite/60">Montant du virement</span>
                  <span className="text-lg font-semibold text-prune-main">{formatCurrency(remboursement.montant)}</span>
                </div>
              </div>
              <button
                onClick={handleEffectuerVirement}
                className="w-full bg-prune-main text-prune-light py-2.5 text-sm font-medium hover:bg-prune-sec transition-colors"
              >
                Effectuer le virement
              </button>
            </>
          )}

          {/* ── Simulating — animation bancaire réaliste ── */}
          {step === 'simulating' && (
            <div className="py-2">
              {/* From → To */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 border border-text-anthracite/10 p-3 bg-white-pure">
                  <div className="flex items-center gap-2 mb-1">
                    <Building size={13} className="text-prune-main/60" />
                    <span className="text-[11px] font-semibold text-text-anthracite/50 uppercase tracking-wider">Émetteur</span>
                  </div>
                  <p className="text-sm font-medium text-prune-main">OSS</p>
                  <p className="text-[11px] text-text-anthracite/40 font-mono">OSS-00-0001256</p>
                </div>
                <div className={`flex-shrink-0 transition-all duration-700 ${simStep >= 1 ? 'opacity-100' : 'opacity-40'}`}>
                  <ArrowRight size={20} className="text-success-green animate-pulse" />
                </div>
                <div className={`flex-1 border transition-all duration-500 p-3 ${
                  simStep >= 2 ? 'border-success-green/30 bg-success-green/[0.02]' : 'border-text-anthracite/10 bg-white-pure'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <UserIcon size={13} className="text-prune-sec/60" />
                    <span className="text-[11px] font-semibold text-text-anthracite/50 uppercase tracking-wider">Bénéficiaire</span>
                  </div>
                  <p className="text-sm font-medium text-prune-main">{patientNom}</p>
                  <p className="text-[11px] text-text-anthracite/40 font-mono">{iban ? iban.slice(0, 16) + '…' : '—'}</p>
                </div>
              </div>

              {/* Montant */}
              <div className="text-center mb-5">
                <p className="text-2xl font-bold text-prune-main tracking-tight">
                  {formatCurrency(remboursement.montant)}
                </p>
                <p className="text-xs text-text-anthracite/40 mt-0.5">Transaction en cours</p>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-text-anthracite/8 overflow-hidden mb-3 rounded-full">
                <div
                  className="h-full bg-gradient-to-r from-prune-main to-success-green rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                  style={{ width: `${progressPct}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full ${
                  simStep >= 3 ? 'bg-success-green' : 'bg-prune-main animate-pulse'
                }`} />
                <span className={`transition-colors duration-300 ${
                  simStep >= 3 ? 'text-success-green font-medium' : 'text-text-anthracite/70'
                }`}>
                  {STATUS_LABELS[simStep]}
                </span>
              </div>
            </div>
          )}

          {/* ── Success ── */}
          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-success-green/10 border-2 border-success-green flex items-center justify-center mx-auto mb-4">
                <Check size={24} className="text-success-green" strokeWidth={3} />
              </div>
              <p className="text-base font-semibold text-prune-main mb-1">
                {mode === 'VIREMENT' ? 'Virement effectué' : 'Remboursement effectué'}
              </p>
              <p className="text-sm text-text-anthracite/60 mb-1">
                {formatCurrency(remboursement.montant)} — {patientNom}
              </p>
              <p className="text-xs text-text-anthracite/40 mb-6">
                {mode === 'VIREMENT' ? 'Le virement a été transféré avec succès.' : 'Le remboursement en cash a été validé.'}
              </p>
              <button
                onClick={handleCompleter}
                className="w-full bg-prune-main text-prune-light py-2.5 text-sm font-medium hover:bg-prune-sec transition-colors"
              >
                Compléter la feuille
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
