import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { GradeDistribution } from '@/types'

interface GradeDistributionChartProps {
  distribution: GradeDistribution
  totalEnrolled: number
}

const gradeKeys: { key: keyof GradeDistribution; label: string }[] = [
  { key: 'aPlus', label: 'A+' },
  { key: 'a', label: 'A' },
  { key: 'aMinus', label: 'A-' },
  { key: 'bPlus', label: 'B+' },
  { key: 'b', label: 'B' },
  { key: 'bMinus', label: 'B-' },
  { key: 'cPlus', label: 'C+' },
  { key: 'c', label: 'C' },
  { key: 'cMinus', label: 'C-' },
  { key: 'dPlus', label: 'D+' },
  { key: 'd', label: 'D' },
  { key: 'dMinus', label: 'D-' },
  { key: 'f', label: 'F' },
  { key: 'p', label: 'P' },
  { key: 'np', label: 'NP' },
]

function barColor(label: string): string {
  if (label.startsWith('A')) return '#58a6ff'
  if (label.startsWith('B')) return '#3fb950'
  if (label.startsWith('C')) return '#e3b341'
  if (label.startsWith('D')) return '#d29922'
  if (label === 'F') return '#f85149'
  return '#7d8590'
}

export default function GradeDistributionChart({ distribution, totalEnrolled }: GradeDistributionChartProps) {
  const data = gradeKeys.map(({ key, label }) => ({
    grade: label,
    count: distribution[key],
    percent: totalEnrolled > 0 ? (distribution[key] / totalEnrolled) * 100 : 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <XAxis
          dataKey="grade"
          tick={{ fill: '#7d8590', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
          axisLine={{ stroke: '#21262d' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#7d8590', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
          axisLine={{ stroke: '#21262d' }}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#161b22',
            border: '1px solid #21262d',
            borderRadius: 8,
            fontSize: 12,
            fontFamily: "'DM Sans', sans-serif",
          }}
          labelStyle={{ color: '#e6edf3', fontWeight: 600 }}
          itemStyle={{ color: '#7d8590' }}
          formatter={(value: unknown) => [`${Number(value).toFixed(1)}%`, 'Percentage']}
          cursor={{ fill: 'rgba(88, 166, 255, 0.06)' }}
        />
        <Bar dataKey="percent" radius={[3, 3, 0, 0]} maxBarSize={32}>
          {data.map((entry) => (
            <Cell key={entry.grade} fill={barColor(entry.grade)} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
