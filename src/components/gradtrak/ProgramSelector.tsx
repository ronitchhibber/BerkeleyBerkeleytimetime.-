import { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useGradtrakStore } from '@/stores/gradtrakStore'

const TYPE_BADGE = {
  major: 'bg-cal-gold/15 text-cal-gold ring-1 ring-cal-gold/30',
  minor: 'bg-founders-rock/15 text-founders-rock ring-1 ring-founders-rock/30',
  college: 'bg-soybean/15 text-soybean ring-1 ring-soybean/30',
} as const

export default function ProgramSelector() {
  const programs = useGradtrakStore((s) => s.programs)
  const selected = useGradtrakStore((s) => s.selectedProgramIds)
  const toggle = useGradtrakStore((s) => s.toggleProgram)

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'major' | 'minor' | 'college'>('all')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered = useMemo(() => {
    let result = programs
    if (filter !== 'all') result = result.filter((p) => p.type === filter)
    if (query) {
      const q = query.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q))
    }
    return result
  }, [programs, query, filter])

  const selectedPrograms = programs.filter((p) => selected.includes(p.id))
  const counts = useMemo(() => ({
    all: programs.length,
    major: programs.filter((p) => p.type === 'major').length,
    minor: programs.filter((p) => p.type === 'minor').length,
    college: programs.filter((p) => p.type === 'college').length,
  }), [programs])

  return (
    <div ref={ref}>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="mono text-[9.5px] font-semibold uppercase tracking-[0.22em] text-cal-gold/80">
            Section A
          </div>
          <h3 className="serif text-[18px] font-light text-text-primary">My Programs</h3>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="group/add flex items-center gap-1.5 rounded-md border border-cal-gold/40 bg-cal-gold/[0.06] px-2.5 py-1.5 text-[11px] font-semibold text-cal-gold transition-all hover:border-cal-gold hover:bg-cal-gold/15"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover/add:rotate-90">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add
        </button>
      </div>

      {selectedPrograms.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-strong/60 bg-bg-card/30 p-4 text-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-1.5 text-text-muted/60">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
          <p className="serif text-[13px] italic text-text-secondary">No programs yet</p>
          <p className="mt-0.5 text-[10.5px] text-text-muted">Add a major or minor to get started</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {selectedPrograms.map((p) => (
            <div
              key={p.id}
              className="group/prog flex items-center justify-between gap-2 rounded-md border border-border bg-bg-card/60 px-2.5 py-2 transition-all hover:border-border-strong hover:bg-bg-card"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className={`mono text-[8.5px] font-bold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded shrink-0 ${TYPE_BADGE[p.type as keyof typeof TYPE_BADGE]}`}>
                  {p.type}
                </span>
                <span className="truncate text-[12px] font-medium text-text-primary">{p.name}</span>
              </div>
              <button
                onClick={() => toggle(p.id)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-muted opacity-0 transition-all hover:bg-wellman/15 hover:text-wellman group-hover/prog:opacity-100"
                title="Remove"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedPrograms.length > 0 && (
        <div className="mt-3 flex items-center justify-between text-[10px] text-text-muted">
          <span className="mono">{selectedPrograms.length} active</span>
          <span className="h-px flex-1 mx-3 bg-border" />
          <span>{programs.length - selectedPrograms.length} more available</span>
        </div>
      )}

      {open && createPortal((
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-slide-down flex max-h-[82vh] w-[min(100%-1rem,580px)] flex-col overflow-hidden rounded-2xl border border-cal-gold/20 bg-bg-elevated shadow-2xl shadow-black/80"
          >
            {/* HEADER */}
            <div className="relative overflow-hidden border-b border-border bg-berkeley-blue/30 px-6 py-5 parchment">
              <div className="berkeley-dots pointer-events-none absolute inset-0 opacity-15" />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="mono mb-1 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-cal-gold/85">
                    Berkeley Catalog
                  </div>
                  <h3 className="serif text-[24px] font-light text-text-primary">
                    Add a <span className="serif-italic text-cal-gold">program</span>
                  </h3>
                  <p className="mt-1 text-[12px] text-text-muted">
                    {programs.length} programs · {counts.major} majors · {counts.minor} minors · {counts.college} college
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-bg-hover hover:text-text-primary"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* SEARCH + FILTERS */}
            <div className="border-b border-border px-6 py-4">
              <div className="relative mb-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cal-gold/60">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  className="w-full rounded-lg border border-border-input bg-bg-input py-2.5 pl-10 pr-3 text-[13px] text-text-primary placeholder-text-placeholder focus:border-cal-gold/50 focus:outline-none focus:ring-2 focus:ring-cal-gold/15"
                />
              </div>
              <div className="flex gap-1 rounded-lg border border-border-input bg-bg-input p-0.5">
                {(['all', 'major', 'minor', 'college'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 rounded-md px-2.5 py-1.5 text-[11.5px] font-semibold capitalize transition-all ${
                      filter === f
                        ? 'bg-cal-gold text-bg-primary shadow-sm'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {f} <span className="mono ml-0.5 opacity-60">{counts[f]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* LIST */}
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="px-3 py-12 text-center">
                  <p className="serif text-[14px] italic text-text-muted">No programs match.</p>
                  <p className="mt-1 text-[11px] text-text-muted">Try a different keyword.</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filtered.map((p) => {
                    const isSelected = selected.includes(p.id)
                    return (
                      <button
                        key={p.id}
                        onClick={() => toggle(p.id)}
                        className={`group/item flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-all ${
                          isSelected ? 'bg-cal-gold/10 ring-1 ring-cal-gold/20' : 'hover:bg-bg-hover'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className={`mono text-[8.5px] font-bold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded shrink-0 ${TYPE_BADGE[p.type as keyof typeof TYPE_BADGE]}`}>
                            {p.type}
                          </span>
                          <span className={`truncate text-[13px] font-medium ${isSelected ? 'text-text-primary' : 'text-text-secondary group-hover/item:text-text-primary'}`}>
                            {p.name}
                          </span>
                        </div>
                        {isSelected ? (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cal-gold text-bg-primary">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        ) : (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border-strong text-text-muted opacity-0 transition-opacity group-hover/item:opacity-100">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between border-t border-border bg-bg-card/40 px-6 py-3.5">
              <div className="flex items-center gap-2">
                <span className="mono text-[10.5px] font-semibold text-cal-gold tabular-nums">
                  {selected.length}
                </span>
                <span className="text-[11px] text-text-muted">selected</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md bg-cal-gold px-4 py-1.5 text-[12px] font-semibold text-bg-primary transition-opacity hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ), document.body)}
    </div>
  )
}
