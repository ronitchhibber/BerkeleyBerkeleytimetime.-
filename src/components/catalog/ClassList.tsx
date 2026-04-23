import { useCallback, useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { List } from 'react-window'
import { useCatalogStore } from '@/stores/catalogStore'
import { useFilteredCourses } from '@/hooks/useFilteredCourses'
import SearchInput from '@/components/ui/SearchInput'
import FilterChip from '@/components/ui/FilterChip'
import ClassCard from './ClassCard'

function useActiveFilterChips() {
  const store = useCatalogStore()
  const chips: { id: string; label: string }[] = []

  if (store.searchQuery) chips.push({ id: 'search', label: store.searchQuery })
  for (const major of store.majors) {
    chips.push({ id: `major:${major}`, label: major })
  }
  for (const level of store.classLevels) {
    const labels: Record<string, string> = { lower: 'Lower Div', upper: 'Upper Div', graduate: 'Graduate' }
    chips.push({ id: `level:${level}`, label: labels[level] || level })
  }
  for (const req of store.requirements.lsBreadth) chips.push({ id: `lsBreadth:${req}`, label: req })
  for (const req of store.requirements.universityReqs) chips.push({ id: `universityReqs:${req}`, label: req })
  if (store.unitsRange[0] !== 0 || store.unitsRange[1] !== 5) {
    chips.push({ id: 'units', label: `${store.unitsRange[0]}-${store.unitsRange[1]} units` })
  }
  for (const s of store.enrollmentStatuses) chips.push({ id: `enrollment:${s}`, label: s })
  for (const g of store.gradingOptions) chips.push({ id: `grading:${g}`, label: g })
  for (const d of store.selectedDays) chips.push({ id: `day:${d}`, label: d })
  if (store.timeRange.from || store.timeRange.to) {
    chips.push({ id: 'time', label: `${store.timeRange.from || '...'} - ${store.timeRange.to || '...'}` })
  }
  if (store.rmpMinRating > 0) {
    chips.push({ id: 'rmp', label: store.rmpMinRating === 5 ? 'RMP 5' : `RMP > ${store.rmpMinRating}` })
  }

  return chips
}

export default function ClassList() {
  const navigate = useNavigate()
  const searchQuery = useCatalogStore((s) => s.searchQuery)
  const setSearchQuery = useCatalogStore((s) => s.setSearchQuery)
  const selectedCourseId = useCatalogStore((s) => s.selectedCourseId)
  const selectCourse = useCatalogStore((s) => s.selectCourse)
  const removeFilter = useCatalogStore((s) => s.removeFilter)
  const filteredCourses = useFilteredCourses()
  const chips = useActiveFilterChips()
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  const handleSelect = useCallback(
    (id: string) => {
      selectCourse(id)
      navigate(`/catalog/${id}`, { replace: true })
    },
    [selectCourse, navigate]
  )

  const [listHeight, setListHeight] = useState(600)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(() => {
      const headerH = headerRef.current?.getBoundingClientRect().height || 0
      setListHeight(container.getBoundingClientRect().height - headerH)
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="flex h-full flex-col">
      <div ref={headerRef} className="border-b border-border bg-gradient-to-b from-berkeley-blue/8 to-transparent px-6 pb-4 pt-6">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <span className="eyebrow">Section 02 · Catalog</span>
          <span className="mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-text-muted/70 tabular-nums">
            <span className="text-cal-gold/90">{filteredCourses.length.toLocaleString()}</span> classes
          </span>
        </div>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search Fall 2026 — try CS 61A, MATH 1A, MELC R1B…"
        />
        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <FilterChip key={chip.id} label={chip.label} onRemove={() => removeFilter(chip.id)} />
            ))}
          </div>
        )}
      </div>

      {filteredCourses.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8">
          <div className="relative flex h-14 w-14 items-center justify-center">
            <svg viewBox="0 0 56 56" className="absolute inset-0 h-full w-full text-cal-gold/20">
              <circle cx="28" cy="28" r="26" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" />
            </svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cal-gold/80">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div className="space-y-2 text-center">
            <p className="serif text-[18px] font-semibold leading-tight text-text-primary">
              No <span className="serif-italic text-cal-gold">Fall 2026</span> matches
            </p>
            {searchQuery ? (
              <p className="max-w-xs text-center text-[12px] leading-relaxed text-text-muted">
                The catalog covers current Fall 2026 offerings.
                Looking for past terms?
                Use <a href="/gradtrak" className="text-cal-gold underline-offset-2 hover:underline">Gradtrak</a> to log courses back to Fall 2020.
              </p>
            ) : (
              <p className="text-[12px] text-text-muted">Try removing a filter</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 pt-4">
          <List
            defaultHeight={listHeight - 16}
            rowCount={filteredCourses.length}
            rowHeight={104}
            rowProps={{}}
            rowComponent={({ index, style }) => (
              <ClassCard
                key={filteredCourses[index].id}
                course={filteredCourses[index]}
                isSelected={filteredCourses[index].id === selectedCourseId}
                onClick={() => handleSelect(filteredCourses[index].id)}
                style={style}
              />
            )}
          />
        </div>
      )}
    </div>
  )
}
