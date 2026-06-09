'use client'

import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { AlertTriangle } from 'lucide-react'

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-bg-offwhite flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <div className="w-14 h-14 border-2 border-alert-red/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-alert-red" />
        </div>
        <h1 className="text-lg font-semibold text-prune-main mb-2">Une erreur est survenue</h1>
        <p className="text-sm text-text-anthracite/60 mb-6">{error.message || 'Erreur inattendue'}</p>
        <Button onClick={reset}>Réessayer</Button>
      </Card>
    </div>
  )
}
