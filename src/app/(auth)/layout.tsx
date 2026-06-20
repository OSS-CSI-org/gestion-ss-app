'use client'

import { motion } from 'framer-motion'
import LoginBrandPanel from '@/components/auth/LoginBrandPanel'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <LoginBrandPanel />
      <div className="flex items-center justify-center p-6 md:p-10 bg-bg-offwhite">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
          className="w-full max-w-sm bg-white-pure p-8 border border-text-anthracite/5 shadow-sm"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
