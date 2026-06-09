'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Stethoscope, FileText, LogOut, User
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { medecins } from '@/data/mock'

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

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside className="fixed top-0 left-0 w-60 h-full bg-prune-main flex flex-col z-50">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border border-sable-gold/50 flex items-center justify-center">
            <span className="text-sm font-bold text-sable-gold">OSS</span>
          </div>
          <div>
            <p className="text-sm font-medium text-prune-light">OSS</p>
            <p className="text-[10px] text-prune-light/50 uppercase tracking-wider">Gestion</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4">
        {(user?.role === 'MEDECIN' ? medecinNav : agentNav).map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
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
            href={`/medecins/${medecins.find(m => m.login === user.login)?.numMedecin}`}
            className="flex items-center gap-3 px-2 py-2 hover:bg-white/5 transition-colors rounded"
          >
            <div className="w-8 h-8 rounded-full bg-prune-sec/30 flex items-center justify-center">
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
            <div className="w-8 h-8 rounded-full bg-prune-sec/30 flex items-center justify-center">
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
}
