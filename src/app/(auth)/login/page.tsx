'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/')
    }
  }, [loading, isAuthenticated, router])

  if (loading || isAuthenticated) {
    return (
      <div className="flex justify-center py-16" aria-busy="true" aria-label="Chargement">
        <Loader2 size={28} className="animate-spin text-prune-main" />
      </div>
    )
  }

  return <LoginForm />
}
