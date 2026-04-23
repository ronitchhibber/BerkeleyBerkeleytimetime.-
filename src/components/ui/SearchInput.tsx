interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  return (
    <div className="relative">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoFocus
        className="w-full rounded-lg border border-border-input bg-bg-input py-2.5 pl-11 pr-11 text-[13.5px] text-text-primary placeholder-text-placeholder transition-colors focus:border-accent-blue/40 focus:outline-none focus:ring-1 focus:ring-accent-blue/20" />
      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-blue/60 transition-colors hover:text-accent-blue" title="AI search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 1l1.5 4.5L15 7l-4.5 1.5L9 13 7.5 8.5 3 7l4.5-1.5L9 1zm9 11l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
        </svg>
      </button>
    </div>
  )
}
