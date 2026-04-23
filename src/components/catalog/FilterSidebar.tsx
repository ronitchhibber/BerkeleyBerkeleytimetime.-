import { useCatalogStore } from '@/stores/catalogStore'
import SemesterFilter from './filters/SemesterFilter'
import SortByFilter from './filters/SortByFilter'
import MajorFilter from './filters/MajorFilter'
import ClassLevelFilter from './filters/ClassLevelFilter'
import RequirementsFilter from './filters/RequirementsFilter'
import UnitsFilter from './filters/UnitsFilter'
import EnrollmentStatusFilter from './filters/EnrollmentStatusFilter'
import GradingOptionFilter from './filters/GradingOptionFilter'
import DateTimeFilter from './filters/DateTimeFilter'
import RmpRatingFilter from './filters/RmpRatingFilter'

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <span className="eyebrow-plain text-text-muted/80">{label}</span>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export default function FilterSidebar() {
  const resetFilters = useCatalogStore((s) => s.resetFilters)

  return (
    <div className="space-y-7 pb-2">
      {/* Masthead */}
      <div className="space-y-3">
        <span className="eyebrow">Section 01 · Browse</span>
        <div className="flex items-end justify-between gap-3 border-b border-cal-gold/15 pb-3">
          <h2 className="serif text-[26px] font-semibold leading-none tracking-tight text-text-primary">
            Filter <span className="serif-italic text-cal-gold">classes</span>
          </h2>
          <button
            onClick={resetFilters}
            className="mono group flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-cal-gold/80 transition-colors hover:text-cal-gold"
          >
            Reset
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:rotate-180">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
      </div>

      <FilterGroup label="Term">
        <SemesterFilter />
        <SortByFilter />
      </FilterGroup>

      <FilterGroup label="Discipline">
        <MajorFilter />
        <ClassLevelFilter />
        <RequirementsFilter />
      </FilterGroup>

      <FilterGroup label="Schedule">
        <UnitsFilter />
        <RmpRatingFilter />
      </FilterGroup>

      <FilterGroup label="Status">
        <EnrollmentStatusFilter />
        <GradingOptionFilter />
        <DateTimeFilter />
      </FilterGroup>
    </div>
  )
}
