'use client'

import { useState, FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginForm() {
  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const success = login(loginValue, password)
    if (success) {
      router.push('/')
    } else {
      setError('Identifiant ou mot de passe incorrect')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="text-center mb-2">
        <div className="inline-flex items-center justify-center w-14 h-14 border border-sable-gold/40 mb-4">
          <span className="text-2xl font-bold text-prune-main">OSS</span>
        </div>
        <h1 className="text-lg font-semibold text-prune-main">Connexion</h1>
      </div>

      <Input
        label="Identifiant"
        type="text"
        value={loginValue}
        onChange={e => setLoginValue(e.target.value)}
        placeholder="admin, drmbarga, drndongo"
        required
      />

      <Input
        label="Mot de passe"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="••••••••"
        required
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-text-anthracite/40 hover:text-prune-main transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      {error && (
        <p className="text-xs text-alert-red text-center">{error}</p>
      )}

      <Button type="submit" className="w-full">
        Se connecter
      </Button>

      <p className="text-xs text-text-anthracite/40 text-center">
        Identifiants de démo : admin / drmbarga / drndongo
      </p>
    </form>
  )
}
