import type { Course } from '@/types'

interface ClassDetailHeaderProps {
  course: Course
}

function gradeColor(g: string): string {
  if (g.startsWith('A')) return 'text-soybean'
  if (g === 'B+') return 'text-cal-gold'
  if (g.startsWith('B')) return 'text-medalist'
  if (g === 'N/A') return 'text-text-muted'
  return 'text-wellman'
}

function enrollColor(p: number): string {
  if (p >= 90) return 'text-wellman'
  if (p >= 60) return 'text-medalist'
  return 'text-soybean'
}

export default function ClassDetailHeader({ course }: ClassDetailHeaderProps) {
  return (
    <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-berkeley-blue/25 via-bg-primary to-bg-primary px-8 pb-6 pt-7">
      {/* Top hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cal-gold/45 to-transparent" />
      {/* Right-edge gold whisper */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cal-gold/15 to-transparent" />

      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="eyebrow-plain">{course.department}</span>
            <span className="text-cal-gold/30">·</span>
            <span className="mono text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">Fall 2026</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className="mono text-[32px] font-bold leading-none tracking-tight text-text-primary">
              {course.code}
            </h1>
            <span className="mono text-[16px] font-medium text-text-muted">§ {course.sectionNumber}</span>
          </div>
          <p className="mt-2.5 serif text-[18px] leading-snug text-text-secondary">
            {course.title}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button className="flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-text-muted transition-all hover:border-cal-gold/30 hover:bg-bg-hover hover:text-cal-gold" title="Bookmark">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-md border border-transparent text-text-muted transition-all hover:border-cal-gold/30 hover:bg-bg-hover hover:text-cal-gold" title="Open in new tab">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats row — now formatted as small editorial captions */}
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border-gold/40 pt-4 text-[12px]">
        <div className="flex items-baseline gap-1.5">
          <span className="mono text-[9.5px] font-bold uppercase tracking-[0.15em] text-text-muted/70">Filled</span>
          <span className={`mono text-[14px] font-bold tabular-nums ${enrollColor(course.enrollmentPercent)}`}>
            {Math.round(course.enrollmentPercent)}%
          </span>
          {course.waitlistCount > 0 && (
            <span className="mono text-[10.5px] text-text-muted">·&nbsp;{course.waitlistCount}wl</span>
          )}
        </div>
        <span className="text-border-strong">|</span>
        <div className="flex items-baseline gap-1.5">
          <span className="mono text-[9.5px] font-bold uppercase tracking-[0.15em] text-text-muted/70">Avg</span>
          <span className={`mono text-[14px] font-bold ${gradeColor(course.averageGrade)}`}>{course.averageGrade}</span>
        </div>
        <span className="text-border-strong">|</span>
        <div className="flex items-baseline gap-1.5">
          <span className="mono text-[9.5px] font-bold uppercase tracking-[0.15em] text-text-muted/70">Units</span>
          <span className="mono text-[14px] font-bold text-text-primary tabular-nums">{course.units}</span>
        </div>
        <span className="text-border-strong">|</span>
        <div className="flex items-baseline gap-1.5">
          <span className="mono text-[9.5px] font-bold uppercase tracking-[0.15em] text-text-muted/70">Class №</span>
          <span className="mono text-[12.5px] text-text-secondary tabular-nums">{course.classNumber}</span>
        </div>
        {course.hasReservedSeating && (
          <>
            <span className="text-border-strong">|</span>
            <span className="flex items-center gap-1.5 rounded border border-cal-gold/30 bg-cal-gold/8 px-2 py-0.5 text-[10px] mono font-bold uppercase tracking-[0.15em] text-cal-gold">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 12H5l1.4-7h11.2L19 12zm-1.5 1H6.5l1.5 6h7.9l1.6-6zM5 12V9.5h14V12" />
              </svg>
              Reserved
            </span>
          </>
        )}
        {course.rmpRating && (
          <>
            <span className="text-border-strong">|</span>
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-cal-gold">
                <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" />
              </svg>
              <span className="mono text-[13px] font-semibold tabular-nums text-text-primary">{course.rmpRating.avgRating.toFixed(1)}</span>
              <span className="mono text-[10.5px] text-text-muted">({course.rmpRating.numRatings})</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
