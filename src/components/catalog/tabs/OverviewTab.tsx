import type { Course } from '@/types'
import { formatSchedule } from '@/utils/timeUtils'

interface OverviewTabProps {
  course: Course
}

function MetaCol({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-text-muted/70">{label}</h3>
      <div className="text-[14px] text-text-primary">{children}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="eyebrow mb-3">{title}</h3>
      <div className="text-[14px] leading-relaxed text-text-secondary">{children}</div>
    </div>
  )
}

export default function OverviewTab({ course }: OverviewTabProps) {
  const hasSchedule = course.days.length > 0 && course.startTime !== '00:00'

  return (
    <div className="space-y-7 px-8 py-7">
      <div className="grid grid-cols-3 gap-6 rounded-lg border border-border-gold/40 bg-bg-card/40 p-5">
        <MetaCol label="Meeting">
          {hasSchedule ? <span className="mono text-[13px]">{formatSchedule(course.days, course.startTime, course.endTime)}</span> : <span className="text-text-muted">TBA</span>}
        </MetaCol>
        <MetaCol label="Location">
          {course.location !== 'TBA' ? course.location : <span className="text-text-muted">TBA</span>}
        </MetaCol>
        <MetaCol label="Instructor">
          {course.instructor !== 'Staff' ? <span className="serif italic text-text-primary">{course.instructor}</span> : <span className="text-text-muted">Staff</span>}
        </MetaCol>
      </div>

      {course.prerequisites && (
        <Section title="Prerequisites">{course.prerequisites}</Section>
      )}

      {course.description && (
        <Section title="Description">
          <p className="serif text-[15px] leading-[1.75] text-text-primary/90">{course.description}</p>
        </Section>
      )}

      <Section title="Final Exam">{course.finalExam}</Section>

      <Section title="User-Submitted Class Requirements">
        <div className="space-y-2">
          {!course.attendanceRequired && !course.lecturesRecorded ? (
            <p className="text-text-muted">No info submitted yet</p>
          ) : (
            <>
              {course.attendanceRequired && (
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cal-gold">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Attendance Required</span>
                </div>
              )}
              {course.lecturesRecorded && (
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cal-gold">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                  <span>Lectures Recorded</span>
                </div>
              )}
            </>
          )}
        </div>
      </Section>

      <button className="text-[13px] font-medium text-cal-gold transition-colors hover:text-cal-gold/80">
        Look inaccurate? Suggest an edit →
      </button>
    </div>
  )
}
