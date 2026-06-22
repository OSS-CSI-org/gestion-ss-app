'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, animate } from 'framer-motion'
import { Remboursement, ModeReglement } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import Input from '@/components/ui/Input'
import { useConfirm } from '@/hooks/useConfirm'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { HandCoins, Check, ArrowRight, Building, User as UserIcon, X, Loader2, Banknote, Coins } from 'lucide-react'
import Image from 'next/image'

interface RemboursementFlowProps {
  remboursement: Remboursement
  patientNom: string
  patientIban?: string
  onComplete: (rembId: number, mode: ModeReglement) => void
  onClose: () => void
}

type Step = 'select_mode' | 'virement_input' | 'simulating' | 'cash_processing' | 'success'

const STATUS_LABELS = [
  'Initialisation de la transaction',
  'Débit du compte émetteur',
  'Transfert vers le compte bénéficiaire',
  'Virement effectué avec succès',
]

/** Montant qui s'incrémente de 0 jusqu'à sa valeur (count-up). */
function AnimatedAmount({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.1,
      ease: 'easeOut',
      onUpdate: v => setDisplay(v),
    })
    return () => controls.stop()
  }, [value])
  return <span className={className}>{formatCurrency(display)}</span>
}

export default function RemboursementFlow({
  remboursement,
  patientNom,
  patientIban,
  onComplete,
  onClose,
}: RemboursementFlowProps) {
  const { confirm: ask, dialog: confirmDialog } = useConfirm()

  const [step, setStep] = useState<Step>('select_mode')
  const interactive = step === 'select_mode' || step === 'virement_input'
  const ref = useFocusTrap(interactive)
  const [mode, setMode] = useState<'VIREMENT' | 'CASH'>('VIREMENT')
  const [simStep, setSimStep] = useState(0)
  const [iban, setIban] = useState(patientIban || '')
  const [stamping, setStamping] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && interactive) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [interactive, onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Séquence du virement
  useEffect(() => {
    if (step !== 'simulating') return
    const t1 = setTimeout(() => setSimStep(1), 900)
    const t2 = setTimeout(() => setSimStep(2), 2000)
    const t3 = setTimeout(() => setSimStep(3), 3200)
    const t4 = setTimeout(() => setStep('success'), 4000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [step])

  // Micro-étape de validation des espèces
  useEffect(() => {
    if (step !== 'cash_processing') return
    const t = setTimeout(() => setStep('success'), 1200)
    return () => clearTimeout(t)
  }, [step])

  const handleValider = async () => {
    if (mode === 'CASH') {
      const ok = await ask(
        `Êtes-vous sûr de vouloir valider le remboursement de ${formatCurrency(remboursement.montant)} à ${patientNom} ? Cette action est irréversible, la feuille de maladie sera marquée complétée.`
      )
      if (ok) setStep('cash_processing')
    } else {
      setStep('virement_input')
    }
  }

  const handleEffectuerVirement = () => {
    setSimStep(0)
    setStep('simulating')
  }

  const handleCompleter = () => {
    setStamping(true)
    setTimeout(() => {
      onComplete(remboursement.numRemboursement, mode)
      onClose()
    }, 1200)
  }

  const progressPct = simStep === 0 ? 8 : (simStep / 3) * 100

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={interactive ? onClose : undefined}
    >
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Remboursement"
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className="bg-white-pure w-full max-w-md shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
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
              <p className="text-xs text-text-anthracite/60">{remboursement.nature}</p>
            </div>
            {interactive && (
              <button onClick={onClose} className="ml-auto text-text-anthracite/45 hover:text-alert-red transition-colors" aria-label="Fermer">
                <X size={18} />
              </button>
            )}
          </div>

          {/* ── Select mode ── */}
          {step === 'select_mode' && (
            <>
              <p className="text-xs font-medium uppercase tracking-wider text-text-anthracite/60 mb-3">
                Mode de paiement
              </p>
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setMode('VIREMENT')}
                  className={`flex-1 border py-3 flex flex-col items-center gap-1.5 text-sm transition-colors ${
                    mode === 'VIREMENT'
                      ? 'border-prune-main bg-prune-main/5 text-prune-main font-medium'
                      : 'border-text-anthracite/15 text-text-anthracite/60 hover:border-text-anthracite/30'
                  }`}
                >
                  <Building size={18} />
                  Virement bancaire
                </button>
                <button
                  onClick={() => setMode('CASH')}
                  className={`flex-1 border py-3 flex flex-col items-center gap-1.5 text-sm transition-colors ${
                    mode === 'CASH'
                      ? 'border-prune-main bg-prune-main/5 text-prune-main font-medium'
                      : 'border-text-anthracite/15 text-text-anthracite/60 hover:border-text-anthracite/30'
                  }`}
                >
                  <Banknote size={18} />
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
              <p className="text-xs font-medium uppercase tracking-wider text-text-anthracite/60 mb-3">
                Compte bénéficiaire
              </p>
              <Input
                label="IBAN"
                value={iban}
                onChange={e => setIban(e.target.value)}
                placeholder="FR76XXXXXXXXXXXX"
                className="font-mono text-sm"
              />
              <p className="text-sm font-medium text-prune-main mb-6 -mt-1">{patientNom}</p>
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

          {/* ── Simulating — virement ── */}
          {step === 'simulating' && (
            <div className="py-1">
              {/* From → To avec paquet en transit */}
              <div className="relative flex items-stretch gap-3 mb-6">
                <div className="flex-1 border border-text-anthracite/10 p-3 bg-white-pure">
                  <div className="flex items-center gap-2 mb-1">
                    <Building size={13} className="text-prune-main/60" />
                    <span className="text-[11px] font-semibold text-text-anthracite/60 uppercase tracking-wider">Émetteur</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Image
                      src="/logo_oss-rbg.png"
                      alt="OSS"
                      width={18}
                      height={18}
                      className="object-contain"
                    />
                    <span className="text-sm font-medium text-prune-main">OSS</span>
                  </div>
                  <p className="text-[11px] text-text-anthracite/60 font-mono">OSS-00-0001256</p>
                </div>

                <div className="relative flex-shrink-0 w-10 flex items-center justify-center">
                  <ArrowRight size={18} className={`transition-colors duration-500 ${simStep >= 1 ? 'text-success-green' : 'text-text-anthracite/30'}`} />
                  {/* Paquet (pièce) qui voyage */}
                  {simStep >= 1 && simStep < 3 && (
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2"
                      initial={{ left: '-14%', opacity: 0, scale: 0.6 }}
                      animate={{ left: ['-14%', '114%'], opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.6] }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sable-gold shadow-md">
                        <Coins size={11} className="text-white" />
                      </span>
                    </motion.div>
                  )}
                </div>

                <div className={`flex-1 border transition-all duration-500 p-3 ${
                  simStep >= 2 ? 'border-success-green/30 bg-success-green/[0.02]' : 'border-text-anthracite/10 bg-white-pure'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <UserIcon size={13} className="text-prune-sec/60" />
                    <span className="text-[11px] font-semibold text-text-anthracite/60 uppercase tracking-wider">Bénéficiaire</span>
                  </div>
                  <p className="text-sm font-medium text-prune-main">{patientNom}</p>
                  <p className="text-[11px] text-text-anthracite/60 font-mono">{iban ? iban.slice(0, 16) + '…' : '—'}</p>
                </div>
              </div>

              {/* Montant (count-up) */}
              <div className="text-center mb-4">
                <AnimatedAmount value={remboursement.montant} className="text-2xl font-bold text-prune-main tracking-tight" />
                <p className="text-xs text-text-anthracite/60 mt-0.5">Transaction sécurisée en cours</p>
              </div>

              {/* Progress bar + % */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-2 flex-1 bg-text-anthracite/8 overflow-hidden rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-prune-main to-success-green rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                    style={{ width: `${progressPct}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
                <span className="text-xs font-mono font-medium text-prune-main w-9 text-right tabular-nums">
                  {Math.round(progressPct)}%
                </span>
              </div>

              {/* Checklist animée */}
              <div className="space-y-1.5">
                {STATUS_LABELS.map((label, i) => {
                  const done = i === 3 ? simStep >= 3 : simStep > i
                  const active = i < 3 && simStep === i
                  return (
                    <div key={i} className="flex items-center gap-2.5 text-sm">
                      <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                        {done ? (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                            className="w-4 h-4 rounded-full bg-success-green flex items-center justify-center"
                          >
                            <Check size={11} className="text-white" strokeWidth={3} />
                          </motion.span>
                        ) : active ? (
                          <Loader2 size={14} className="text-prune-main animate-spin" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-text-anthracite/20" />
                        )}
                      </span>
                      <span className={`transition-colors duration-300 ${
                        done ? 'text-success-green font-medium' : active ? 'text-text-anthracite' : 'text-text-anthracite/45'
                      }`}>
                        {label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Cash processing — micro-étape ── */}
          {step === 'cash_processing' && (
            <div className="py-6 text-center">
              <motion.div
                animate={{ rotate: [0, -8, 8, -8, 0], y: [0, -3, 0, -3, 0] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                className="w-14 h-14 border border-sable-gold/40 bg-sable-gold/10 flex items-center justify-center mx-auto mb-4"
              >
                <Banknote size={24} className="text-sable-gold" />
              </motion.div>
              <AnimatedAmount value={remboursement.montant} className="text-2xl font-bold text-prune-main tracking-tight" />
              <p className="text-sm text-text-anthracite/70 mt-2 flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin text-prune-main" />
                Validation du paiement en espèces…
              </p>
            </div>
          )}

          {/* ── Success + complétion ── */}
          {step === 'success' && (
            <div className="text-center py-6 relative">
              {/* Tampon « COMPLÉTÉE » à la finalisation */}
              <AnimatePresence>
                {stamping && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                    <span className="absolute w-20 h-20 rounded-full border-4 border-success-green animate-ring-expand" />
                    <span className="absolute w-20 h-20 rounded-full border-4 border-success-green animate-ring-expand" style={{ animationDelay: '0.18s' }} />
                    <div className="absolute left-1/2 top-1/2 animate-stamp-slam">
                      <div className="px-5 py-2 border-[3px] border-success-green text-success-green font-bold uppercase tracking-[0.2em] text-sm bg-white-pure/80">
                        Complétée
                      </div>
                    </div>
                  </div>
                )}
              </AnimatePresence>

              <div className={`transition-all duration-300 ${stamping ? 'scale-95 opacity-20 blur-[2px]' : ''}`}>
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                  className="w-14 h-14 bg-success-green/10 border-2 border-success-green flex items-center justify-center mx-auto mb-4"
                >
                  <Check size={24} className="text-success-green" strokeWidth={3} />
                </motion.div>
                <p className="text-base font-semibold text-prune-main mb-1">
                  {mode === 'VIREMENT' ? 'Virement effectué' : 'Remboursement effectué'}
                </p>
                <p className="text-sm text-text-anthracite/60 mb-1">
                  {formatCurrency(remboursement.montant)} — {patientNom}
                </p>
                <p className="text-xs text-text-anthracite/60 mb-6">
                  {mode === 'VIREMENT' ? 'Le virement a été transféré avec succès.' : 'Le remboursement en espèces a été validé.'}
                </p>
                <button
                  onClick={handleCompleter}
                  disabled={stamping}
                  className="w-full bg-prune-main text-prune-light py-2.5 text-sm font-medium hover:bg-prune-sec transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {stamping ? 'Finalisation…' : 'Compléter la feuille'}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      {confirmDialog}
    </div>
  )
}
