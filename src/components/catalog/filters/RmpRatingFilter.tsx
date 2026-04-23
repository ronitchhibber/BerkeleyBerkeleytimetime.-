import { useCatalogStore } from '@/stores/catalogStore'

const OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'Any' },
  { value: 1, label: '> 1' },
  { value: 2, label: '> 2' },
  { value: 3, label: '> 3' },
  { value: 3.5, label: '> 3.5' },
  { value: 4, label: '> 4' },
  { value: 4.5, label: '> 4.5' },
  { value: 5, label: '5' },
]

export default function RmpRatingFilter() {
  const rmpMinRating = useCatalogStore((s) => s.rmpMinRating)
  const setRmpMinRating = useCatalogStore((s) => s.setRmpMinRating)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-[13px] font-medium text-text-primary">Rate My Professor</label>
        {rmpMinRating > 0 && (
          <button
            onClick={() => setRmpMinRating(0)}
            className="text-[10px] text-text-muted hover:text-cal-gold"
          >
            clear
          </button>
        )}
      </div>
      <div className="grid grid-cols-4 gap-1">
        {OPTIONS.map((opt) => {
          const active = rmpMinRating === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => setRmpMinRating(opt.value)}
              className={`mono rounded px-1 py-1.5 text-[11px] font-semibold transition-all ${
                active
                  ? 'bg-cal-gold text-bg-primary shadow-sm'
                  : 'border border-border-input bg-bg-input text-text-secondary hover:border-cal-gold/40 hover:text-text-primary'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
