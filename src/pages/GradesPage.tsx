import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDataStore, useCourseDetail } from '@/stores/dataStore'
import CourseSearch from '@/components/shared/CourseSearch'
import Dropdown from '@/components/ui/Dropdown'
import GradeDistributionChart from '@/components/catalog/charts/GradeDistributionChart'
import GradeHistoryTable from '@/components/catalog/charts/GradeHistoryTable'

export default function GradesPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const loadData = useDataStore((s) => s.loadData)
  const isLoading = useDataStore((s) => s.isLoading)
  const getCourseById = useDataStore((s) => s.getCourseById)
  const courses = useDataStore((s) => s.courses)
  const loadCourseDetail = useDataStore((s) => s.loadCourseDetail)

  const [selectedId, setSelectedId] = useState<string | null>(courseId || null)
  const [selectedInstructor, setSelectedInstructor] = useState('all')
  const [selectedSemester, setSelectedSemester] = useState('all')

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => { if (courseId) setSelectedId(courseId) }, [courseId])
  useEffect(() => { if (selectedId) loadCourseDetail(selectedId) }, [selectedId, loadCourseDetail])

  const course = selectedId ? getCourseById(selectedId) : undefined
  const detail = useCourseDetail(selectedId)
  const gradeHistory = detail?.gradeHistory ?? []

  const instructors = useMemo(() => {
    const set = new Set(gradeHistory.map((r) => r.instructor))
    return [{ value: 'all', label: 'All Instructors' }, ...[...set].map((i) => ({ value: i, label: i }))]
  }, [gradeHistory])

  const semesters = useMemo(() => {
    const set = new Set(gradeHistory.map((r) => r.semester))
    return [{ value: 'all', label: 'All Semesters' }, ...[...set].map((s) => ({ value: s, label: s }))]
  }, [gradeHistory])

  const filteredRecords = useMemo(() => gradeHistory.filter((r) => {
    if (selectedInstructor !== 'all' && r.instructor !== selectedInstructor) return false
    if (selectedSemester !== 'all' && r.semester !== selectedSemester) return false
    return true
  }), [gradeHistory, selectedInstructor, selectedSemester])

  const aggregated = useMemo(() => {
    if (filteredRecords.length === 0) return null
    const totals = { aPlus: 0, a: 0, aMinus: 0, bPlus: 0, b: 0, bMinus: 0, cPlus: 0, c: 0, cMinus: 0, dPlus: 0, d: 0, dMinus: 0, f: 0, p: 0, np: 0 }
    let totalEnrolled = 0, gpaSum = 0
    for (const rec of filteredRecords) {
      for (const k of Object.keys(totals) as (keyof typeof totals)[]) totals[k] += rec.distribution[k]
      totalEnrolled += rec.totalEnrolled
      gpaSum += rec.averageGPA * rec.totalEnrolled
    }
    return { distribution: totals, totalEnrolled, avgGPA: totalEnrolled > 0 ? gpaSum / totalEnrolled : 0 }
  }, [filteredRecords])

  if (isLoading) return <div className="flex h-full items-center justify-center"><p className="text-[13px] text-text-muted">Loading…</p></div>

  return (
    <div className="flex h-full">
      <aside className="flex h-full w-[300px] shrink-0 flex-col overflow-y-auto border-r border-border bg-gradient-to-b from-berkeley-blue/8 to-transparent px-6 py-6">
        <div className="mb-5 space-y-3 border-b border-cal-gold/20 pb-4">
          <span className="eyebrow">Section 01 · Lookup</span>
          <h2 className="serif text-[22px] font-semibold leading-none tracking-tight text-text-primary">
            Grade <span className="serif-italic text-cal-gold">history</span>
          </h2>
        </div>

        <div className="mb-4">
          <label className="mb-2 mono block text-[9.5px] font-bold uppercase tracking-[0.18em] text-text-muted/70">Course</label>
          <CourseSearch
            selectedId={selectedId}
            onSelect={(c) => { setSelectedId(c.id); setSelectedInstructor('all'); setSelectedSemester('all'); navigate(`/grades/${c.id}`, { replace: true }) }}
            placeholder="Search for a class..."
          />
        </div>

        {course && gradeHistory.length > 0 && (
          <div className="space-y-3">
            <Dropdown label="Instructor" value={selectedInstructor} options={instructors} onChange={setSelectedInstructor} />
            <Dropdown label="Semester" value={selectedSemester} options={semesters} onChange={setSelectedSemester} />
          </div>
        )}

        <div className="mt-auto border-t border-border pt-4">
          <p className="mono text-[10px] uppercase tracking-[0.16em] text-text-muted/70">
            <span className="text-cal-gold/80 tabular-nums">{courses.length.toLocaleString()}</span> courses indexed
          </p>
          <p className="mt-1 text-[10.5px] text-text-muted">
            Source · <span className="serif italic">berkeleytime.com</span>
          </p>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto px-10 py-8">
        {!course ? (
          <div className="relative flex h-full flex-col items-center justify-center gap-5 overflow-hidden text-center">
            {/* Decorative seal */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05]">
              <svg viewBox="0 0 400 400" className="h-[440px] w-[440px] text-cal-gold">
                <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="0.6" />
                <circle cx="200" cy="200" r="140" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="3 4" />
                <circle cx="200" cy="200" r="98" fill="none" stroke="currentColor" strokeWidth="0.4" />
              </svg>
            </div>
            <div className="relative">
              <span className="eyebrow inline-flex">UC Berkeley · Grade Archive</span>
              <h2 className="display mt-4 text-[44px] text-text-primary md:text-[54px]">
                Read the<br /><span className="serif-italic text-cal-gold">grade record</span>.
              </h2>
              <div className="mx-auto my-5 h-px w-16 bg-gradient-to-r from-transparent via-cal-gold/50 to-transparent" />
              <p className="mx-auto max-w-md serif text-[14px] italic leading-relaxed text-text-muted">
                Historical distributions, average GPAs, and per-instructor breakdowns across every Berkeley semester.
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-5xl space-y-7">
            <div className="border-b border-border pb-5">
              <span className="eyebrow-plain">{course.department}</span>
              <div className="mt-2 flex items-baseline gap-3">
                <h1 className="mono text-[30px] font-bold leading-none tracking-tight text-text-primary">{course.code}</h1>
                <span className="mono text-[14px] text-text-muted">Grade History</span>
              </div>
              <p className="mt-2 serif text-[17px] text-text-secondary">{course.title}</p>
              {aggregated && (
                <div className="mt-4 flex flex-wrap gap-x-7 gap-y-2 border-t border-border-gold/40 pt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-text-muted/70">Avg GPA</span>
                    <span className="mono text-[18px] font-bold tabular-nums text-cal-gold">{aggregated.avgGPA.toFixed(2)}</span>
                  </div>
                  <span className="text-border-strong self-center">|</span>
                  <div className="flex items-baseline gap-2">
                    <span className="mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-text-muted/70">Students</span>
                    <span className="mono text-[15px] font-bold tabular-nums text-text-primary">{aggregated.totalEnrolled.toLocaleString()}</span>
                  </div>
                  <span className="text-border-strong self-center">|</span>
                  <div className="flex items-baseline gap-2">
                    <span className="mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-text-muted/70">Records</span>
                    <span className="mono text-[15px] font-bold tabular-nums text-text-primary">{filteredRecords.length}</span>
                  </div>
                </div>
              )}
            </div>

            {gradeHistory.length === 0 ? (
              <div className="flex h-72 items-center justify-center rounded-lg border border-border bg-bg-card">
                <p className="serif text-[14px] italic text-text-muted">No grade data available for this course</p>
              </div>
            ) : (
              <>
                {aggregated && (
                  <div>
                    <h3 className="eyebrow mb-4">Distribution</h3>
                    <div className="rounded-lg border border-border-gold/40 bg-bg-card p-6 elevated-card">
                      <GradeDistributionChart distribution={aggregated.distribution} totalEnrolled={aggregated.totalEnrolled} />
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="eyebrow mb-4">Historical Records</h3>
                  <GradeHistoryTable records={filteredRecords} />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
