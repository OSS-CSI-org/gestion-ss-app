'use client'

import { useState, createContext, useContext, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 0

const toastVariants = {
  initial: { opacity: 0, x: 80, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } },
  exit: { opacity: 0, x: 80, scale: 0.95, transition: { duration: 0.2 } },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const show = useCallback((message: string, type: ToastType = 'success') => {
    const id = nextId++
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      <div
        className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 max-w-sm"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onRemove={remove} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }: { toast: ToastItem; onRemove: (id: number) => void }) {
  const icon = {
    success: <CheckCircle size={18} className="text-success-green" />,
    error: <AlertTriangle size={18} className="text-alert-red" />,
    info: <Info size={18} className="text-prune-main" />,
  }

  const border = {
    success: 'border-l-success-green',
    error: 'border-l-alert-red',
    info: 'border-l-prune-main',
  }

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`bg-white-pure border border-text-anthracite/10 border-l-4 ${border[toast.type]} shadow-lg px-4 py-3 flex items-start gap-3`}
    >
      <span className="mt-0.5">{icon[toast.type]}</span>
      <p className="text-sm text-text-anthracite flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-text-anthracite/45 hover:text-text-anthracite/60 transition-colors"
        aria-label="Fermer la notification"
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
