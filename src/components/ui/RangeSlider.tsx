interface RangeSliderProps {
  label: string
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  labels: string[]
}

export default function RangeSlider({ label, min, max, value, onChange, labels }: RangeSliderProps) {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    onChange([Math.min(v, value[1]), value[1]])
  }
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    onChange([value[0], Math.max(v, value[0])])
  }

  const minPct = ((value[0] - min) / (max - min)) * 100
  const maxPct = ((value[1] - min) / (max - min)) * 100

  return (
    <div>
      <label className="mb-3 block text-[13px] font-medium text-text-primary">{label}</label>

      <div className="relative h-4 px-2">
        <div className="pointer-events-none absolute inset-x-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border-strong" />
        <div
          className="pointer-events-none absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent-blue"
          style={{ left: `calc(${minPct}% * (100% - 32px) / 100% + 8px)`, right: `calc(${100 - maxPct}% * (100% - 32px) / 100% + 8px)` }}
        />
        <input type="range" min={min} max={max} step={1} value={value[0]} onChange={handleMinChange}
          className="pointer-events-none absolute inset-x-0 top-1/2 h-4 w-full -translate-y-1/2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto" />
        <input type="range" min={min} max={max} step={1} value={value[1]} onChange={handleMaxChange}
          className="pointer-events-none absolute inset-x-0 top-1/2 h-4 w-full -translate-y-1/2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto" />
      </div>

      <div className="mt-3 flex justify-between px-2">
        {labels.map((l, i) => (
          <span key={i} className="text-[11px] text-text-muted">{l}</span>
        ))}
      </div>
    </div>
  )
}
