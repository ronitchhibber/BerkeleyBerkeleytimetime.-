import { useEffect, useState } from 'react'
import { useDataStore } from '@/stores/dataStore'
import { useScheduleStore } from '@/stores/scheduleStore'
import ScheduleSidebar from '@/components/scheduler/ScheduleSidebar'
import WeeklyCalendar from '@/components/scheduler/WeeklyCalendar'
import { buildIcal, downloadIcal } from '@/utils/icalExport'

export default function SchedulerPage() {
  const loadData = useDataStore((s) => s.loadData)
  const isLoading = useDataStore((s) => s.isLoading)
  const scheduleName = useScheduleStore((s) => s.scheduleName)
  const setScheduleName = useScheduleStore((s) => s.setScheduleName)
  const clearAll = useScheduleStore((s) => s.clearAll)
  const classes = useScheduleStore((s) => s.classes)
  const events = useScheduleStore((s) => s.events)
  const allCourses = useDataStore((s) => s.courses)

  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState(scheduleName)
  const [copiedShare, setCopiedShare] = useState(false)

  useEffect(() => { loadData() }, [loadData])

  const handleExport = () => {
    if (classes.length === 0) {
      alert('No classes to export. Add some classes first.')
      return
    }
    const ics = buildIcal({ scheduledClasses: classes, scheduledEvents: events, courses: allCourses, termId: scheduleName })
    const date = new Date().toISOString().slice(0, 10)
    downloadIcal(`berkeley-schedule-${date}.ics`, ics)
  }

  const handleShare = async () => {
    const data = { v: 1, n: scheduleName, c: classes.map((c) => c.courseId), e: events }
    const json = JSON.stringify(data)
    const b64 = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    const url = `${window.location.origin}/scheduler#schedule=${b64}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedShare(true)
      setTimeout(() => setCopiedShare(false), 1800)
    } catch {
      window.prompt('Copy this URL:', url)
    }
  }

  if (isLoading) return <div className="flex h-full items-center justify-center"><p className="text-[13px] text-text-muted">Loading…</p></div>

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex items-center justify-between border-b border-border bg-gradient-to-b from-berkeley-blue/12 to-transparent px-7 pb-4 pt-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cal-gold/35 to-transparent" />

        <div className="flex items-baseline gap-5">
          <div className="flex flex-col">
            <span className="eyebrow">Section 02 · Build</span>
            <div className="mt-2 flex items-baseline gap-3">
              <h1 className="serif text-[26px] font-semibold leading-none tracking-tight text-text-primary">
                Weekly <span className="serif-italic text-cal-gold">timetable</span>
              </h1>
              <span className="mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                Fall 2026
              </span>
            </div>
          </div>

          <div className="ml-2 hidden items-center gap-2 border-l border-border-gold/40 pl-5 md:flex">
            {editingName ? (
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={() => { setScheduleName(tempName || 'untitled'); setEditingName(false) }}
                onKeyDown={(e) => { if (e.key === 'Enter') { setScheduleName(tempName || 'untitled'); setEditingName(false) } }}
                autoFocus
                className="mono rounded border border-cal-gold/40 bg-bg-input px-2 py-0.5 text-[13px] font-semibold text-text-primary focus:outline-none"
              />
            ) : (
              <button
                onClick={() => { setTempName(scheduleName); setEditingName(true) }}
                className="mono group flex items-center gap-1.5 text-[12.5px] text-text-muted transition-colors hover:text-cal-gold"
                title="Rename schedule"
              >
                <span className="text-text-muted/70">file:</span>
                <span className="font-semibold text-text-secondary">{scheduleName}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-0 transition-opacity group-hover:opacity-60">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={clearAll}
            className="mono rounded-md px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-text-muted transition-colors hover:bg-wellman/10 hover:text-wellman"
          >
            Clear
          </button>
          <button
            onClick={handleExport}
            title="Download .ics for Google/Apple Calendar"
            className="mono rounded-md px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
          >
            Export ↓
          </button>
          <button
            onClick={handleShare}
            title="Copy a sharable link to this schedule"
            className="mono ml-1 rounded-md bg-cal-gold px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-bg-primary shadow-[0_0_18px_-4px_rgba(253,181,21,0.5)] transition-all hover:shadow-[0_0_24px_-2px_rgba(253,181,21,0.7)]"
          >
            {copiedShare ? '✓ Copied' : 'Share →'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <ScheduleSidebar />
        <div className="min-w-0 flex-1">
          <WeeklyCalendar />
        </div>
      </div>
    </div>
  )
}
