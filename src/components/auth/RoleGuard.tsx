'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Role } from '@/lib/types'

export default function RoleGuard({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (user?.role !== role) {
      router.push('/')
    }
  }, [isAuthenticated, user, role, router])

  if (!isAuthenticated || user?.role !== role) return null

  return <>{children}</>
}
