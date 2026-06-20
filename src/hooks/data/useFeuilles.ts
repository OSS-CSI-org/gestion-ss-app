'use client'

import useSWR from 'swr'
import { listFeuilles, getFeuille } from '@/lib/services/feuilles'
import { USE_MOCK } from '@/lib/api/config'
import { useAuth } from '@/hooks/useAuth'

export function useFeuilles() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const ready = USE_MOCK || (isAuthenticated && !authLoading)

  const { data, error, isLoading, mutate } = useSWR(
    ready ? 'feuilles' : null,
    listFeuilles,
  )

  return {
    feuilles: data ?? [],
    error,
    isLoading: authLoading || isLoading,
    mutate,
  }
}

export function useFeuille(id: number) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const ready = USE_MOCK || (isAuthenticated && !authLoading)

  const { data, error, isLoading, mutate } = useSWR(
    ready && Number.isFinite(id) ? ['feuille', id] : null,
    () => getFeuille(id),
  )

  return {
    feuille: data ?? null,
    error,
    isLoading: authLoading || isLoading,
    mutate,
  }
}
