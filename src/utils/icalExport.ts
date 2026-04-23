/**
 * Generate an iCalendar (.ics) file from the user's scheduled classes.
 * Compatible with Google Calendar, Apple Calendar, Outlook.
 *
 * Berkeley class meetings repeat weekly during the term. We emit one
 * VEVENT per class with a weekly RRULE bounded by the term's end date.
 */
import type { Course } from '@/types'
import type { ScheduledClass, ScheduledEvent } from '@/stores/scheduleStore'

// Berkeley Fall 2026 academic calendar (defaults; could pull from API later)
const TERM_BOUNDS: Record<string, { start: string; end: string }> = {
  'fall26': { start: '2026-08-26', end: '2026-12-11' },
  'fall25': { start: '2025-08-27', end: '2025-12-12' },
  'spring26': { start: '2026-01-20', end: '2026-05-08' },
}

const DAY_TO_ICAL: Record<string, string> = {
  M: 'MO',
  Tu: 'TU',
  T: 'TU', // some legacy data uses T
  W: 'WE',
  Th: 'TH',
  F: 'FR',
  Sa: 'SA',
  Su: 'SU',
}

function pad(n: number): string {
  return n < 10 ? '0' + n : String(n)
}

function escape(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')
}

function dateOnDay(startDate: string, dayCode: string): Date {
  // startDate is YYYY-MM-DD. Find the first instance of dayCode on or after startDate.
  const target = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'].indexOf(dayCode)
  if (target < 0) return new Date(startDate)
  const d = new Date(startDate + 'T12:00:00')
  while (d.getDay() !== target) d.setDate(d.getDate() + 1)
  return d
}

function formatDateTime(d: Date, time: string): string {
  // time is HH:MM 24-hour. Returns YYYYMMDDTHHMMSS (floating, no Z) in PST (Berkeley)
  const [h, m] = time.split(':').map(Number)
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(h)}${pad(m)}00`
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
}

interface BuildOptions {
  scheduledClasses: ScheduledClass[]
  scheduledEvents: ScheduledEvent[]
  courses: Course[]
  termId?: string
}

export function buildIcal({ scheduledClasses, scheduledEvents, courses, termId = 'fall26' }: BuildOptions): string {
  const term = TERM_BOUNDS[termId] || TERM_BOUNDS['fall26']
  const untilDate = formatDate(new Date(term.end + 'T23:59:59')) + 'T235959'
  const now = new Date()
  const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`

  const events: string[] = []

  // Class meetings
  for (const sc of scheduledClasses) {
    if (sc.hidden) continue
    const c = courses.find((cc) => cc.id === sc.courseId)
    if (!c?.startTime || !c?.endTime || !c.days?.length) continue

    // Pick the earliest day in the week to anchor DTSTART
    const firstDay = ['M', 'Tu', 'W', 'Th', 'F'].find((d) => c.days.includes(d)) || c.days[0]
    const anchorDate = dateOnDay(term.start, firstDay)
    const dtstart = formatDateTime(anchorDate, c.startTime)
    const dtend = formatDateTime(anchorDate, c.endTime)
    const byday = c.days.map((d) => DAY_TO_ICAL[d]).filter(Boolean).join(',')

    events.push([
      'BEGIN:VEVENT',
      `UID:${sc.courseId}@berkeleytime.local`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;TZID=America/Los_Angeles:${dtstart}`,
      `DTEND;TZID=America/Los_Angeles:${dtend}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${byday};UNTIL=${untilDate}Z`,
      `SUMMARY:${escape(c.code)} ${escape(c.sectionNumber || '')}`.trim(),
      `DESCRIPTION:${escape(c.title)}${c.instructor ? `\\n\\nInstructor: ${escape(c.instructor)}` : ''}${c.units ? `\\nUnits: ${c.units}` : ''}`,
      ...(c.location ? [`LOCATION:${escape(c.location)}`] : []),
      'END:VEVENT',
    ].join('\r\n'))
  }

  // Custom events (study sessions, etc.)
  for (const ev of scheduledEvents) {
    if (!ev.startTime || !ev.endTime || !ev.days?.length) continue
    const firstDay = ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'].find((d) => ev.days.includes(d)) || ev.days[0]
    const anchorDate = dateOnDay(term.start, firstDay)
    const dtstart = formatDateTime(anchorDate, ev.startTime)
    const dtend = formatDateTime(anchorDate, ev.endTime)
    const byday = ev.days.map((d) => DAY_TO_ICAL[d]).filter(Boolean).join(',')
    events.push([
      'BEGIN:VEVENT',
      `UID:${ev.id}@berkeleytime.local`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;TZID=America/Los_Angeles:${dtstart}`,
      `DTEND;TZID=America/Los_Angeles:${dtend}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${byday};UNTIL=${untilDate}Z`,
      `SUMMARY:${escape(ev.name)}`,
      ...(ev.description ? [`DESCRIPTION:${escape(ev.description)}`] : []),
      'END:VEVENT',
    ].join('\r\n'))
  }

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Berkeleytime//Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Berkeley Schedule',
    'X-WR-TIMEZONE:America/Los_Angeles',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadIcal(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
