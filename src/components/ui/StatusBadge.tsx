'use client'

interface StatusBadgeProps {
  statut: string
}

export default function StatusBadge({ statut }: StatusBadgeProps) {
  const config: Record<string, { label: string; variant: string }> = {
    EN_ATTENTE: { label: 'En attente', variant: 'border-alert-red/20 text-alert-red bg-alert-red/5' },
    EFFECTUE: { label: 'Effectué', variant: 'border-success-green/20 text-success-green bg-success-green/5' },
    REJETEE: { label: 'Rejeté', variant: 'border-alert-red/30 text-alert-red bg-alert-red/10' },
    REMBOURSEE: { label: 'Remboursée', variant: 'border-sable-gold/30 text-sable-gold bg-sable-gold/10' },
  }

  const { label, variant } = config[statut] || { label: statut, variant: 'border-text-anthracite/20 text-text-anthracite bg-text-anthracite/5' }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium border ${variant}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        statut === 'EFFECTUE' ? 'bg-success-green' :
        statut === 'EN_ATTENTE' ? 'bg-alert-red' :
        'bg-alert-red'
      }`} />
      {label}
    </span>
  )
}
