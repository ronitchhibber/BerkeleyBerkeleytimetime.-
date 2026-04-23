import DayToggle from '@/components/ui/DayToggle'
import TimePicker from '@/components/ui/TimePicker'
import { useCatalogStore } from '@/stores/catalogStore'

export default function DateTimeFilter() {
  const selectedDays = useCatalogStore((s) => s.selectedDays)
  const timeRange = useCatalogStore((s) => s.timeRange)
  const toggleDay = useCatalogStore((s) => s.toggleDay)
  const setTimeRange = useCatalogStore((s) => s.setTimeRange)

  return (
    <div>
      <label className="mb-3 block text-[13px] font-medium text-text-primary">Date and Time</label>
      <DayToggle selected={selectedDays} onToggle={toggleDay} />
      <div className="mt-3 flex gap-3">
        <TimePicker label="From" value={timeRange.from} onChange={(v) => setTimeRange(v, timeRange.to)} />
        <TimePicker label="To" value={timeRange.to} onChange={(v) => setTimeRange(timeRange.from, v)} />
      </div>
    </div>
  )
}
