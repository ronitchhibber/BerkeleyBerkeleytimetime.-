import { useState, useMemo, useRef, useEffect } from 'react'
import { useGradtrakStore } from '@/stores/gradtrakStore'
import { useDataStore } from '@/stores/dataStore'
import { useAllCoursesStore } from '@/stores/allCoursesStore'
import { requirementsCourseCouldSatisfy } from '@/utils/requirementMatcher'
import { missingPrereqsFor } from '@/utils/prereqCheck'
import { lookupCourse } from '@/utils/courseLookup'
import type { PlannedSemester } from '@/types/gradtrak'

interface SemesterBlockProps {
  semester: PlannedSemester
}

const TERM_THEME = {
  Fall: { dot: 'bg-medalist', text: 'text-medalist', accent: 'border-medalist/40', tint: 'bg-medalist/[0.04]' },
  Spring: { dot: 'bg-soybean', text: 'text-soybean', accent: 'border-soybean/40', tint: 'bg-soybean/[0.04]' },
  Summer: { dot: 'bg-cal-gold', text: 'text-cal-gold', accent: 'border-cal-gold/40', tint: 'bg-cal-gold/[0.04]' },
} as const

export default function SemesterBlock({ semester }: SemesterBlockProps) {
  const removeSemester = useGradtrakStore((s) => s.removeSemester)
  const addCourse = useGradtrakStore((s) => s.addCourseToSemester)
  const removeCourse = useGradtrakStore((s) => s.removeCourseFromSemester)
  const programs = useGradtrakStore((s) => s.programs)
  const selectedProgramIds = useGradtrakStore((s) => s.selectedProgramIds)
  const allSemesters = useGradtrakStore((s) => s.semesters)
  const allCourses = useDataStore((s) => s.courses)
  const catalogCourses = useAllCoursesStore((s) => s.courses)
  const searchAllCourses = useAllCoursesStore((s) => s.searchCourses)
  const allCoursesLoaded = useAllCoursesStore((s) => s.isLoaded)

  const [openReqsFor, setOpenReqsFor] = useState<string | null>(null)
  const selectedPrograms = useMemo(
    () => programs.filter((p) => selectedProgramIds.includes(p.id)),
    [programs, selectedProgramIds]
  )

  const lookup = (code: string) => lookupCourse(code, allCourses, catalogCourses)

  const [adding, setAdding] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAdding(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const searchResults = useMemo(() => {
    if (!query) return []
    if (allCoursesLoaded) {
      return searchAllCourses(query, 12).map((c) => ({ code: c.code, title: c.title, units: c.units }))
    }
    const q = query.toLowerCase()
    const seen = new Set<string>()
    const results: { code: string; title: string; units: number }[] = []
    for (const c of allCourses) {
      if (results.length >= 12) break
      if (seen.has(c.code)) continue
      if (c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)) {
        seen.add(c.code)
        results.push({ code: c.code, title: c.title, units: c.units })
      }
    }
    return results
  }, [query, allCourses, allCoursesLoaded, searchAllCourses])

  const totalUnits = semester.courseCodes.reduce((sum, code) => {
    return sum + (lookup(code)?.units || 0)
  }, 0)

  const theme = TERM_THEME[semester.term]
  const yearShort = String(semester.year).slice(-2)

  return (
    <div
      ref={ref}
      className="group/block relative rounded-xl border border-border bg-bg-card transition-all hover:border-border-strong"
    >
      {/* subtle term tint */}
      <div className={`pointer-events-none absolute inset-0 ${theme.tint} opacity-50 rounded-[inherit]`} />

      {/* HEADER */}
      <div className="relative flex items-stretch border-b border-border">
        {/* Left: term badge */}
        <div className="flex items-center gap-3.5 px-5 py-4">
          <div className="relative flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md border border-border bg-bg-input">
            <span className={`mono text-[8.5px] font-bold uppercase tracking-wider ${theme.text}`}>
              {semester.term.slice(0, 3)}
            </span>
            <span className="mono text-[15px] font-semibold leading-none text-text-primary">
              '{yearShort}
            </span>
            <span className={`absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full ${theme.dot} shadow-[0_0_8px_rgba(253,181,21,0.6)]`} />
          </div>

          <div>
            <div className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${theme.text}`}>
              {semester.term} Term
            </div>
            <div className="serif text-[20px] font-light leading-tight text-text-primary">
              {semester.year}
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: stats + remove */}
        <div className="flex items-center gap-4 px-5">
          <div className="flex items-center gap-3 border-l border-border pl-4">
            <div className="text-right">
              <div className="mono text-[14px] font-semibold leading-none text-text-primary tabular-nums">
                {semester.courseCodes.length}
              </div>
              <div className="mt-0.5 text-[9px] uppercase tracking-wider text-text-muted">classes</div>
            </div>
            <div className="h-7 w-px bg-border" />
            <div className="text-right">
              <div className="mono text-[14px] font-semibold leading-none text-text-primary tabular-nums">
                {totalUnits}
              </div>
              <div className="mt-0.5 text-[9px] uppercase tracking-wider text-text-muted">units</div>
            </div>
          </div>
          <button
            onClick={() => removeSemester(semester.id)}
            className="flex h-7 w-7 items-center justify-center rounded text-text-muted opacity-0 transition-all hover:bg-wellman/15 hover:text-wellman group-hover/block:opacity-100"
            title="Remove semester"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* COURSES */}
      <div className="relative p-3.5">
        {semester.courseCodes.length === 0 ? (
          <p className="px-1 py-1.5 text-[11.5px] italic text-text-muted">No courses yet — add your first below.</p>
        ) : (
          <div className="space-y-1.5">
            {semester.courseCodes.map((code, idx) => {
              const c = lookup(code)
              const reqMatches = selectedPrograms.length > 0
                ? requirementsCourseCouldSatisfy(code, selectedPrograms, allCourses, catalogCourses)
                : []
              const isOpen = openReqsFor === code
              return (
                <div key={code}>
                  <div
                    className={`group/course relative flex items-center gap-3 rounded-md border px-3 py-2 transition-all ${
                      isOpen ? 'border-cal-gold/40 bg-bg-input' : 'border-border-input/60 bg-bg-input/40 hover:border-cal-gold/30 hover:bg-bg-input'
                    }`}
                  >
                    {/* Index marker */}
                    <span className="mono w-4 shrink-0 text-[9.5px] font-semibold text-text-muted/60">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOpenReqsFor(isOpen ? null : code)}
                      className="min-w-0 flex-1 text-left"
                      title={reqMatches.length > 0 ? `Could satisfy ${reqMatches.length} requirement(s)` : 'No requirement matches'}
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="mono text-[12.5px] font-semibold text-text-primary">{code}</span>
                        {c && (
                          <span className="truncate text-[11.5px] text-text-secondary">{c.title}</span>
                        )}
                      </div>
                    </button>
                    <div className="flex shrink-0 items-center gap-3">
                      {(() => {
                        const { missing } = missingPrereqsFor(code, semester, allSemesters, catalogCourses)
                        return missing.length > 0 ? (
                          <span
                            className="inline-flex items-center gap-1 rounded bg-wellman/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-wellman ring-1 ring-wellman/30"
                            title={`Missing prereq${missing.length !== 1 ? 's' : ''}: ${missing.join(', ')}`}
                          >
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                              <line x1="12" y1="9" x2="12" y2="13" />
                              <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            prereq
                          </span>
                        ) : null
                      })()}
                      {reqMatches.length > 0 && (
                        <button
                          onClick={() => setOpenReqsFor(isOpen ? null : code)}
                          className={`mono flex items-center gap-1 rounded px-1.5 py-0.5 text-[9.5px] font-bold transition-colors ${
                            isOpen
                              ? 'bg-cal-gold/20 text-cal-gold'
                              : 'bg-cal-gold/10 text-cal-gold/80 hover:bg-cal-gold/20'
                          }`}
                          title="Click to see which requirements"
                        >
                          {reqMatches.length} req{reqMatches.length !== 1 ? 's' : ''}
                        </button>
                      )}
                      {c && (
                        <span className="mono text-[10px] font-medium text-cal-gold/80">{c.units}u</span>
                      )}
                      <button
                        onClick={() => removeCourse(semester.id, code)}
                        className="flex h-5 w-5 items-center justify-center rounded text-text-muted opacity-0 transition-all hover:bg-wellman/15 hover:text-wellman group-hover/course:opacity-100"
                        title="Remove course"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {isOpen && reqMatches.length > 0 && (
                    <div className="animate-slide-down ml-7 mt-1 rounded-md border border-cal-gold/20 bg-bg-input/40 px-2.5 py-2">
                      <div className="mono mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-cal-gold/80">
                        Could satisfy across {new Set(reqMatches.map((m) => m.programId)).size} program{new Set(reqMatches.map((m) => m.programId)).size !== 1 ? 's' : ''}
                      </div>
                      <div className="space-y-1">
                        {reqMatches.map((m, i) => (
                          <div key={i} className="flex items-baseline justify-between gap-2 text-[10.5px]">
                            <div className="min-w-0 flex-1">
                              <span className="text-text-primary">{m.reqName}</span>
                              <span className="ml-1.5 text-text-muted">· {m.groupName}</span>
                            </div>
                            <span className="mono shrink-0 text-[9px] uppercase tracking-wider text-cal-gold/70">
                              {m.programName.length > 20 ? m.programName.slice(0, 18) + '…' : m.programName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {adding ? (
          <div className="relative mt-2.5">
            <div className="relative">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cal-gold/60">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                autoFocus
                placeholder="e.g. CS 61A, MELC R1B, History N100G…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    if (searchResults.length > 0) {
                      addCourse(semester.id, searchResults[0].code)
                    } else {
                      addCourse(semester.id, query.trim().toUpperCase())
                    }
                    setQuery('')
                    setAdding(false)
                  } else if (e.key === 'Escape') {
                    setAdding(false)
                    setQuery('')
                  }
                }}
                className="w-full rounded-md border border-cal-gold/40 bg-bg-input py-2 pl-9 pr-3 text-[12.5px] text-text-primary placeholder-text-placeholder focus:border-cal-gold/70 focus:outline-none focus:ring-2 focus:ring-cal-gold/15"
              />
            </div>
            <div className="animate-slide-down absolute left-0 right-0 z-50 mt-1.5 max-h-64 overflow-y-auto rounded-md border border-border-strong bg-bg-elevated shadow-2xl shadow-black/80">
              {searchResults.length > 0 ? (
                <>
                  <div className="border-b border-border bg-bg-card/60 px-3 py-1.5">
                    <span className="mono text-[9px] font-semibold uppercase tracking-wider text-text-muted">
                      {searchResults.length} match{searchResults.length !== 1 ? 'es' : ''}
                    </span>
                  </div>
                  {searchResults.map((r) => (
                    <button
                      key={r.code}
                      onClick={() => {
                        addCourse(semester.id, r.code)
                        setQuery('')
                        setAdding(false)
                      }}
                      className="group/result flex w-full items-center justify-between border-b border-border/40 px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-cal-gold/5"
                    >
                      <div className="min-w-0">
                        <div className="mono text-[12px] font-semibold text-text-primary group-hover/result:text-cal-gold">
                          {r.code}
                        </div>
                        <div className="truncate text-[11px] text-text-muted">{r.title}</div>
                      </div>
                      <span className="mono shrink-0 text-[10px] font-medium text-cal-gold/70">{r.units}u</span>
                    </button>
                  ))}
                </>
              ) : query.trim() ? (
                <button
                  onClick={() => {
                    addCourse(semester.id, query.trim().toUpperCase())
                    setQuery('')
                    setAdding(false)
                  }}
                  className="flex w-full items-start gap-2.5 px-3 py-3 text-left transition-colors hover:bg-cal-gold/5"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 shrink-0 text-cal-gold">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11.5px] font-medium text-text-primary">
                      Not in our catalog — add <span className="mono font-semibold text-cal-gold">{query.trim().toUpperCase()}</span> anyway
                    </div>
                    <div className="mt-0.5 text-[10.5px] text-text-muted">
                      Some courses (DeCals, special topics, study abroad) aren't indexed by berkeleytime. Press Enter to add.
                    </div>
                  </div>
                </button>
              ) : (
                <div className="px-3 py-3 text-[11px] text-text-muted">
                  Type any Berkeley course code…
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border-strong/60 py-2.5 text-[12px] text-text-muted transition-all hover:border-cal-gold/40 hover:bg-cal-gold/[0.03] hover:text-cal-gold"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add class
          </button>
        )}
      </div>
    </div>
  )
}
