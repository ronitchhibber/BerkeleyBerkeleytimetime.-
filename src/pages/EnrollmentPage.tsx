import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDataStore, useCourseDetail } from '@/stores/dataStore'
import CourseSearch from '@/components/shared/CourseSearch'
import Dropdown from '@/components/ui/Dropdown'
import EnrollmentChart from '@/components/catalog/charts/EnrollmentChart'

function enrollColor(p: number): string {
  if (p >= 90) return 'text-wellman'
  if (p >= 60) return 'text-medalist'
  return 'text-soybean'
}

function Stat({ label, value, valueClass }: { label: string; value: string | number; valueClass?: string }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border-gold/30 bg-bg-card px-5 py-4 elevated-card">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cal-gold/30 to-transparent" />
      <div className="mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-text-muted/70">{label}</div>
      <div className={`mono mt-2 text-[26px] font-bold leading-none tabular-nums ${valueClass || 'text-text-primary'}`}>{value}</div>
    </div>
  )
}

export default function EnrollmentPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const loadData = useDataStore((s) => s.loadData)
  const isLoading = useDataStore((s) => s.isLoading)
  const getCourseById = useDataStore((s) => s.getCourseById)
  const courses = useDataStore((s) => s.courses)
  const loadCourseDetail = useDataStore((s) => s.loadCourseDetail)

  const [selectedId, setSelectedId] = useState<string | null>(courseId || null)
  const [showPhases, setShowPhases] = useState(true)
  const [showAsCount, setShowAsCount] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState('current')

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => { if (courseId) setSelectedId(courseId) }, [courseId])
  useEffect(() => { if (selectedId) loadCourseDetail(selectedId) }, [selectedId, loadCourseDetail])

  const course = selectedId ? getCourseById(selectedId) : undefined
  const detail = useCourseDetail(selectedId)

  const semesterOptions = useMemo(() => {
    if (!course) return [{ value: 'current', label: 'Fall 2026 (current)' }]
    const opts = [{ value: 'current', label: 'Fall 2026 (current)' }]
    if (detail?.enrollmentHistoryBySemester) {
      for (const sem of Object.keys(detail.enrollmentHistoryBySemester)) {
        opts.push({ value: sem, label: sem })
      }
    }
    return opts
  }, [course, detail])

  const displayedHistory = useMemo(() => {
    if (!course || !detail) return []
    if (selectedSemester === 'current') return detail.enrollmentHistory
    return detail.enrollmentHistoryBySemester?.[selectedSemester] || []
  }, [course, detail, selectedSemester])

  if (isLoading) return <div className="flex h-full items-center justify-center"><p className="text-[13px] text-text-muted">Loading…</p></div>

  return (
    <div className="flex h-full">
      <aside className="flex h-full w-[300px] shrink-0 flex-col overflow-y-auto border-r border-border bg-gradient-to-b from-berkeley-blue/8 to-transparent px-6 py-6">
        <div className="mb-5 space-y-3 border-b border-cal-gold/20 pb-4">
          <span className="eyebrow">Section 01 · Tracker</span>
          <h2 className="serif text-[22px] font-semibold leading-none tracking-tight text-text-primary">
            Enrollment <span className="serif-italic text-cal-gold">trends</span>
          </h2>
        </div>

        <label className="mb-2 mono block text-[9.5px] font-bold uppercase tracking-[0.18em] text-text-muted/70">Course</label>
        <CourseSearch
          selectedId={selectedId}
          onSelect={(c) => { setSelectedId(c.id); setSelectedSemester('current'); navigate(`/enrollment/${c.id}`, { replace: true }) }}
          placeholder="Search for a class..."
        />

        {course && (
          <div className="mt-5 space-y-5">
            {semesterOptions.length > 1 && (
              <Dropdown label="Semester" value={selectedSemester} options={semesterOptions} onChange={setSelectedSemester} />
            )}

            <div className="space-y-2.5">
              <span className="eyebrow-plain text-text-muted/80">Display</span>
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-text-secondary transition-colors hover:text-text-primary">
                <input type="checkbox" checked={showPhases} onChange={(e) => setShowPhases(e.target.checked)} className="accent-cal-gold" />
                Show phase markers
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-text-secondary transition-colors hover:text-text-primary">
                <input type="checkbox" checked={showAsCount} onChange={(e) => setShowAsCount(e.target.checked)} className="accent-cal-gold" />
                Show as student count
              </label>
            </div>
          </div>
        )}

        <div className="mt-auto border-t border-border pt-4">
          <p className="mono text-[10px] uppercase tracking-[0.16em] text-text-muted/70">
            <span className="text-cal-gold/80 tabular-nums">{courses.length.toLocaleString()}</span> courses · daily refresh
          </p>
          <p className="mt-1 text-[10.5px] text-text-muted">
            Source · <span className="serif italic">berkeleytime.com</span>
          </p>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto px-10 py-8">
        {!course ? (
          <div className="relative flex h-full flex-col items-center justify-center gap-5 overflow-hidden text-center">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05]">
              <svg viewBox="0 0 400 400" className="h-[440px] w-[440px] text-cal-gold">
                <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="0.6" />
                <circle cx="200" cy="200" r="140" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="3 4" />
                <circle cx="200" cy="200" r="98" fill="none" stroke="currentColor" strokeWidth="0.4" />
              </svg>
            </div>
            <div className="relative">
              <span className="eyebrow inline-flex">UC Berkeley · Enrollment Archive</span>
              <h2 className="display mt-4 text-[44px] text-text-primary md:text-[54px]">
                Watch the<br /><span className="serif-italic text-cal-gold">seats fill</span>.
              </h2>
              <div className="mx-auto my-5 h-px w-16 bg-gradient-to-r from-transparent via-cal-gold/50 to-transparent" />
              <p className="mx-auto max-w-md serif text-[14px] italic leading-relaxed text-text-muted">
                Real-time enrollment trends with daily snapshots — compare across past Fall semesters.
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-5xl space-y-7">
            <div className="border-b border-border pb-5">
              <div className="flex items-center gap-2">
                <span className="eyebrow-plain">{course.department}</span>
                <span className="text-cal-gold/30">·</span>
                <span className="mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                  {selectedSemester === 'current' ? 'Fall 2026' : selectedSemester}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <h1 className="mono text-[30px] font-bold leading-none tracking-tight text-text-primary">{course.code}</h1>
                <span className="mono text-[15px] text-text-muted">§ {course.sectionNumber}</span>
              </div>
              <p className="mt-2 serif text-[17px] text-text-secondary">{course.title}</p>
              {course.instructor !== 'Staff' && selectedSemester === 'current' && (
                <p className="mt-2 text-[12.5px] text-text-muted">
                  <span className="mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-text-muted/70">Instructor · </span>
                  <span className="serif italic text-text-secondary">{course.instructor}</span>
                </p>
              )}
            </div>

            {selectedSemester === 'current' && (
              <div className="grid grid-cols-4 gap-3">
                <Stat label="Enrolled" value={`${course.enrolledCount}/${course.enrollmentCapacity}`} valueClass={enrollColor(course.enrollmentPercent)} />
                <Stat label="Capacity" value={`${Math.round(course.enrollmentPercent)}%`} valueClass={enrollColor(course.enrollmentPercent)} />
                <Stat label="Waitlist" value={course.waitlistCount} valueClass={course.waitlistCount > 0 ? 'text-medalist' : 'text-text-muted'} />
                <Stat label="Open Seats" value={Math.max(0, course.enrollmentCapacity - course.enrolledCount)} valueClass={course.enrolledCount < course.enrollmentCapacity ? 'text-soybean' : 'text-text-muted'} />
              </div>
            )}

            {displayedHistory.length > 0 ? (
              <div>
                <h3 className="eyebrow mb-4">
                  Enrollment Over Time · {selectedSemester === 'current' ? 'Fall 2026' : selectedSemester}
                </h3>
                <div className="rounded-lg border border-border-gold/40 bg-bg-card p-6 elevated-card">
                  <EnrollmentChart data={displayedHistory} showPhases={showPhases} showAsCount={showAsCount} />
                </div>
                <p className="mt-3 mono text-[10px] uppercase tracking-[0.16em] text-text-muted/70">
                  <span className="text-cal-gold/80 tabular-nums">{displayedHistory.length}</span> daily snapshots · berkeleytime.com
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-bg-card px-5 py-12 text-center">
                <p className="serif text-[14px] italic text-text-muted">No enrollment history available for {selectedSemester === 'current' ? 'Fall 2026' : selectedSemester}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
