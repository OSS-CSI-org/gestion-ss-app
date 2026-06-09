import { TableSkeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse h-8 w-48 bg-text-anthracite/8 rounded" />
      <div className="animate-pulse h-4 w-72 bg-text-anthracite/8 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse h-24 bg-text-anthracite/8" />
        ))}
      </div>
      <TableSkeleton rows={6} />
    </div>
  )
}
