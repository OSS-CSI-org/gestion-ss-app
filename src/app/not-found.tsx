import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { FileQuestion } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg-offwhite flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <div className="w-14 h-14 border-2 border-text-anthracite/10 flex items-center justify-center mx-auto mb-4 text-text-anthracite/20">
          <FileQuestion size={28} />
        </div>
        <h1 className="text-lg font-semibold text-prune-main mb-2">Page introuvable</h1>
        <p className="text-sm text-text-anthracite/60 mb-6">La page que vous cherchez n&apos;existe pas.</p>
        <Link href="/"><Button>Accueil</Button></Link>
      </Card>
    </div>
  )
}
