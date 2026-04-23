const DAYS = ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su']

interface DayToggleProps {
  selected: Set<string>
  onToggle: (day: string) => void
}

export default function DayToggle({ selected, onToggle }: DayToggleProps) {
  return (
    <div className="flex gap-1.5">
      {DAYS.map((day) => (
        <button key={day} onClick={() => onToggle(day)}
          className={`flex h-9 flex-1 items-center justify-center rounded-md text-[12px] font-medium transition-colors ${
            selected.has(day)
              ? 'bg-accent-blue text-white'
              : 'border border-border-input bg-bg-input text-text-secondary hover:border-border-strong hover:text-text-primary'
          }`}>
          {day}
        </button>
      ))}
    </div>
  )
}
