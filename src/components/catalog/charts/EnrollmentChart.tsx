import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { EnrollmentDataPoint } from '@/types'

interface EnrollmentChartProps {
  data: EnrollmentDataPoint[]
  showPhases: boolean
  showAsCount: boolean
}

interface ChartPoint {
  day: number
  value: number
  date?: string
  enrolledCount: number
  waitlistCount?: number
}

interface TooltipPayload {
  payload?: ChartPoint
  value?: number
}

/**
 * Berkeley Fall 2026 enrollment phase milestones (UC Berkeley Office of the Registrar).
 * Update annually if Berkeley changes the academic calendar.
 *   https://registrar.berkeley.edu/registration/dates-and-deadlines/
 */
interface PhaseDef { date: string; label: string; color: string }
const PHASES: PhaseDef[] = [
  { date: '2026-04-13', label: 'Phase I', color: '#3B7EA1' },
  { date: '2026-07-06', label: 'Phase II', color: '#FDB515' },
  { date: '2026-08-03', label: 'Adjustment', color: '#859438' },
  { date: '2026-08-26', label: 'Classes Begin', color: '#D9661F' },
]

function CustomTooltip({ active, payload, showAsCount }: { active?: boolean; payload?: TooltipPayload[]; showAsCount: boolean }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  if (!p) return null
  return (
    <div className="rounded-md border border-border-strong bg-bg-elevated px-3 py-2 shadow-xl">
      {p.date && <div className="text-[11px] font-medium text-text-secondary">{new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>}
      <div className="mono mt-0.5 text-[12px] font-semibold text-text-primary">
        {showAsCount ? `${p.enrolledCount} enrolled` : `${p.value.toFixed(1)}% enrolled`}
      </div>
      {p.waitlistCount !== undefined && p.waitlistCount > 0 && (
        <div className="mono text-[11px] text-accent-orange">{p.waitlistCount} on waitlist</div>
      )}
    </div>
  )
}

export default function EnrollmentChart({ data, showPhases, showAsCount }: EnrollmentChartProps) {
  const chartData: ChartPoint[] = data.map((d) => ({
    day: d.day,
    value: showAsCount ? d.enrolledCount : d.enrollmentPercent,
    date: d.date,
    enrolledCount: d.enrolledCount,
    waitlistCount: d.waitlistCount,
  }))

  const maxDay = chartData.length > 0 ? chartData[chartData.length - 1].day : 0

  // Map phase dates to chart day indices (only include phases that fall inside the data range).
  type PhaseMarker = PhaseDef & { day: number }
  const phaseMarkers: PhaseMarker[] = []
  if (chartData.length > 0) {
    for (const phase of PHASES) {
      const phaseTime = new Date(phase.date).getTime()
      let bestPoint: ChartPoint | null = null
      let bestDelta = Infinity
      for (const pt of chartData) {
        if (!pt.date) continue
        const delta = Math.abs(new Date(pt.date).getTime() - phaseTime)
        if (delta < bestDelta) { bestDelta = delta; bestPoint = pt }
      }
      // Only show if a chart point exists within ±3 days of the phase boundary.
      if (bestPoint && bestDelta <= 3 * 86400000) {
        phaseMarkers.push({ ...phase, day: bestPoint.day })
      }
    }
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 24, right: 12, left: -8, bottom: 0 }}>
        <XAxis
          dataKey="day"
          tick={{ fill: '#6b6b75', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
          axisLine={{ stroke: '#1f1f24' }}
          tickLine={false}
          tickFormatter={(v) => {
            const point = chartData.find((p) => p.day === v)
            if (point?.date) return new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            return `Day ${v}`
          }}
          interval={Math.max(0, Math.floor(maxDay / 8))}
        />
        <YAxis
          tick={{ fill: '#6b6b75', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
          axisLine={{ stroke: '#1f1f24' }}
          tickLine={false}
          tickFormatter={(v) => showAsCount ? `${v}` : `${v}%`}
        />
        <Tooltip content={<CustomTooltip showAsCount={showAsCount} />} cursor={{ stroke: '#2a2a31' }} />
        {showPhases && phaseMarkers.map((phase) => (
          <ReferenceLine
            key={phase.label}
            x={phase.day}
            stroke={phase.color}
            strokeDasharray="2 4"
            strokeOpacity={0.6}
            label={{ value: phase.label, position: 'top', fill: phase.color, fontSize: 9, fontWeight: 600 }}
          />
        ))}
        <Line
          type="stepAfter"
          dataKey="value"
          stroke="#FDB515"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#FDB515', stroke: '#0a0e16', strokeWidth: 2 }}
          animationDuration={500}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
