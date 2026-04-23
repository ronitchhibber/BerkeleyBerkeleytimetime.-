import type { CSSProperties } from 'react'
import type { Course } from '@/types'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useDataStore } from '@/stores/dataStore'
import { checkConflict } from '@/utils/scheduleConflict'

interface ClassCardProps {
  course: Course
  isSelected: boolean
  onClick: () => void
  style: CSSProperties
}

function gradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-soybean'
  if (grade === 'B+') return 'text-cal-gold'
  if (grade.startsWith('B')) return 'text-medalist'
  if (grade === 'N/A') return 'text-text-muted'
  return 'text-wellman'
}

function enrollColor(p: number): string {
  if (p >= 90) return 'text-wellman'
  if (p >= 60) return 'text-medalist'
  return 'text-soybean'
}

export default function ClassCard({ course, isSelected, onClick, style }: ClassCardProps) {
  const scheduledClasses = useScheduleStore((s) => s.classes)
  const allCourses = useDataStore((s) => s.courses)
  const conflict = checkConflict(course, scheduledClasses, allCourses)
  const isInSchedule = scheduledClasses.some((c) => c.courseId === course.id)

  return (
    <div style={style} className="px-6 pb-3">
      <div
        onClick={onClick}
        className={`group relative cursor-pointer overflow-hidden rounded-lg border bg-bg-card px-4 py-3.5 transition-all duration-150 ${
          isSelected
            ? 'border-cal-gold/50 bg-gradient-to-br from-berkeley-blue/40 via-bg-card to-bg-card shadow-[0_0_0_1px_rgba(253,181,21,0.2),0_8px_28px_-6px_rgba(0,50,98,0.5)]'
            : 'border-border hover:border-cal-gold/25 hover:bg-bg-card-hover'
        }`}
      >
        {isSelected && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-[3px] campanile-rule" />
            <div className="absolute right-0 top-0 h-12 w-12 bg-gradient-to-br from-cal-gold/8 to-transparent" />
          </>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5">
              <span className="mono text-[14px] font-bold tracking-tight text-text-primary">
                {course.code}
              </span>
              <span className="mono text-[10.5px] font-medium text-text-muted">
                {course.sectionNumber}
              </span>
              {isInSchedule && (
                <span
                  className="mono inline-flex items-center gap-1 rounded bg-soybean/15 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-soybean ring-1 ring-soybean/30"
                  title="Already in your schedule"
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  scheduled
                </span>
              )}
              {conflict.conflicts && conflict.withCourse && (
                <span
                  className="inline-flex items-center gap-1 rounded bg-wellman/15 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-wellman ring-1 ring-wellman/30"
                  title={`Conflicts with ${conflict.withCourse.code} ${conflict.withCourse.sectionNumber} on ${conflict.overlappingDays?.join(', ')}`}
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  conflict
                </span>
              )}
            </div>
            <p className="mt-1 truncate serif text-[13.5px] leading-snug text-text-secondary">
              {course.title}
            </p>
          </div>
          <span className={`mono text-[15px] font-bold leading-none ${gradeColor(course.averageGrade)}`}>
            {course.averageGrade}
          </span>
        </div>

        <div className="mt-2.5 flex items-center gap-3 text-[11.5px] text-text-muted">
          <span className={`mono font-semibold tabular-nums ${enrollColor(course.enrollmentPercent)}`}>
            {Math.round(course.enrollmentPercent)}%
          </span>
          <span className="text-text-muted/40">·</span>
          <span className="mono tabular-nums">{course.units}u</span>
          {course.hasReservedSeating && (
            <>
              <span className="text-text-muted/40">·</span>
              <span className="flex items-center gap-1 text-cal-gold/70">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                Rsvd
              </span>
            </>
          )}
          {course.rmpRating && (
            <span className="ml-auto flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-cal-gold">
                <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" />
              </svg>
              <span className="mono font-semibold tabular-nums text-text-secondary">{course.rmpRating.avgRating.toFixed(1)}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
