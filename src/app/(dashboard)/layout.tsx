'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import { ToastProvider } from '@/components/ui/Toast'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const params = new URLSearchParams()
      if (pathname && pathname !== '/') {
        params.set('redirect', pathname)
      }
      const query = params.toString()
      router.push(query ? `/login?${query}` : '/login')
    }
  }, [loading, isAuthenticated, router, pathname])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (loading || !isAuthenticated) return null

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 ml-0 md:ml-60 p-4 md:p-8 pt-16 md:pt-8 min-w-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden fixed top-4 left-4 z-30 w-10 h-10 flex items-center justify-center bg-white-pure border border-text-anthracite/10 shadow-sm hover:bg-bg-offwhite transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu size={18} className="text-text-anthracite" />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </ToastProvider>
  )
}
