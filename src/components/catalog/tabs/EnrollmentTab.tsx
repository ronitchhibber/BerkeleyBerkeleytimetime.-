import { useState } from 'react'
import type { Course } from '@/types'
import { useCourseDetail, useTermLabel } from '@/stores/dataStore'
import EnrollmentChart from '@/components/catalog/charts/EnrollmentChart'

interface EnrollmentTabProps {
  course: Course
}

function enrollColor(p: number): string {
  if (p >= 90) return 'text-accent-red'
  if (p >= 60) return 'text-accent-orange'
  return 'text-accent-green'
}

function Stat({ label, value, valueClass }: { label: string; value: string | number; valueClass?: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg-card px-4 py-3.5">
      <div className="text-[12px] font-medium text-text-muted">{label}</div>
      <div className={`mt-1 text-[24px] font-bold leading-none ${valueClass || 'text-text-primary'}`}>{value}</div>
    </div>
  )
}

export default function EnrollmentTab({ course }: EnrollmentTabProps) {
  const detail = useCourseDetail(course.id)
  const enrollmentHistory = detail?.enrollmentHistory ?? []
  const isLoading = !detail
  const termLabel = useTermLabel()
  const [showPhases, setShowPhases] = useState(true)
  const [showAsCount, setShowAsCount] = useState(false)

  return (
    <div className="space-y-6 px-7 py-6">
      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <h3 className="text-[16px] font-semibold text-text-primary">Current Enrollment</h3>
          <span className="text-[12px] text-text-muted">{termLabel} · Section {course.sectionNumber.replace('#', '')}</span>
        </div>
        <p className="text-[12.5px] text-text-secondary">
          Snapshot from berkeleytime.com · refreshed daily
        </p>

        <div className="mt-4 grid grid-cols-4 gap-3">
          <Stat
            label="Enrolled"
            value={`${course.enrolledCount}/${course.enrollmentCapacity}`}
            valueClass={enrollColor(course.enrollmentPercent)}
          />
          <Stat
            label="Capacity"
            value={`${Math.round(course.enrollmentPercent)}%`}
            valueClass={enrollColor(course.enrollmentPercent)}
          />
          <Stat
            label="Waitlist"
            value={course.waitlistCount}
            valueClass={course.waitlistCount > 0 ? 'text-accent-orange' : 'text-text-muted'}
          />
          <Stat
            label="Open Seats"
            value={Math.max(0, course.enrollmentCapacity - course.enrolledCount)}
            valueClass={course.enrolledCount < course.enrollmentCapacity ? 'text-accent-green' : 'text-text-muted'}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-border bg-bg-card px-5 py-8 text-center">
          <p className="text-[12px] text-text-muted">Loading enrollment history…</p>
        </div>
      ) : enrollmentHistory.length > 0 ? (
        <div>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h3 className="text-[16px] font-semibold text-text-primary">Enrollment Over Time</h3>
              <p className="mt-1 text-[12px] text-text-muted">
                {course.code} {course.sectionNumber} · Days since enrollment opened
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <label className="flex cursor-pointer items-center gap-2 text-[12px] text-text-secondary transition-colors hover:text-text-primary">
                <input type="checkbox" checked={showPhases} onChange={(e) => setShowPhases(e.target.checked)} className="accent-accent-blue" />
                Show phases
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-[12px] text-text-secondary transition-colors hover:text-text-primary">
                <input type="checkbox" checked={showAsCount} onChange={(e) => setShowAsCount(e.target.checked)} className="accent-accent-blue" />
                Show as count
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-bg-card p-4">
            <EnrollmentChart data={enrollmentHistory} showPhases={showPhases} showAsCount={showAsCount} />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-bg-card px-5 py-8 text-center">
          <p className="text-[13px] text-text-muted">No enrollment history available yet</p>
        </div>
      )}
    </div>
  )
}
