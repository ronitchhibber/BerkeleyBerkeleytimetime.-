import { useState, useRef, useEffect } from 'react'

interface DropdownProps {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  placeholder?: string
}

export default function Dropdown({ label, value, options, onChange, placeholder }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const selected = options.find((o) => o.value === value)?.label || placeholder || value

  return (
    <div ref={ref} className="relative">
      <label className="mb-1.5 block text-[13px] font-medium text-text-primary">{label}</label>
      <button onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-md border border-border-input bg-bg-input px-3 py-2.5 text-[13px] text-text-primary transition-colors hover:border-border-strong">
        <span className={`truncate ${selected === placeholder ? 'text-text-placeholder' : ''}`}>{selected}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`ml-2 shrink-0 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="animate-slide-down absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border-strong bg-bg-elevated shadow-2xl shadow-black/40">
          {options.map((opt) => (
            <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`block w-full px-3 py-2 text-left text-[13px] transition-colors ${
                opt.value === value
                  ? 'bg-accent-blue/10 text-accent-blue'
                  : 'text-text-primary hover:bg-bg-hover'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
