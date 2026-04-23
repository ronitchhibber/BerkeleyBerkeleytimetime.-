import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useScheduleStore } from '@/stores/scheduleStore'
import DayToggle from '@/components/ui/DayToggle'
import TimePicker from '@/components/ui/TimePicker'

const COLORS = [
  { name: 'Berkeley Blue', value: '#003262' },
  { name: 'Cal Gold', value: '#FDB515' },
  { name: 'Founder\'s Rock', value: '#3B7EA1' },
  { name: 'Soybean', value: '#859438' },
  { name: 'Wellman', value: '#D9661F' },
  { name: 'Lap Lane', value: '#00B0DA' },
  { name: 'Pacific', value: '#46535E' },
]

interface AddEventModalProps {
  onClose: () => void
}

export default function AddEventModal({ onClose }: AddEventModalProps) {
  const addEvent = useScheduleStore((s) => s.addEvent)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [days, setDays] = useState(new Set<string>())
  const [startTime, setStartTime] = useState<string | null>(null)
  const [endTime, setEndTime] = useState<string | null>(null)
  const [color, setColor] = useState(COLORS[2].value)

  function handleAdd() {
    if (!name || days.size === 0 || !startTime || !endTime) return
    addEvent({ name, description, days: [...days], startTime, endTime, color })
    onClose()
  }

  function toggleDay(d: string) {
    setDays((prev) => {
      const next = new Set(prev)
      if (next.has(d)) next.delete(d)
      else next.add(d)
      return next
    })
  }

  return createPortal((
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-[min(100%-1rem,440px)] max-h-[90vh] overflow-y-auto rounded-xl border border-border-strong bg-bg-elevated shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-[16px] font-semibold text-text-primary">Add a custom event</h3>
            <p className="mt-0.5 text-[12px] text-text-muted">Block off time on your weekly schedule</p>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded text-text-muted hover:bg-bg-hover hover:text-text-primary">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-text-primary">Name</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Office hours, Study session"
              autoFocus
              className="w-full rounded-md border border-border-input bg-bg-input px-3 py-2 text-[13px] text-text-primary placeholder-text-placeholder focus:border-cal-gold/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-medium text-text-primary">Repeat on</label>
            <div className="flex gap-1.5">
              <DayToggle selected={days} onToggle={toggleDay} />
            </div>
          </div>

          <div className="flex gap-3">
            <TimePicker label="From" value={startTime} onChange={setStartTime} />
            <TimePicker label="To" value={endTime} onChange={setEndTime} />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-text-primary">Description (optional)</label>
            <input
              type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a note..."
              className="w-full rounded-md border border-border-input bg-bg-input px-3 py-2 text-[13px] text-text-primary placeholder-text-placeholder focus:border-cal-gold/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-medium text-text-primary">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  title={c.name}
                  className={`h-7 w-7 rounded-md transition-all ${color === c.value ? 'ring-2 ring-offset-2 ring-offset-bg-elevated' : 'opacity-70 hover:opacity-100'}`}
                  style={{ backgroundColor: c.value, ...(color === c.value ? { boxShadow: `0 0 0 2px ${c.value}` } : {}) }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
          <button onClick={onClose} className="rounded-md px-3.5 py-1.5 text-[13px] text-text-secondary hover:text-text-primary">Cancel</button>
          <button
            onClick={handleAdd}
            disabled={!name || days.size === 0 || !startTime || !endTime}
            className="rounded-md bg-cal-gold px-3.5 py-1.5 text-[13px] font-semibold text-bg-primary transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            Add event
          </button>
        </div>
      </div>
    </div>
  ), document.body)
}
