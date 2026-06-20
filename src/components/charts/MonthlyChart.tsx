'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import { useCSSVar } from '@/hooks/useCSSVar'
import { formatMontant } from '@/lib/utils'
import type { FeuilleMaladie } from '@/lib/types'

const monthLabels: Record<string, string> = {
  '2026-02': 'Fév',
  '2026-03': 'Mar',
  '2026-04': 'Avr',
  '2026-05': 'Mai',
  '2026-06': 'Juin',
  '2026-07': 'Juil',
  '2026-08': 'Août',
  '2026-09': 'Sep',
  '2026-10': 'Oct',
  '2026-11': 'Nov',
  '2026-12': 'Déc',
}

function toMonthKey(dateEmission: FeuilleMaladie['dateEmission'] | unknown): string | null {
  if (typeof dateEmission === 'string') {
    return dateEmission.length >= 7 ? dateEmission.slice(0, 7) : null
  }
  if (Array.isArray(dateEmission) && dateEmission.length >= 2) {
    const [year, month] = dateEmission
    return `${year}-${String(month).padStart(2, '0')}`
  }
  return null
}

/** Remplit les mois manquants entre le premier et le dernier (courbe Recharts lisible). */
function fillMonthRange(entries: Map<string, number>): Array<[string, number]> {
  const keys = [...entries.keys()].sort((a, b) => a.localeCompare(b))
  if (keys.length === 0) return []

  const parse = (key: string) => {
    const [y, m] = key.split('-').map(Number)
    return { y, m }
  }

  const start = parse(keys[0])
  const end = parse(keys[keys.length - 1])
  const result: Array<[string, number]> = []
  let y = start.y
  let m = start.m

  while (y < end.y || (y === end.y && m <= end.m)) {
    const key = `${y}-${String(m).padStart(2, '0')}`
    result.push([key, entries.get(key) ?? 0])
    m += 1
    if (m > 12) {
      m = 1
      y += 1
    }
  }

  return result
}

export default function MonthlyChart({ feuilles }: { feuilles: FeuilleMaladie[] }) {
  const textColor = useCSSVar('--color-text-anthracite', '#3A3A3A')
  const bgColor = useCSSVar('--color-white-pure', '#FFFFFF')

  const data = useMemo(() => {
    const monthly = new Map<string, number>()

    for (const f of feuilles) {
      const rembs = f.remboursements ?? []
      if (rembs.length === 0) continue
      const monthKey = toMonthKey(f.dateEmission)
      if (!monthKey) continue
      const total = rembs.reduce((sum, r) => sum + Number(r.montant ?? 0), 0)
      monthly.set(monthKey, (monthly.get(monthKey) ?? 0) + total)
    }

    return fillMonthRange(monthly).map(([key, value]) => ({
      month: monthLabels[key] ?? key,
      montant: value,
    }))
  }, [feuilles])

  return (
    <Card>
      <h3 className="text-sm font-semibold text-prune-main uppercase tracking-wider mb-4">
        Évolution mensuelle des remboursements
      </h3>
      {data.length === 0 ? (
        <EmptyState
          title="Aucune donnée de remboursement"
          description="Les feuilles chargées depuis l'API n'ont pas encore de remboursements associés."
        />
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={textColor} strokeOpacity={0.08} />
              <XAxis
                dataKey="month"
                tick={{
                  fontSize: 12,
                  fill: textColor,
                  fillOpacity: 0.5,
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{
                  fontSize: 12,
                  fill: textColor,
                  fillOpacity: 0.5,
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatMontant}
              />
              <Tooltip
                formatter={(value) => [formatMontant(Number(value)), 'Montant']}
                labelFormatter={(label) => `Mois : ${label}`}
                contentStyle={{
                  backgroundColor: bgColor,
                  border: `1px solid ${textColor}1A`,
                  borderRadius: 0,
                  fontSize: 13,
                }}
              />
              <Area
                type="monotone"
                dataKey="montant"
                stroke="#7A5080"
                strokeWidth={2}
                fill="#7A5080"
                fillOpacity={0.15}
                dot={{ fill: '#4A2C52', strokeWidth: 0, r: 4 }}
                activeDot={{ fill: '#4A2C52', strokeWidth: 0, r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
