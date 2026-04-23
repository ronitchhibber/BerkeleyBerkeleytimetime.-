/**
 * Program scope filter — pick a major / minor / certificate, then optionally
 * pick a single requirement group within it (e.g. "Lower-Division
 * Prerequisites", "Upper-Division Electives").
 *
 * The catalog list narrows to courses that count toward the chosen scope.
 * This is the "what classes count toward my major?" filter.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useCatalogStore } from '@/stores/catalogStore'
import { useGradtrakStore } from '@/stores/gradtrakStore'
import { groupsWithCourses } from '@/utils/programFilterUtils'
import type { Program } from '@/types/gradtrak'

const TYPE_LABEL: Record<Program['type'], string> = {
  major: 'Majors',
  minor: 'Minors',
  certificate: 'Certificates',
  college: 'College',
  university: 'University',
}

const TYPE_ORDER: Program['type'][] = ['major', 'minor', 'certificate', 'college', 'university']

export default function ProgramFilter() {
  const programs = useGradtrakStore((s) => s.programs)
  const programsLoaded = useGradtrakStore((s) => s.programsLoaded)
  const loadPrograms = useGradtrakStore((s) => s.loadPrograms)

  const selectedProgramId = useCatalogStore((s) => s.selectedProgramId)
  const selectedRequirementGroupId = useCatalogStore((s) => s.selectedRequirementGroupId)
  const setSelectedProgramId = useCatalogStore((s) => s.setSelectedProgramId)
  const setSelectedRequirementGroupId = useCatalogStore((s) => s.setSelectedRequirementGroupId)

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  // Lazily load programs.json when the user first interacts with the filter.
  useEffect(() => {
    if (!programsLoaded) void loadPrograms()
  }, [programsLoaded, loadPrograms])

  // Click-outside to close
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase()
    const buckets: Record<Program['type'], Program[]> = {
      major: [], minor: [], certificate: [], college: [], university: [],
    }
    for (const p of programs) {
      if (q && !p.name.toLowerCase().includes(q)) continue
      buckets[p.type]?.push(p)
    }
    for (const t of TYPE_ORDER) buckets[t].sort((a, b) => a.name.localeCompare(b.name))
    return buckets
  }, [programs, query])

  const selectedProgram = useMemo(
    () => programs.find((p) => p.id === selectedProgramId) ?? null,
    [programs, selectedProgramId]
  )
  const requirementGroups = useMemo(
    () => (selectedProgram ? groupsWithCourses(selectedProgram) : []),
    [selectedProgram]
  )
  const selectedGroup = requirementGroups.find((g) => g.id === selectedRequirementGroupId) ?? null

  const totalMatches = TYPE_ORDER.reduce((acc, t) => acc + grouped[t].length, 0)

  return (
    <div ref={ref} className="space-y-2.5">
      {/* === Program select === */}
      <div className="relative">
        <label className="mb-1.5 flex items-baseline justify-between text-[13px] font-medium text-text-primary">
          <span>Program</span>
          {selectedProgramId && (
            <button
              onClick={() => setSelectedProgramId(null)}
              className="mono text-[9px] font-bold uppercase tracking-[0.16em] text-text-muted transition-colors hover:text-cal-gold"
            >
              Clear
            </button>
          )}
        </label>
        <button
          onClick={() => setOpen(!open)}
          className={`group relative flex w-full items-center justify-between overflow-hidden rounded-md border px-3 py-2.5 text-left text-[13px] transition-colors ${
            selectedProgram
              ? 'border-cal-gold/35 bg-gradient-to-br from-berkeley-blue/30 to-bg-input text-text-primary'
              : 'border-border-input bg-bg-input text-text-placeholder hover:border-border-strong'
          }`}
        >
          {selectedProgram && (
            <span className="absolute left-0 top-0 bottom-0 w-[2px] campanile-rule" />
          )}
          <span className="min-w-0 flex-1 truncate pr-2">
            {selectedProgram ? (
              <span className="serif italic text-text-primary">{selectedProgram.name}</span>
            ) : (
              <span>Choose a major, minor, certificate…</span>
            )}
          </span>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`shrink-0 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <div className="animate-slide-down absolute z-30 mt-1 w-full rounded-md border border-border-strong bg-bg-elevated shadow-2xl shadow-black/50">
            <div className="border-b border-border-strong p-2">
              <input
                type="text"
                autoFocus
                placeholder="Search programs…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded bg-bg-input px-2.5 py-1.5 text-[12.5px] text-text-primary placeholder:italic placeholder-text-placeholder focus:outline-none"
              />
              {!programsLoaded && (
                <p className="mono mt-1.5 px-1 text-[9px] uppercase tracking-[0.14em] text-text-muted/70">
                  Loading…
                </p>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto py-1">
              {totalMatches === 0 ? (
                <p className="px-3 py-3 text-[13px] italic text-text-muted">No programs found</p>
              ) : (
                TYPE_ORDER.map((t) =>
                  grouped[t].length > 0 ? (
                    <div key={t} className="mb-1">
                      <div className="mono sticky top-0 bg-bg-elevated/95 px-3 pb-1 pt-2 text-[9px] font-bold uppercase tracking-[0.18em] text-cal-gold/75 backdrop-blur">
                        {TYPE_LABEL[t]} <span className="text-text-muted/60">· {grouped[t].length}</span>
                      </div>
                      {grouped[t].map((p) => {
                        const active = p.id === selectedProgramId
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedProgramId(p.id)
                              setOpen(false)
                              setQuery('')
                            }}
                            className={`block w-full px-3 py-1.5 text-left transition-colors ${
                              active
                                ? 'bg-cal-gold/10 text-cal-gold'
                                : 'text-text-primary hover:bg-bg-hover hover:text-cal-gold'
                            }`}
                          >
                            <span className={`serif text-[12.5px] leading-snug ${active ? 'italic' : ''}`}>
                              {p.name}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  ) : null
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* === Requirement-group select (only when a program is chosen) === */}
      {selectedProgram && requirementGroups.length > 0 && (
        <div className="animate-fade-in space-y-1.5 rounded-md border border-cal-gold/15 bg-cal-gold/[0.025] px-2.5 py-2.5">
          <label className="mono flex items-center justify-between text-[9.5px] font-bold uppercase tracking-[0.18em] text-cal-gold/85">
            <span>Within program</span>
            {selectedGroup && (
              <button
                onClick={() => setSelectedRequirementGroupId(null)}
                className="text-[9px] tracking-[0.14em] text-text-muted transition-colors hover:text-cal-gold"
              >
                Show all
              </button>
            )}
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedRequirementGroupId(null)}
              className={`mono rounded-full px-2.5 py-1 text-[10.5px] font-semibold tracking-tight transition-colors ${
                !selectedRequirementGroupId
                  ? 'bg-cal-gold text-bg-primary'
                  : 'border border-border-strong bg-bg-card text-text-secondary hover:border-cal-gold/40 hover:text-cal-gold'
              }`}
            >
              All requirements
            </button>
            {requirementGroups.map((g) => {
              const active = g.id === selectedRequirementGroupId
              return (
                <button
                  key={g.id}
                  onClick={() => setSelectedRequirementGroupId(g.id)}
                  title={g.description ?? g.name}
                  className={`rounded-full px-2.5 py-1 text-[11px] tracking-tight transition-colors ${
                    active
                      ? 'bg-cal-gold text-bg-primary'
                      : 'border border-border-strong bg-bg-card text-text-secondary hover:border-cal-gold/40 hover:text-cal-gold'
                  }`}
                >
                  <span className={active ? 'serif italic font-semibold' : 'serif'}>{g.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
