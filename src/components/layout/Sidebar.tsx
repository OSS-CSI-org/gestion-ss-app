'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Stethoscope, FileText, LogOut, User, X
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import ThemeToggle from '@/components/ui/ThemeToggle'

const agentNav = [
  { href: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/assures', label: 'Assurés', icon: Users },
  { href: '/medecins', label: 'Médecins', icon: Stethoscope },
  { href: '/feuilles-maladie', label: 'Remboursements', icon: FileText },
]

const medecinNav = [
  { href: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/feuilles-maladie', label: 'Mes feuilles', icon: FileText },
  { href: '/assures', label: 'Mes patients', icon: Users },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const nav = user?.role === 'MEDECIN' ? medecinNav : agentNav
  const drawerRef = useFocusTrap(open)

  const sidebar = (
    <aside className="h-full bg-prune-main flex flex-col">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center">
            <Image
              src="/logo_blanc.png"
              alt="OSS"
              width={56}
              height={56}
              className="object-contain"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-prune-light">OSS</p>
            <p className="text-[10px] text-prune-light/50 uppercase tracking-wider">Gestion</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden text-prune-light/50 hover:text-prune-light transition-colors"
          aria-label="Fermer le menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {nav.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors relative ${
                isActive
                  ? 'text-prune-light bg-white/5'
                  : 'text-prune-light/60 hover:text-prune-light hover:bg-white/5'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-0 w-0.5 h-full bg-sable-gold" />
              )}
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        {user?.role === 'MEDECIN' ? (
          <Link
            href={`/medecins/${user.numMedecin}`}
            onClick={onClose}
            className="flex items-center gap-3 px-2 py-2 hover:bg-white/5 transition-colors rounded"
          >
            <div className="w-8 h-8 rounded-full bg-prune-sec/30 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-prune-light/70" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-prune-light truncate">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-[10px] text-prune-light/50 uppercase tracking-wider">Médecin</p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-prune-sec/30 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-prune-light/70" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-prune-light truncate">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-[10px] text-prune-light/50 uppercase tracking-wider">Agent OSS</p>
            </div>
          </div>
        )}
        <ThemeToggle />
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full mt-1 px-2 py-2 text-xs text-prune-light/50 hover:text-prune-light hover:bg-white/5 transition-colors"
        >
          <LogOut size={14} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop — always visible */}
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:w-60 md:flex md:flex-col md:z-50">
        {sidebar}
      </div>

      {/* Mobile — overlay drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.div
              ref={drawerRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-60 md:hidden"
            >
              {sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
