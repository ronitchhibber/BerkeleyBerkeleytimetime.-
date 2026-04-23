import { useMemo } from 'react'
import { useDataStore } from '@/stores/dataStore'
import { useScheduleStore } from '@/stores/scheduleStore'
import { formatTime, timeToMinutes } from '@/utils/timeUtils'

const DAYS = [
  { key: 'M', label: 'Monday' },
  { key: 'Tu', label: 'Tuesday' },
  { key: 'W', label: 'Wednesday' },
  { key: 'Th', label: 'Thursday' },
  { key: 'F', label: 'Friday' },
]

const START_HOUR = 8
const END_HOUR = 22
const HOUR_HEIGHT = 56

interface Block {
  day: string
  startTime: string
  endTime: string
  title: string
  subtitle: string
  color: string
  isEvent?: boolean
}

export default function WeeklyCalendar() {
  const classes = useScheduleStore((s) => s.classes)
  const events = useScheduleStore((s) => s.events)
  const getCourseById = useDataStore((s) => s.getCourseById)

  const blocks = useMemo(() => {
    const blocks: Block[] = []
    for (const sc of classes) {
      if (sc.hidden) continue
      const course = getCourseById(sc.courseId)
      if (!course) continue
      // Lecture
      if (course.startTime !== '00:00') {
        for (const day of course.days) {
          if (!DAYS.find((d) => d.key === day)) continue
          blocks.push({
            day,
            startTime: course.startTime,
            endTime: course.endTime,
            title: course.code,
            subtitle: course.location,
            color: sc.color,
          })
        }
      }
      // Discussion
      if (sc.discussionSection) {
        const dis = course.sections?.find((s) => s.sectionNumber === sc.discussionSection)
        if (dis && dis.startTime !== '00:00') {
          for (const day of dis.days) {
            if (!DAYS.find((d) => d.key === day)) continue
            blocks.push({
              day,
              startTime: dis.startTime,
              endTime: dis.endTime,
              title: `${course.code} ${dis.sectionNumber}`,
              subtitle: dis.location,
              color: sc.color,
            })
          }
        }
      }
      // Lab
      if (sc.labSection) {
        const lab = course.sections?.find((s) => s.sectionNumber === sc.labSection)
        if (lab && lab.startTime !== '00:00') {
          for (const day of lab.days) {
            if (!DAYS.find((d) => d.key === day)) continue
            blocks.push({
              day,
              startTime: lab.startTime,
              endTime: lab.endTime,
              title: `${course.code} ${lab.sectionNumber}`,
              subtitle: lab.location,
              color: sc.color,
            })
          }
        }
      }
    }
    for (const e of events) {
      for (const day of e.days) {
        if (!DAYS.find((d) => d.key === day)) continue
        blocks.push({
          day,
          startTime: e.startTime,
          endTime: e.endTime,
          title: e.name,
          subtitle: e.description || '',
          color: e.color,
          isEvent: true,
        })
      }
    }
    return blocks
  }, [classes, events, getCourseById])

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

  function blockStyle(b: Block): React.CSSProperties {
    const startMin = timeToMinutes(b.startTime) - START_HOUR * 60
    const endMin = timeToMinutes(b.endTime) - START_HOUR * 60
    const top = (startMin / 60) * HOUR_HEIGHT
    const height = ((endMin - startMin) / 60) * HOUR_HEIGHT
    return { top: `${top}px`, height: `${height}px` }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-bg-primary">
      <div className="flex border-b border-border bg-bg-card/30">
        <div className="w-16 shrink-0" />
        {DAYS.map((day) => (
          <div key={day.key} className="flex-1 border-l border-border px-3 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-cal-gold/80">{day.label.slice(0, 3)}</div>
            <div className="mono text-[16px] font-bold text-text-primary">{day.label}</div>
          </div>
        ))}
      </div>

      <div className="relative flex-1 overflow-y-auto">
        <div className="relative flex">
          <div className="w-16 shrink-0">
            {hours.map((h) => (
              <div key={h} className="relative" style={{ height: HOUR_HEIGHT }}>
                <span className="mono absolute -top-2 right-2 text-[10px] text-text-muted">
                  {h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`}
                </span>
              </div>
            ))}
          </div>

          {DAYS.map((day) => {
            const dayBlocks = blocks.filter((b) => b.day === day.key)
            return (
              <div key={day.key} className="relative flex-1 border-l border-border">
                {hours.map((h) => (
                  <div key={h} className="border-b border-border/40" style={{ height: HOUR_HEIGHT }} />
                ))}
                {dayBlocks.map((b, i) => (
                  <div
                    key={i}
                    style={{ ...blockStyle(b), backgroundColor: `${b.color}25`, borderColor: b.color }}
                    className="absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1.5 transition-all hover:z-10 hover:shadow-lg"
                  >
                    <div className="mono text-[11px] font-bold text-text-primary">{b.title}</div>
                    <div className="mt-0.5 text-[10px] text-text-secondary">
                      {formatTime(b.startTime)} – {formatTime(b.endTime)}
                    </div>
                    {b.subtitle && (
                      <div className="mt-0.5 truncate text-[10px] text-text-muted">{b.subtitle}</div>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
