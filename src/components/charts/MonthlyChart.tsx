'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Card from '@/components/ui/Card'
import { useCSSVar } from '@/hooks/useCSSVar'
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

export default function MonthlyChart({ feuilles }: { feuilles: FeuilleMaladie[] }) {
  const textColor = useCSSVar('--color-text-anthracite', '#3A3A3A')
  const bgColor = useCSSVar('--color-white-pure', '#FFFFFF')

  const data = useMemo(() => {
    const monthly = new Map<string, number>()

    for (const f of feuilles) {
      if (f.remboursements.length === 0) continue
      const monthKey = f.dateEmission.slice(0, 7)
      const total = f.remboursements.reduce((sum, r) => sum + r.montant, 0)
      monthly.set(monthKey, (monthly.get(monthKey) ?? 0) + total)
    }

    return Array.from(monthly.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({
        month: monthLabels[key] ?? key,
        montant: value,
      }))
  }, [feuilles])

  const formatEuro = (v: number) => `${v.toLocaleString('fr-FR')} FCFA`

  return (
    <Card>
      <h3 className="text-sm font-semibold text-prune-main uppercase tracking-wider mb-4">
        Évolution mensuelle des remboursements
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={textColor} strokeOpacity={0.08} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: textColor, fillOpacity: 0.5 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: textColor, fillOpacity: 0.5 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatEuro}
            />
            <Tooltip
              formatter={(value) => [formatEuro(Number(value)), 'Montant']}
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
    </Card>
  )
}
