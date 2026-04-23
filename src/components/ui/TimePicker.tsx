interface TimePickerProps {
  label: string
  value: string | null
  onChange: (value: string | null) => void
}

export default function TimePicker({ label, value, onChange }: TimePickerProps) {
  return (
    <div className="flex-1">
      <label className="mb-1.5 block text-[12px] font-medium text-text-secondary">{label}</label>
      <input
        type="time"
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        placeholder="--:--"
        className="w-full rounded-md border border-border-input bg-bg-input px-3 py-2 text-[13px] text-text-primary transition-colors focus:border-accent-blue/40 focus:outline-none"
      />
    </div>
  )
}
