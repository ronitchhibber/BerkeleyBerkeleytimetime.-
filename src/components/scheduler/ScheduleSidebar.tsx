import { useState } from 'react'
import { useDataStore } from '@/stores/dataStore'
import { useScheduleStore, type ScheduledClass } from '@/stores/scheduleStore'
import type { Course, Section } from '@/types'
import CourseSearch from '@/components/shared/CourseSearch'
import AddEventModal from './AddEventModal'
import { buildIcal, downloadIcal } from '@/utils/icalExport'

const DAY_LABEL: Record<string, string> = { M: 'Mon', Tu: 'Tue', W: 'Wed', Th: 'Thu', F: 'Fri', Sa: 'Sat', Su: 'Sun' }

function formatSectionTime(s: Section): string {
  if (s.startTime === '00:00') return 'TBA'
  const days = s.days.map((d) => DAY_LABEL[d] || d).join(' ')
  const t = (h: string) => {
    const [hh, mm] = h.split(':').map(Number)
    const ampm = hh >= 12 ? 'p' : 'a'
    const hr = hh % 12 || 12
    return `${hr}:${String(mm).padStart(2, '0')}${ampm}`
  }
  return `${days} · ${t(s.startTime)}–${t(s.endTime)}`
}

function SectionPicker({
  course,
  sc,
  type,
  current,
  onPick,
}: {
  course: Course
  sc: ScheduledClass
  type: 'discussion' | 'lab'
  current: string | undefined
  onPick: (sectionNumber: string | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const sections = (course.sections || []).filter((s) => s.type === type)
  if (sections.length === 0) return null
  const selected = sections.find((s) => s.sectionNumber === current)
  const label = type === 'discussion' ? 'Discussion' : 'Lab'

  return (
    <div className="mt-1.5">
      <button
        onClick={() => setOpen(!open)}
        className={`mono flex w-full items-center justify-between gap-2 rounded border px-2 py-1 text-left text-[10.5px] transition-colors ${
          selected
            ? 'border-cal-gold/30 bg-cal-gold/5 text-text-primary'
            : 'border-dashed border-border-strong/60 bg-transparent text-text-muted hover:border-cal-gold/40 hover:text-cal-gold'
        }`}
      >
        <span className="truncate">
          {selected ? (
            <>
              <span className="font-bold text-cal-gold">{selected.sectionNumber}</span>
              <span className="ml-1.5 text-text-secondary">{formatSectionTime(selected)}</span>
            </>
          ) : (
            <>+ Pick {label.toLowerCase()} <span className="text-text-muted/60">({sections.length})</span></>
          )}
        </span>
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="mt-1 max-h-44 space-y-px overflow-y-auto rounded border border-border-strong bg-bg-elevated p-1 shadow-lg" style={{ pointerEvents: 'auto' }}>
          {selected && (
            <button
              onClick={() => { onPick(undefined); setOpen(false) }}
              className="mono flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-[10px] text-wellman hover:bg-wellman/10"
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              Remove {label.toLowerCase()}
            </button>
          )}
          {sections.map((s) => {
            const isPicked = s.sectionNumber === current
            const full = s.enrolledCount >= s.capacity
            return (
              <button
                key={s.sectionNumber}
                onClick={() => { onPick(s.sectionNumber); setOpen(false) }}
                className={`flex w-full items-baseline justify-between gap-2 rounded px-1.5 py-1 text-left transition-colors ${
                  isPicked ? 'bg-cal-gold/10' : 'hover:bg-bg-hover'
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="mono text-[10.5px] font-bold text-text-primary">{s.sectionNumber}</span>
                  <span className="ml-1.5 mono text-[10px] text-text-secondary">{formatSectionTime(s)}</span>
                  {s.location !== 'Requested General Assignment' && s.location !== 'TBA' && (
                    <div className="ml-0.5 truncate text-[9.5px] text-text-muted">{s.location}</div>
                  )}
                </span>
                <span className={`mono shrink-0 text-[9px] font-bold ${full ? 'text-wellman' : 'text-soybean'}`}>
                  {s.enrolledCount}/{s.capacity}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ScheduleSidebar() {
  const classes = useScheduleStore((s) => s.classes)
  const events = useScheduleStore((s) => s.events)
  const scheduleName = useScheduleStore((s) => s.scheduleName)
  const addClass = useScheduleStore((s) => s.addClass)
  const removeClass = useScheduleStore((s) => s.removeClass)
  const removeEvent = useScheduleStore((s) => s.removeEvent)
  const toggleClassHidden = useScheduleStore((s) => s.toggleClassHidden)
  const setDiscussionSection = useScheduleStore((s) => s.setDiscussionSection)
  const setLabSection = useScheduleStore((s) => s.setLabSection)
  const getCourseById = useDataStore((s) => s.getCourseById)
  const allCourses = useDataStore((s) => s.courses)

  const [showAddClass, setShowAddClass] = useState(false)
  const [showAddEvent, setShowAddEvent] = useState(false)

  const totalUnits = classes.reduce((sum, sc) => {
    const c = getCourseById(sc.courseId)
    return sum + (c?.units || 0)
  }, 0)

  const handleExportIcal = () => {
    const ics = buildIcal({
      scheduledClasses: classes,
      scheduledEvents: events,
      courses: allCourses,
      termId: scheduleName,
    })
    const date = new Date().toISOString().slice(0, 10)
    downloadIcal(`berkeley-schedule-${date}.ics`, ics)
  }

  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col overflow-y-auto border-r border-border bg-gradient-to-b from-berkeley-blue/8 to-transparent px-6 py-6">
      <div className="mb-5 space-y-3 border-b border-cal-gold/20 pb-4">
        <span className="eyebrow">Section 01 · Roster</span>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="serif text-[22px] font-semibold leading-none tracking-tight text-text-primary">
              My <span className="serif-italic text-cal-gold">classes</span>
            </h2>
            <div className="mt-2 flex items-baseline gap-3 text-[10.5px]">
              <span className="mono font-bold uppercase tracking-[0.16em] text-text-muted">
                <span className="text-cal-gold tabular-nums">{classes.length}</span> classes
              </span>
              <span className="text-text-muted/40">·</span>
              <span className="mono font-bold uppercase tracking-[0.16em] text-text-muted">
                <span className="text-cal-gold tabular-nums">{totalUnits}</span> units
              </span>
            </div>
          </div>
          {classes.length > 0 && (
            <button
              onClick={handleExportIcal}
              title="Download .ics for Google/Apple Calendar"
              className="mono flex items-center gap-1.5 rounded-md border border-cal-gold/30 bg-cal-gold/5 px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-cal-gold transition-all hover:border-cal-gold/60 hover:bg-cal-gold/10"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <polyline points="8 14 12 18 16 14" />
              </svg>
              iCal
            </button>
          )}
        </div>
      </div>

      <div className="mb-3 space-y-2">
        {showAddClass ? (
          <div className="space-y-2">
            <CourseSearch
              selectedId={null}
              onSelect={(c) => { addClass(c.id); setShowAddClass(false) }}
              placeholder="Search classes..."
            />
            <button onClick={() => setShowAddClass(false)} className="w-full text-[12px] text-text-muted hover:text-text-secondary">Cancel</button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddClass(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-cal-gold/30 bg-cal-gold/5 py-2 text-[13px] font-medium text-cal-gold transition-colors hover:bg-cal-gold/10"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add class
          </button>
        )}

        <button
          onClick={() => setShowAddEvent(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border-strong bg-bg-card py-2 text-[13px] font-medium text-text-secondary transition-colors hover:border-cal-gold/40 hover:text-cal-gold"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add event
        </button>
      </div>

      <div className="space-y-2">
        {classes.length === 0 && events.length === 0 ? (
          <div className="relative overflow-hidden rounded-lg border border-dashed border-border-strong bg-bg-card/30 px-5 py-7 text-center">
            <div className="berkeley-dots pointer-events-none absolute inset-0 opacity-40" />
            <div className="relative">
              <p className="serif text-[16px] italic leading-tight text-text-secondary">
                Empty <span className="text-cal-gold">timetable</span>
              </p>
              <p className="mt-2 text-[11.5px] leading-relaxed text-text-muted">
                Add classes from the catalog to start composing your week.
              </p>
            </div>
          </div>
        ) : (
          <>
            {classes.map((sc) => {
              const course = getCourseById(sc.courseId)
              if (!course) return null
              const hasDiscussions = (course.sections || []).some((s) => s.type === 'discussion')
              const hasLabs = (course.sections || []).some((s) => s.type === 'lab')
              return (
                <div key={sc.courseId} className="group relative overflow-hidden rounded-md border border-border bg-bg-card px-3 py-2.5 transition-colors hover:border-border-strong">
                  <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: sc.color }} />
                  <div className="flex items-start justify-between gap-2 pl-2">
                    <div className="min-w-0 flex-1">
                      <div className="mono text-[12.5px] font-bold text-text-primary">{course.code}</div>
                      <div className="truncate text-[11.5px] text-text-secondary">{course.title}</div>
                      <div className="mt-1 flex items-center gap-2 text-[10.5px] text-text-muted">
                        <span>{course.units}u</span>
                        {course.instructor !== 'Staff' && <span>· {course.instructor}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => toggleClassHidden(sc.courseId)}
                        className="flex h-5 w-5 items-center justify-center rounded text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary"
                        title={sc.hidden ? 'Show on calendar' : 'Hide from calendar'}
                      >
                        {sc.hidden ? (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        ) : (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        )}
                      </button>
                      <button
                        onClick={() => removeClass(sc.courseId)}
                        className="flex h-5 w-5 items-center justify-center rounded text-text-muted transition-colors hover:bg-wellman/20 hover:text-wellman"
                        title="Remove from schedule"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" /></svg>
                      </button>
                    </div>
                  </div>
                  {hasDiscussions && (
                    <div className="pl-2">
                      <SectionPicker
                        course={course}
                        sc={sc}
                        type="discussion"
                        current={sc.discussionSection}
                        onPick={(s) => setDiscussionSection(sc.courseId, s)}
                      />
                    </div>
                  )}
                  {hasLabs && (
                    <div className="pl-2">
                      <SectionPicker
                        course={course}
                        sc={sc}
                        type="lab"
                        current={sc.labSection}
                        onPick={(s) => setLabSection(sc.courseId, s)}
                      />
                    </div>
                  )}
                </div>
              )
            })}

            {events.map((e) => (
              <div key={e.id} className="group relative overflow-hidden rounded-md border border-border bg-bg-card px-3 py-2.5">
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: e.color }} />
                <div className="flex items-start justify-between gap-2 pl-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-bold text-text-primary">{e.name}</div>
                    <div className="mt-0.5 text-[10.5px] text-text-muted">
                      {e.days.join('')} · {e.startTime}–{e.endTime}
                    </div>
                  </div>
                  <button
                    onClick={() => removeEvent(e.id)}
                    className="flex h-5 w-5 items-center justify-center rounded text-text-muted opacity-0 transition-opacity hover:bg-wellman/20 hover:text-wellman group-hover:opacity-100"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {showAddEvent && <AddEventModal onClose={() => setShowAddEvent(false)} />}
    </aside>
  )
}
