import { useCallback, useRef, useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { List } from 'react-window'
import { useCatalogStore } from '@/stores/catalogStore'
import { useDataStore, useTermLabel } from '@/stores/dataStore'
import { useGradtrakStore } from '@/stores/gradtrakStore'
import { useAiSearchStore } from '@/stores/aiSearchStore'
import { useFilteredCourses } from '@/hooks/useFilteredCourses'
import SearchInput from '@/components/ui/SearchInput'
import FilterChip from '@/components/ui/FilterChip'
import ClassCard from './ClassCard'

function useActiveFilterChips() {
  // Subscribe only to the filter slices — NOT to selectedCourseId or activeDetailTab.
  // Otherwise this hook (and the entire ClassList that uses it) re-renders on every
  // card click, even though the chips never change.
  const searchQuery = useCatalogStore((s) => s.searchQuery)
  const majors = useCatalogStore((s) => s.majors)
  const classLevels = useCatalogStore((s) => s.classLevels)
  const requirements = useCatalogStore((s) => s.requirements)
  const unitsRange = useCatalogStore((s) => s.unitsRange)
  const enrollmentStatuses = useCatalogStore((s) => s.enrollmentStatuses)
  const gradingOptions = useCatalogStore((s) => s.gradingOptions)
  const selectedDays = useCatalogStore((s) => s.selectedDays)
  const timeRange = useCatalogStore((s) => s.timeRange)
  const rmpMinRating = useCatalogStore((s) => s.rmpMinRating)
  const selectedProgramId = useCatalogStore((s) => s.selectedProgramId)
  const selectedRequirementGroupId = useCatalogStore((s) => s.selectedRequirementGroupId)
  const programs = useGradtrakStore((s) => s.programs)

  const chips: { id: string; label: string }[] = []
  if (searchQuery) chips.push({ id: 'search', label: searchQuery })
  // Program/group chips render first so curriculum scope is the most prominent context.
  if (selectedProgramId) {
    const program = programs.find((p) => p.id === selectedProgramId)
    if (program) {
      chips.push({ id: 'program', label: program.name })
      if (selectedRequirementGroupId) {
        const group = program.groups.find((g) => g.id === selectedRequirementGroupId)
        if (group) chips.push({ id: 'requirementGroup', label: group.name })
      }
    }
  }
  for (const major of majors) chips.push({ id: `major:${major}`, label: major })
  for (const level of classLevels) {
    const labels: Record<string, string> = { lower: 'Lower Div', upper: 'Upper Div', graduate: 'Graduate' }
    chips.push({ id: `level:${level}`, label: labels[level] || level })
  }
  for (const req of requirements.lsBreadth) chips.push({ id: `lsBreadth:${req}`, label: req })
  for (const req of requirements.universityReqs) chips.push({ id: `universityReqs:${req}`, label: req })
  if (unitsRange[0] !== 0 || unitsRange[1] !== 5) {
    chips.push({ id: 'units', label: `${unitsRange[0]}-${unitsRange[1]} units` })
  }
  for (const s of enrollmentStatuses) chips.push({ id: `enrollment:${s}`, label: s })
  for (const g of gradingOptions) chips.push({ id: `grading:${g}`, label: g })
  for (const d of selectedDays) chips.push({ id: `day:${d}`, label: d })
  if (timeRange.from || timeRange.to) {
    chips.push({ id: 'time', label: `${timeRange.from || '...'} - ${timeRange.to || '...'}` })
  }
  if (rmpMinRating > 0) {
    chips.push({ id: 'rmp', label: rmpMinRating === 5 ? 'RMP 5' : `RMP > ${rmpMinRating}` })
  }
  return chips
}

/**
 * Resolve the currently-selected program (and group, if any) for the
 * editorial scope banner that appears above the catalog list.
 */
function useProgramScope() {
  const selectedProgramId = useCatalogStore((s) => s.selectedProgramId)
  const selectedRequirementGroupId = useCatalogStore((s) => s.selectedRequirementGroupId)
  const programs = useGradtrakStore((s) => s.programs)
  return useMemo(() => {
    if (!selectedProgramId) return null
    const program = programs.find((p) => p.id === selectedProgramId)
    if (!program) return null
    const group = selectedRequirementGroupId
      ? program.groups.find((g) => g.id === selectedRequirementGroupId) ?? null
      : null
    return { program, group }
  }, [programs, selectedProgramId, selectedRequirementGroupId])
}

export default function ClassList() {
  const navigate = useNavigate()
  const searchQuery = useCatalogStore((s) => s.searchQuery)
  const setSearchQuery = useCatalogStore((s) => s.setSearchQuery)
  const selectedCourseId = useCatalogStore((s) => s.selectedCourseId)
  const selectCourse = useCatalogStore((s) => s.selectCourse)
  const removeFilter = useCatalogStore((s) => s.removeFilter)
  const resetFilters = useCatalogStore((s) => s.resetFilters)
  const filteredCourses = useFilteredCourses()
  const chips = useActiveFilterChips()
  const loadCourseDetail = useDataStore((s) => s.loadCourseDetail)
  const termLabel = useTermLabel()
  const aiRanked = useAiSearchStore((s) => s.ranked)
  const aiTopicQuery = useAiSearchStore((s) => s.filters?.topicQuery ?? null)
  const resetAi = useAiSearchStore((s) => s.reset)
  const getCourseById = useDataStore((s) => s.getCourseById)
  const programScope = useProgramScope()

  // When the AI returned ranked results, override the displayed course list
  // with the ranked subset (preserving rank order) so the user sees the AI's
  // picks at the top. We no longer surface the AI's "why this matches" copy —
  // per user feedback it felt redundant; show the actual course description.
  const aiCourses = aiRanked && aiRanked.length > 0
    ? aiRanked.map((r) => getCourseById(r.id)).filter((c): c is NonNullable<typeof c> => !!c)
    : null
  const displayCourses = aiCourses ?? filteredCourses
  const displayCount = displayCourses.length
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  // Always-available exit from AI mode back to the regular catalog.
  // Wipes both the AI store and any filters AI extracted, so the user lands
  // on a clean catalog state.
  const exitAiMode = useCallback(() => {
    resetAi()
    resetFilters()
  }, [resetAi, resetFilters])

  const handleSelect = useCallback(
    (id: string) => {
      selectCourse(id)
      navigate(`/catalog/${id}`, { replace: true })
    },
    [selectCourse, navigate]
  )

  // Warm-prefetch the first ~12 visible cards so the user's first few clicks are instant.
  // Runs once after results load (or when filter changes the top of the list).
  useEffect(() => {
    if (filteredCourses.length === 0) return
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 50))
    const cancel = idle(() => {
      for (const c of filteredCourses.slice(0, 12)) void loadCourseDetail(c.id)
    })
    return () => {
      const cancelIdle = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback
      if (cancelIdle && typeof cancel === 'number') cancelIdle(cancel)
    }
  }, [filteredCourses, loadCourseDetail])

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
      <div
        ref={headerRef}
        className="relative border-b border-cal-gold/15 bg-gradient-to-b from-berkeley-blue/12 via-berkeley-blue/[0.04] to-transparent px-7 pb-5 pt-7"
      >
        {/* Subtle gold rim along the left edge — Berkeley campanile motif */}
        <div className="absolute left-0 top-7 bottom-5 w-[2px] rounded-full bg-gradient-to-b from-transparent via-cal-gold/40 to-transparent" />

        <div className="mb-3.5 flex items-baseline justify-between gap-3">
          <span className="eyebrow">{aiCourses ? 'AI · Top Picks' : 'The Catalog'}</span>
          <span className="mono flex items-baseline gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted/70">
            <span className="serif text-[15px] not-italic font-semibold text-cal-gold tabular-nums">
              {displayCount.toLocaleString()}
            </span>
            <span>{aiCourses ? 'matches' : 'classes'}</span>
          </span>
        </div>

        {/* Editorial scope banner — only when a curriculum program is selected */}
        {!aiCourses && programScope && (
          <div className="mb-3 flex items-start gap-3 rounded-md border border-cal-gold/20 bg-gradient-to-br from-berkeley-blue/30 to-transparent px-3 py-2.5">
            <div className="mt-0.5 h-7 w-[2px] shrink-0 campanile-rule" />
            <div className="min-w-0 flex-1">
              <span className="mono text-[9px] font-bold uppercase tracking-[0.2em] text-cal-gold/80">
                Scope
              </span>
              <p className="mt-0.5 truncate serif text-[13.5px] italic text-text-primary">
                {programScope.program.name}
              </p>
              {programScope.group && (
                <p className="mt-0.5 mono text-[10.5px] uppercase tracking-[0.12em] text-text-muted/85">
                  · {programScope.group.name}
                </p>
              )}
            </div>
          </div>
        )}

        {aiCourses && aiTopicQuery ? (
          <div className="space-y-2">
            <div className="rounded-lg border border-cal-gold/20 bg-cal-gold/[0.04] px-3 py-2.5">
              <span className="mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-cal-gold/80">
                Topic
              </span>
              <p className="mt-0.5 serif italic text-[13px] text-text-primary">"{aiTopicQuery}"</p>
            </div>
            {/* Always-visible escape hatch back to the unfiltered catalog */}
            <button
              onClick={exitAiMode}
              className="group mono flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted transition-colors hover:text-cal-gold"
            >
              <svg
                width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className="transition-transform group-hover:-translate-x-0.5"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to catalog
            </button>
          </div>
        ) : (
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={`Search ${termLabel} — try CS 61A, MATH 1A, MELC R1B…`}
          />
        )}
        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <FilterChip key={chip.id} label={chip.label} onRemove={() => removeFilter(chip.id)} />
            ))}
          </div>
        )}
      </div>

      {displayCount === 0 ? (
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
              No <span className="serif-italic text-cal-gold">{termLabel}</span> matches
            </p>
            {searchQuery ? (
              <p className="max-w-xs text-center text-[12px] leading-relaxed text-text-muted">
                The catalog covers current {termLabel} offerings.
                Looking for past terms?
                Use <a href="/gradtrak" className="text-cal-gold underline-offset-2 hover:underline">Gradtrak</a> to log courses back to Fall 2020.
              </p>
            ) : (
              <p className="text-[12px] text-text-muted">Try removing a filter</p>
            )}
          </div>
        </div>
      ) : aiCourses ? (
        // AI ranked results render in a normal scroll (typically ≤8 hits).
        // Show the actual course description under each — the AI's "why this
        // matches" copy was removed per user request (it felt redundant since
        // the catalog description already conveys the topic).
        <div className="min-h-0 flex-1 overflow-y-auto pt-4">
          {aiCourses.map((c) => (
            <div key={c.id} className="px-6 pb-3">
              <div
                onClick={() => handleSelect(c.id)}
                className={`group relative cursor-pointer overflow-hidden rounded-lg border bg-bg-card px-4 py-3.5 transition-colors duration-75 ${
                  c.id === selectedCourseId
                    ? 'border-cal-gold/50 bg-gradient-to-br from-berkeley-blue/40 via-bg-card to-bg-card shadow-[0_0_0_1px_rgba(253,181,21,0.2),0_8px_28px_-6px_rgba(0,50,98,0.5)]'
                    : 'border-border hover:border-cal-gold/25 hover:bg-bg-card-hover'
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <span className="mono text-[14px] font-bold tracking-tight text-text-primary">{c.code}</span>
                  <span className="mono text-[10.5px] font-medium text-text-muted">{c.sectionNumber}</span>
                </div>
                <p className="mt-1 truncate serif text-[13.5px] leading-snug text-text-secondary">{c.title}</p>
                {c.description && (
                  <p className="mt-2 line-clamp-3 serif text-[12.5px] leading-snug text-text-secondary/85">
                    {c.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-hidden pt-4">
          <List
            defaultHeight={listHeight - 16}
            rowCount={filteredCourses.length}
            rowHeight={104}
            overscanCount={3}
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
            style={{ height: '100%' }}
          />
        </div>
      )}
    </div>
  )
}
