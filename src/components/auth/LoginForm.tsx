'use client'

import { useState, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, Info } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { loginSchema, type LoginFormData } from '@/lib/schemas'

function safeRedirect(path: string | null): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return '/'
  return path
}

function LoginFormInner() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectTo = safeRedirect(searchParams.get('redirect'))
  const sessionExpired = searchParams.get('reason') === 'session_expired'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setError('')
    const result = await login(data.login, data.motDePasse)
    if (result.success) {
      router.push(redirectTo)
    } else {
      setError(result.message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="text-center mb-2 lg:hidden">
        <div className="mb-4 inline-flex items-center justify-center">
          <Image
            src="/logo_oss-rbg.png"
            alt="OSS"
            width={100}
            height={100}
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-lg font-semibold text-prune-main">Connexion</h1>
      </div>

      <h1 className="hidden lg:block text-xl font-semibold text-prune-main mb-1">Connexion</h1>

      {sessionExpired && (
        <div
          role="status"
          className="flex items-start gap-2 text-xs text-text-anthracite bg-sable-gold/10 border border-sable-gold/25 px-3 py-2.5"
        >
          <Info size={14} className="text-sable-gold shrink-0 mt-0.5" />
          <span>Votre session a expiré. Veuillez vous reconnecter.</span>
        </div>
      )}

      <Input
        label="Identifiant"
        type="text"
        autoComplete="username"
        autoFocus
        placeholder="login"
        error={errors.login?.message}
        required
        {...register('login')}
      />

      <Input
        label="Mot de passe"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        {...register('motDePasse')}
        placeholder="Mot de passe"
        error={errors.motDePasse?.message}
        required
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-text-anthracite/60 hover:text-prune-main transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />

      {error && (
        <p role="alert" aria-live="polite" className="text-xs text-alert-red text-center">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" loading={isSubmitting} disabled={isSubmitting}>
        Se connecter
      </Button>
    </form>
  )
}

export default function LoginForm() {
  return (
    <Suspense fallback={null}>
      <LoginFormInner />
    </Suspense>
  )
}
