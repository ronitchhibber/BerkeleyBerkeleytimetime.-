import { useState, useRef, useEffect, useMemo } from 'react'
import { useDataStore } from '@/stores/dataStore'
import { useCatalogStore } from '@/stores/catalogStore'

export default function MajorFilter() {
  const courses = useDataStore((s) => s.courses)
  const majors = useCatalogStore((s) => s.majors)
  const toggleMajor = useCatalogStore((s) => s.toggleMajor)

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const allMajors = useMemo(() => {
    const set = new Set<string>()
    for (const c of courses) set.add(c.code.split(' ')[0])
    return [...set].sort()
  }, [courses])

  const filtered = useMemo(() => {
    if (!query) return allMajors
    const q = query.toUpperCase()
    return allMajors.filter((m) => m.includes(q))
  }, [allMajors, query])

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setQuery('') } }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} className="relative">
      <label className="mb-1.5 block text-[13px] font-medium text-text-primary">Major</label>
      <button onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-md border border-border-input bg-bg-input px-3 py-2.5 text-[13px] text-text-primary transition-colors hover:border-border-strong">
        <span className={`truncate ${majors.size === 0 ? 'text-text-placeholder' : ''}`}>
          {majors.size === 0 ? 'All majors' : majors.size === 1 ? [...majors][0] : `${majors.size} selected`}
        </span>
        <div className="flex items-center gap-1.5">
          {majors.size > 0 && (
            <span className="mono flex h-4 min-w-[18px] items-center justify-center rounded bg-accent-blue/15 px-1 text-[10px] font-semibold text-accent-blue">
              {majors.size}
            </span>
          )}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`shrink-0 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="animate-slide-down absolute z-30 mt-1 w-full rounded-md border border-border-strong bg-bg-elevated shadow-2xl shadow-black/40">
          <div className="border-b border-border-strong p-2">
            <input
              type="text" autoFocus
              placeholder="Search majors..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mono w-full rounded bg-bg-input px-2.5 py-1.5 text-[12px] uppercase text-text-primary placeholder-text-placeholder placeholder:normal-case focus:outline-none"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-[13px] text-text-muted">No majors found</p>
            ) : (
              filtered.map((major) => (
                <label key={major} className="flex cursor-pointer items-center gap-2 px-3 py-1.5 transition-colors hover:bg-bg-hover">
                  <input
                    type="checkbox"
                    checked={majors.has(major)}
                    onChange={() => toggleMajor(major)}
                    className="h-3.5 w-3.5 rounded accent-accent-blue"
                  />
                  <span className="mono text-[12.5px] font-medium text-text-primary">{major}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
