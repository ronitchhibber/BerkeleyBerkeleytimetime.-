import { useState, useRef, useEffect } from 'react'
import { useCatalogStore } from '@/stores/catalogStore'

const lsBreadthOptions = [
  'Arts and Literature', 'Biological Science', 'Historical Studies',
  'International Studies', 'Philosophy and Values', 'Physical Science',
  'Social and Behavioral Sciences',
]

const universityReqOptions = [
  'American History', 'American Institutions', 'American Cultures',
  'Entry Level Writing', 'Reading & Composition',
]

export default function RequirementsFilter() {
  const requirements = useCatalogStore((s) => s.requirements)
  const toggleRequirement = useCatalogStore((s) => s.toggleRequirement)

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const total = requirements.lsBreadth.size + requirements.universityReqs.size

  return (
    <div ref={ref} className="relative">
      <label className="mb-1.5 block text-[13px] font-medium text-text-primary">Requirements</label>
      <button onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-md border border-border-input bg-bg-input px-3 py-2.5 text-[13px] text-text-primary transition-colors hover:border-border-strong">
        <span className={`truncate ${total === 0 ? 'text-text-placeholder' : ''}`}>
          {total === 0 ? 'Filter by requirements' : `${total} selected`}
        </span>
        <div className="flex items-center gap-1.5">
          {total > 0 && (
            <span className="mono flex h-4 min-w-[18px] items-center justify-center rounded bg-accent-blue/15 px-1 text-[10px] font-semibold text-accent-blue">
              {total}
            </span>
          )}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`shrink-0 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="animate-slide-down absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-md border border-border-strong bg-bg-elevated shadow-2xl shadow-black/40">
          <div className="border-b border-border-strong bg-bg-card px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            L&S Breadth
          </div>
          {lsBreadthOptions.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2 px-3 py-2 text-[13px] text-text-primary transition-colors hover:bg-bg-hover">
              <input type="checkbox" checked={requirements.lsBreadth.has(opt)} onChange={() => toggleRequirement('lsBreadth', opt)}
                className="h-3.5 w-3.5 rounded accent-accent-blue" />
              <span className="truncate">{opt}</span>
            </label>
          ))}
          <div className="border-y border-border-strong bg-bg-card px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            University Requirements
          </div>
          {universityReqOptions.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2 px-3 py-2 text-[13px] text-text-primary transition-colors hover:bg-bg-hover">
              <input type="checkbox" checked={requirements.universityReqs.has(opt)} onChange={() => toggleRequirement('universityReqs', opt)}
                className="h-3.5 w-3.5 rounded accent-accent-blue" />
              <span className="truncate">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
