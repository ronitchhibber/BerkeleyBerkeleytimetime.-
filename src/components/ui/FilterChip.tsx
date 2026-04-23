interface FilterChipProps {
  label: string
  onRemove: () => void
}

export default function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="animate-fade-in inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-bg-card px-3 py-1 text-[12.5px] font-medium text-text-primary">
      {label}
      <button
        onClick={onRemove}
        className="flex h-4 w-4 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-accent-red/20 hover:text-accent-red"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </span>
  )
}
