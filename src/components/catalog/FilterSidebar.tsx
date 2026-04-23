import { useCatalogStore } from '@/stores/catalogStore'
import AskSearch from './AskSearch'
import SemesterFilter from './filters/SemesterFilter'
import SortByFilter from './filters/SortByFilter'
import ProgramFilter from './filters/ProgramFilter'
import MajorFilter from './filters/MajorFilter'
import ClassLevelFilter from './filters/ClassLevelFilter'
import RequirementsFilter from './filters/RequirementsFilter'
import UnitsFilter from './filters/UnitsFilter'
import EnrollmentStatusFilter from './filters/EnrollmentStatusFilter'
import GradingOptionFilter from './filters/GradingOptionFilter'
import DateTimeFilter from './filters/DateTimeFilter'
import RmpRatingFilter from './filters/RmpRatingFilter'

/**
 * Editorial section header — Roman-numeral marker, serif label, gold hairline.
 * Establishes a magazine-like rhythm down the sidebar instead of generic
 * "h3 + checkboxes" stacking.
 */
function Section({
  numeral,
  label,
  caption,
  children,
}: {
  numeral: string
  label: string
  caption?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3.5">
      <header className="flex items-baseline gap-3">
        <span className="serif italic text-[18px] font-semibold leading-none text-cal-gold/85 tabular-nums">
          {numeral}
        </span>
        <div className="flex-1">
          <h3 className="mono text-[10px] font-bold uppercase tracking-[0.22em] text-text-primary">
            {label}
          </h3>
          {caption && (
            <p className="mt-0.5 serif text-[11px] italic leading-tight text-text-muted/80">{caption}</p>
          )}
        </div>
        <div className="flex-1 self-center">
          <div className="h-px bg-gradient-to-r from-cal-gold/35 via-cal-gold/15 to-transparent" />
        </div>
      </header>
      <div className="space-y-4 pl-[26px]">{children}</div>
    </section>
  )
}

export default function FilterSidebar() {
  const resetFilters = useCatalogStore((s) => s.resetFilters)

  return (
    <div className="space-y-8 pb-4 pt-1">
      {/* === Ask: AI search lives at the very top === */}
      <AskSearch />

      {/* Editorial divider — three gold hairlines with a centered diamond */}
      <div className="flex items-center gap-3 px-1">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cal-gold/30" />
        <div className="h-1.5 w-1.5 rotate-45 bg-cal-gold/50" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cal-gold/30" />
      </div>

      {/* === Masthead === */}
      <header className="space-y-3.5">
        <div className="flex items-baseline justify-between">
          <span className="eyebrow">Berkeley · Browse</span>
          <button
            onClick={resetFilters}
            className="mono group flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cal-gold/75 transition-colors hover:text-cal-gold"
          >
            Reset
            <svg
              width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className="transition-transform group-hover:rotate-180"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
        <div className="relative border-b border-cal-gold/20 pb-4">
          <h2 className="serif text-[30px] font-semibold leading-[1.02] tracking-tight text-text-primary">
            Filter <span className="serif-italic font-medium text-cal-gold">classes</span>
          </h2>
          <p className="mt-1 serif text-[12.5px] italic text-text-muted">
            Sift the catalog by program, schedule, and standing.
          </p>
          {/* Berkeley flag accent — three short gold rules of decreasing length */}
          <div className="absolute right-0 top-1 flex flex-col items-end gap-[3px]">
            <div className="h-[2px] w-8 bg-cal-gold/70" />
            <div className="h-[2px] w-5 bg-cal-gold/55" />
            <div className="h-[2px] w-2.5 bg-cal-gold/40" />
          </div>
        </div>
      </header>

      <Section numeral="i" label="Term" caption="When you're enrolling.">
        <SemesterFilter />
        <SortByFilter />
      </Section>

      <Section numeral="ii" label="Curriculum" caption="Filter to a major, minor, or certificate.">
        <ProgramFilter />
      </Section>

      <Section numeral="iii" label="Discipline" caption="Department, level, breadth.">
        <MajorFilter />
        <ClassLevelFilter />
        <RequirementsFilter />
      </Section>

      <Section numeral="iv" label="Schedule" caption="Workload and instructor reputation.">
        <UnitsFilter />
        <RmpRatingFilter />
      </Section>

      <Section numeral="v" label="Status" caption="Seats, grading, days, time.">
        <EnrollmentStatusFilter />
        <GradingOptionFilter />
        <DateTimeFilter />
      </Section>

      {/* Closing flourish — gold rule that fades, signaling end of the index */}
      <div className="pt-2">
        <div className="divider-gold" />
        <p className="mono mt-3 text-center text-[9px] uppercase tracking-[0.28em] text-text-muted/50">
          fiat lux
        </p>
      </div>
    </div>
  )
}
