import { useEffect } from 'react'
import { useDataStore, useCourseDetail } from '@/stores/dataStore'
import { useCatalogStore } from '@/stores/catalogStore'
import type { DetailTab } from '@/types'
import Tabs from '@/components/ui/Tabs'
import ClassDetailHeader from './ClassDetailHeader'
import OverviewTab from './tabs/OverviewTab'
import SectionsTab from './tabs/SectionsTab'
import RatingsTab from './tabs/RatingsTab'
import GradesTab from './tabs/GradesTab'
import EnrollmentTab from './tabs/EnrollmentTab'

const tabList: DetailTab[] = ['Overview', 'Sections', 'Ratings', 'Grades', 'Enrollment']

function EmptyState() {
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden hero-backdrop film-grain">
      {/* Decorative orbiting seal */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06]">
        <svg viewBox="0 0 400 400" className="h-[420px] w-[420px] text-cal-gold">
          <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="0.6" />
          <circle cx="200" cy="200" r="140" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="3 4" />
          <circle cx="200" cy="200" r="98" fill="none" stroke="currentColor" strokeWidth="0.4" />
          {/* Concentric tick marks */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 24
            const x1 = 200 + Math.cos(angle) * 180
            const y1 = 200 + Math.sin(angle) * 180
            const x2 = 200 + Math.cos(angle) * 168
            const y2 = 200 + Math.sin(angle) * 168
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.6" />
          })}
        </svg>
      </div>

      <div className="relative z-10 max-w-md px-8 text-center">
        <span className="eyebrow mb-5 inline-flex">UC Berkeley · Catalog</span>
        <h2 className="display text-[42px] text-text-primary md:text-[52px]">
          Find your<br /><span className="serif-italic text-cal-gold">next class</span>.
        </h2>
        <div className="mx-auto my-5 h-px w-16 bg-gradient-to-r from-transparent via-cal-gold/50 to-transparent" />
        <p className="serif text-[14px] italic leading-relaxed text-text-muted">
          Pick a course from the list to see grades, ratings, sections, and enrollment trends.
        </p>
        <div className="mt-8 flex items-center justify-center gap-5 text-[10.5px] mono uppercase tracking-[0.18em] text-text-muted/60">
          <span>5,600+ classes</span>
          <span className="h-1 w-1 rounded-full bg-cal-gold/40" />
          <span>Fall 2026</span>
          <span className="h-1 w-1 rounded-full bg-cal-gold/40" />
          <span>Daily refresh</span>
        </div>
      </div>
    </div>
  )
}

export default function ClassDetailPanel() {
  const selectedCourseId = useCatalogStore((s) => s.selectedCourseId)
  const activeDetailTab = useCatalogStore((s) => s.activeDetailTab)
  const setActiveDetailTab = useCatalogStore((s) => s.setActiveDetailTab)
  const getCourseById = useDataStore((s) => s.getCourseById)
  const loadCourseDetail = useDataStore((s) => s.loadCourseDetail)

  const course = selectedCourseId ? getCourseById(selectedCourseId) : undefined
  const detail = useCourseDetail(selectedCourseId)

  useEffect(() => {
    if (selectedCourseId) loadCourseDetail(selectedCourseId)
  }, [selectedCourseId, loadCourseDetail])

  if (!course) {
    return <EmptyState />
  }

  return (
    <div className="flex h-full min-w-0 flex-col">
      <ClassDetailHeader course={course} />
      <Tabs
        tabs={tabList}
        activeTab={activeDetailTab}
        onChange={(tab) => setActiveDetailTab(tab as DetailTab)}
      />
      <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
        {activeDetailTab === 'Overview' && <OverviewTab course={course} />}
        {activeDetailTab === 'Sections' && <SectionsTab sections={course.sections} />}
        {activeDetailTab === 'Ratings' && <RatingsTab rating={course.rmpRating} instructor={course.instructor} />}
        {activeDetailTab === 'Grades' && <GradesTab gradeHistory={detail?.gradeHistory ?? []} />}
        {activeDetailTab === 'Enrollment' && <EnrollmentTab course={course} />}
      </div>
    </div>
  )
}
