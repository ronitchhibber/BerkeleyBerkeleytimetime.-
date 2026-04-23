import type { RMPRating } from '@/types'

interface RatingsTabProps {
  rating?: RMPRating
  instructor: string
}

function ratingColor(r: number): string {
  if (r >= 4) return 'text-accent-green'
  if (r >= 3) return 'text-accent-yellow'
  if (r >= 2) return 'text-accent-orange'
  return 'text-accent-red'
}

function diffColor(r: number): string {
  if (r <= 2) return 'text-accent-green'
  if (r <= 3.5) return 'text-accent-yellow'
  return 'text-accent-orange'
}

function wtaColor(p: number): string {
  if (p >= 70) return 'text-accent-green'
  if (p >= 50) return 'text-accent-yellow'
  return 'text-accent-red'
}

function Stat({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg-card px-5 py-4">
      <div className="text-[12px] font-medium text-text-muted">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className={`text-[28px] font-bold leading-none ${color}`}>{value}</span>
        {sub && <span className="text-[12px] text-text-muted">{sub}</span>}
      </div>
    </div>
  )
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = (value / max) * 100
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border-strong">
      <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function RatingsTab({ rating, instructor }: RatingsTabProps) {
  if (!rating || rating.numRatings === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3 px-8">
        <p className="text-[13px] text-text-muted">No RateMyProfessor data available</p>
        {instructor && instructor !== 'Staff' && (
          <p className="text-[12px] text-text-muted">for {instructor}</p>
        )}
      </div>
    )
  }

  const wtaDisplay = rating.wouldTakeAgainPercent >= 0 ? `${Math.round(rating.wouldTakeAgainPercent)}%` : 'N/A'
  const rmpId = atob(rating.rmpId).replace('Teacher-', '')

  return (
    <div className="space-y-6 px-7 py-6">
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-text-primary">{instructor}</h3>
          <p className="mt-1 text-[12.5px] text-text-secondary">
            {rating.department} · {rating.numRatings} ratings on RateMyProfessor
          </p>
        </div>
        <a
          href={`https://www.ratemyprofessors.com/professor/${rmpId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-md border border-border-strong bg-bg-card px-3 py-1.5 text-[12.5px] font-medium text-text-secondary transition-colors hover:border-accent-blue/40 hover:text-accent-blue"
        >
          View on RMP
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17L17 7M17 7H8M17 7V16" />
          </svg>
        </a>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Quality" value={rating.avgRating.toFixed(1)} sub="/ 5" color={ratingColor(rating.avgRating)} />
        <Stat label="Difficulty" value={rating.avgDifficulty.toFixed(1)} sub="/ 5" color={diffColor(rating.avgDifficulty)} />
        <Stat label="Take Again" value={wtaDisplay} color={wtaColor(rating.wouldTakeAgainPercent)} />
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-bg-card p-5">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-[12px]">
            <span className="font-medium text-text-secondary">Quality</span>
            <span className={`mono font-semibold ${ratingColor(rating.avgRating)}`}>{rating.avgRating.toFixed(1)} / 5</span>
          </div>
          <Bar value={rating.avgRating} max={5} color={
            rating.avgRating >= 4 ? 'bg-accent-green' :
            rating.avgRating >= 3 ? 'bg-accent-yellow' :
            rating.avgRating >= 2 ? 'bg-accent-orange' : 'bg-accent-red'
          } />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between text-[12px]">
            <span className="font-medium text-text-secondary">Difficulty</span>
            <span className={`mono font-semibold ${diffColor(rating.avgDifficulty)}`}>{rating.avgDifficulty.toFixed(1)} / 5</span>
          </div>
          <Bar value={rating.avgDifficulty} max={5} color={
            rating.avgDifficulty <= 2 ? 'bg-accent-green' :
            rating.avgDifficulty <= 3.5 ? 'bg-accent-yellow' : 'bg-accent-orange'
          } />
        </div>
      </div>
    </div>
  )
}
