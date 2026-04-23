import { useState, useMemo, useRef, useEffect } from 'react'
import { useDataStore } from '@/stores/dataStore'
import type { Course } from '@/types'
import { useDebounce } from '@/hooks/useDebounce'
import { normalizeQuery } from '@/utils/subjectAliases'

interface CourseSearchProps {
  selectedId: string | null
  onSelect: (course: Course) => void
  placeholder?: string
}

export default function CourseSearch({ selectedId, onSelect, placeholder = 'Search for a class...' }: CourseSearchProps) {
  const courses = useDataStore((s) => s.courses)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 200)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const results = useMemo(() => {
    if (!debouncedQuery) return courses.slice(0, 50)
    const { variants, raw } = normalizeQuery(debouncedQuery)
    return courses.filter((c) => {
      const codeLower = c.code.toLowerCase()
      if (variants.some((v) => codeLower.includes(v.toLowerCase()))) return true
      return codeLower.includes(raw) || c.title.toLowerCase().includes(raw)
    }).slice(0, 50)
  }, [courses, debouncedQuery])

  const selectedCourse = courses.find((c) => c.id === selectedId)

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={selectedCourse ? selectedCourse.code : placeholder}
          autoFocus
          className="w-full rounded-lg border border-border-input bg-bg-input py-2.5 pl-10 pr-3 text-[13.5px] text-text-primary placeholder-text-placeholder transition-colors focus:border-cal-gold/40 focus:outline-none"
        />
      </div>

      {open && results.length > 0 && (
        <div className="animate-slide-down absolute z-30 mt-1 max-h-96 w-full overflow-y-auto rounded-lg border border-border-strong bg-bg-elevated shadow-2xl shadow-black/50">
          {results.map((c) => (
            <button
              key={c.id}
              onClick={() => { onSelect(c); setQuery(''); setOpen(false) }}
              className={`flex w-full items-baseline justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-bg-hover ${
                c.id === selectedId ? 'bg-bg-selected' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="mono text-[13px] font-bold text-text-primary">{c.code}</div>
                <div className="truncate text-[12px] text-text-secondary">{c.title}</div>
              </div>
              {c.instructor !== 'Staff' && (
                <span className="shrink-0 text-[11px] text-text-muted">{c.instructor}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
