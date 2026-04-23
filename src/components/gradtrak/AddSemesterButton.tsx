import { useState, useRef, useEffect } from 'react'
import { useGradtrakStore } from '@/stores/gradtrakStore'
import type { SemesterTerm } from '@/types/gradtrak'

const TERMS: { value: SemesterTerm; label: string; sub: string }[] = [
  { value: 'Fall', label: 'Fall', sub: 'Aug–Dec' },
  { value: 'Spring', label: 'Spring', sub: 'Jan–May' },
  { value: 'Summer', label: 'Summer', sub: 'Jun–Aug' },
]
const YEARS = [2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028]

const TERM_DOT = {
  Fall: 'bg-medalist',
  Spring: 'bg-soybean',
  Summer: 'bg-cal-gold',
} as const

export default function AddSemesterButton() {
  const addSemester = useGradtrakStore((s) => s.addSemester)
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState<SemesterTerm>('Fall')
  const [year, setYear] = useState(2026)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  function handleAdd() {
    addSemester(term, year)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      {open ? (
        <div className="animate-slide-down overflow-hidden rounded-xl border border-cal-gold/30 bg-bg-card shadow-xl shadow-black/40">
          <div className="flex items-center justify-between border-b border-border bg-cal-gold/[0.04] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cal-gold" />
              <span className="mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cal-gold">
                New Semester
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-[11px] text-text-muted transition-colors hover:text-text-primary"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-4 p-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Term
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {TERMS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTerm(t.value)}
                    className={`group/term flex flex-col items-center justify-center rounded-md border py-2 transition-all ${
                      term === t.value
                        ? 'border-cal-gold bg-cal-gold/10'
                        : 'border-border bg-bg-input hover:border-border-strong'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`h-1 w-1 rounded-full ${TERM_DOT[t.value]} transition-opacity ${term === t.value ? 'opacity-100' : 'opacity-40'}`} />
                      <span className={`text-[12px] font-semibold ${term === t.value ? 'text-cal-gold' : 'text-text-secondary'}`}>
                        {t.label}
                      </span>
                    </div>
                    <span className="mono mt-0.5 text-[8.5px] uppercase tracking-wider text-text-muted">
                      {t.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Year
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {YEARS.map((y) => (
                  <button
                    key={y}
                    onClick={() => setYear(y)}
                    className={`mono rounded-md border py-2 text-[12px] font-semibold transition-all ${
                      year === y
                        ? 'border-cal-gold bg-cal-gold/10 text-cal-gold'
                        : 'border-border bg-bg-input text-text-secondary hover:border-border-strong'
                    }`}
                  >
                    '{String(y).slice(-2)}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAdd}
              className="group/cta relative w-full overflow-hidden rounded-md bg-cal-gold py-2.5 text-[12.5px] font-semibold text-bg-primary transition-all hover:bg-medalist"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add {term} {year}
              </span>
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="group/add flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong/60 py-4 text-[12.5px] font-medium text-text-muted transition-all hover:border-cal-gold/50 hover:bg-cal-gold/[0.03] hover:text-cal-gold"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-text-muted/40 transition-all group-hover/add:border-cal-gold group-hover/add:bg-cal-gold/10">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
          <span>Add semester</span>
        </button>
      )}
    </div>
  )
}
