'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import Card from '@/components/ui/Card'
import { useCSSVar } from '@/hooks/useCSSVar'
import type { FeuilleMaladie } from '@/lib/types'

const COLORS = ['#4A2C52', '#C4976A']

const LABELS: Record<string, string> = {
  EFFECTUE: 'Effectué',
  EN_ATTENTE: 'En attente',
}

export default function RemboursementStatusChart({ feuilles }: { feuilles: FeuilleMaladie[] }) {
  const bgColor = useCSSVar('--color-white-pure', '#FFFFFF')
  const textColor = useCSSVar('--color-text-anthracite', '#3A3A3A')

  const data = useMemo(() => {
    const statusTotals = new Map<string, number>()

    for (const f of feuilles) {
      for (const r of f.remboursements) {
        if (r.statut === 'REJETEE') continue
        const label = LABELS[r.statut] ?? r.statut
        statusTotals.set(label, (statusTotals.get(label) ?? 0) + 1)
      }
    }

    return Array.from(statusTotals.entries()).map(([name, value]) => ({ name, value }))
  }, [feuilles])

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <Card>
      <h3 className="text-sm font-semibold text-prune-main uppercase tracking-wider mb-4">
        Statut des remboursements
      </h3>
      <div className="h-64 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [
                `${Number(value)} remboursement${Number(value) > 1 ? 's' : ''} (${((Number(value) / total) * 100).toFixed(0)}%)`,
                'Nombre',
              ]}
              contentStyle={{
                backgroundColor: bgColor,
                border: `1px solid ${textColor}1A`,
                borderRadius: 0,
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-2">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2 text-xs text-text-anthracite/70">
            <span
              className="inline-block w-2.5 h-2.5"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            {d.name} — {d.value} ({((d.value / total) * 100).toFixed(0)}%)
          </div>
        ))}
      </div>
    </Card>
  )
}
