import { useState, useRef, useEffect } from 'react'

interface MultiSelectProps {
  label: string
  options: string[]
  selected: Set<string>
  onToggle: (value: string) => void
  placeholder?: string
}

export default function MultiSelect({ label, options, selected, onToggle, placeholder }: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const summary = selected.size === 0
    ? placeholder || `Filter by ${label.toLowerCase()}`
    : selected.size === 1 ? [...selected][0] : `${selected.size} selected`

  return (
    <div ref={ref} className="relative">
      <label className="mb-1.5 block text-[13px] font-medium text-text-primary">{label}</label>
      <button onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-md border border-border-input bg-bg-input px-3 py-2.5 text-[13px] text-text-primary transition-colors hover:border-border-strong">
        <span className={`truncate ${selected.size === 0 ? 'text-text-placeholder' : ''}`}>{summary}</span>
        <div className="flex items-center gap-1.5">
          {selected.size > 0 && (
            <span className="mono flex h-4 min-w-[18px] items-center justify-center rounded bg-accent-blue/15 px-1 text-[10px] font-semibold text-accent-blue">
              {selected.size}
            </span>
          )}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`shrink-0 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="animate-slide-down absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border-strong bg-bg-elevated shadow-2xl shadow-black/40">
          {options.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2 px-3 py-2 text-[13px] text-text-primary transition-colors hover:bg-bg-hover">
              <input type="checkbox" checked={selected.has(opt)} onChange={() => onToggle(opt)}
                className="h-3.5 w-3.5 rounded accent-accent-blue" />
              <span className="truncate">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
