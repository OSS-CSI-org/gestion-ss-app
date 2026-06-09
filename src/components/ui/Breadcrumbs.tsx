'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Crumb {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: Crumb[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs mb-4 overflow-x-auto">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={item.label} className="flex items-center gap-1.5 whitespace-nowrap">
            {i > 0 && <ChevronRight size={12} className="text-text-anthracite/20" />}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-text-anthracite/60 hover:text-prune-main transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-prune-main font-medium' : 'text-text-anthracite/60'}>
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
