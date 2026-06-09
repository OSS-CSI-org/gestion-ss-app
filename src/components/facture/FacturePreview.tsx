'use client'

import { useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Printer, X, FileText } from 'lucide-react'
import { Remboursement, FeuilleMaladie } from '@/lib/types'
import { genererFactureHTML, nomFichierFacture } from '@/lib/imprimerFacture'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import Button from '@/components/ui/Button'

interface FacturePreviewProps {
  feuille: FeuilleMaladie
  remboursement: Remboursement
  onClose: () => void
}

export default function FacturePreview({ feuille, remboursement, onClose }: FacturePreviewProps) {
  const ref = useFocusTrap(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const html = useMemo(
    () => genererFactureHTML(feuille, remboursement),
    [feuille, remboursement]
  )

  const numeroFacture = `FACT-${feuille.numFeuille}-${remboursement.numRemboursement}`

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handlePrint = () => {
    const win = iframeRef.current?.contentWindow
    if (!win) return
    // Certains navigateurs déduisent le nom du PDF du titre de l'onglet parent,
    // d'autres du <title> de l'iframe : on couvre les deux puis on restaure.
    const prevTitle = document.title
    document.title = nomFichierFacture(feuille, remboursement)
    const restore = () => { document.title = prevTitle }
    win.focus() // requis pour Safari
    win.print()
    win.addEventListener('afterprint', restore, { once: true })
    setTimeout(restore, 1000)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={`Aperçu de la facture ${numeroFacture}`}
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="bg-white-pure w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-text-anthracite/10">
          <div className="w-9 h-9 border border-prune-main/20 flex items-center justify-center flex-shrink-0">
            <FileText size={16} className="text-prune-main" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-prune-main">Aperçu de la facture</h3>
            <p className="text-xs text-text-anthracite/45 font-mono truncate">{numeroFacture}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-text-anthracite/45 hover:text-alert-red transition-colors"
            aria-label="Fermer l'aperçu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Aperçu — rendu fidèle dans un iframe (= ce qui sera imprimé) */}
        <div className="flex-1 overflow-auto bg-bg-offwhite p-3 sm:p-6">
          <iframe
            ref={iframeRef}
            srcDoc={html}
            title="Aperçu de la facture"
            className="w-full bg-white border border-text-anthracite/10 shadow-sm"
            style={{ height: '60vh', minHeight: 420 }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-text-anthracite/10">
          <Button variant="secondary" onClick={onClose}>Fermer</Button>
          <Button onClick={handlePrint}>
            <Printer size={16} className="mr-1.5" />
            Imprimer
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
