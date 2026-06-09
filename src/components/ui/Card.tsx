'use client'

import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white-pure border border-text-anthracite/5 p-6 ${className}`}>
      {children}
    </div>
  )
}
