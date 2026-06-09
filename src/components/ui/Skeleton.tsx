'use client'

interface SkeletonProps {
  variant?: 'text' | 'card' | 'stat' | 'table-row' | 'circle'
  className?: string
}

export default function Skeleton({ variant = 'text', className = '' }: SkeletonProps) {
  const base = 'animate-pulse bg-text-anthracite/8'

  const variants = {
    text: 'h-4 w-full rounded',
    card: 'h-32 w-full',
    stat: 'h-24 w-full',
    'table-row': 'h-10 w-full',
    circle: 'h-10 w-10 rounded-full',
  }

  return <div className={`${base} ${variants[variant]} ${className}`} />
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white-pure border border-text-anthracite/5 p-6 space-y-3">
      <Skeleton variant="text" className="w-1/3" />
      <Skeleton variant="text" className="w-2/3 h-6" />
      <Skeleton variant="text" className="w-1/2" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton variant="text" className="w-full h-8" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="table-row" />
      ))}
    </div>
  )
}
