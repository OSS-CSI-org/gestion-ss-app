'use client'

import { ReactNode, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Column<T> {
  key: string
  header: string
  render?: (item: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  pageSize?: number
  onRowClick?: (item: T) => void
}

export default function DataTable<T>({ columns, data, pageSize = 10, onRowClick }: DataTableProps<T>) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize))
  const start = (page - 1) * pageSize
  const visible = data.slice(start, start + pageSize)

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-text-anthracite/10">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-anthracite/50 ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((item, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(item)}
                className={`border-b border-text-anthracite/5 hover:bg-prune-main/[0.02] transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-sm text-text-anthracite ${col.className || ''}`}
                  >
                    {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <p className="text-center py-8 text-sm text-text-anthracite/40">
            Aucune donnée
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 px-4 pb-1">
          <span className="text-xs text-text-anthracite/50">
            {data.length} résultat{data.length > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 text-text-anthracite/50 hover:text-prune-main disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`min-w-[28px] h-7 text-xs transition-colors ${
                  p === page
                    ? 'bg-prune-main text-prune-light'
                    : 'text-text-anthracite/50 hover:text-prune-main'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 text-text-anthracite/50 hover:text-prune-main disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
