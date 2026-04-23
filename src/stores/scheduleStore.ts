import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ScheduledClass {
  courseId: string
  color: string
  hidden?: boolean
  /** Section number of the chosen discussion (e.g. "DIS 102"). Undefined until user picks one. */
  discussionSection?: string
  /** Section number of the chosen lab (e.g. "LAB 101L"). Undefined until user picks one. */
  labSection?: string
}

export interface ScheduledEvent {
  id: string
  name: string
  description?: string
  days: string[]
  startTime: string
  endTime: string
  color: string
}

interface ScheduleState {
  scheduleName: string
  classes: ScheduledClass[]
  events: ScheduledEvent[]
  setScheduleName: (name: string) => void
  addClass: (courseId: string) => void
  removeClass: (courseId: string) => void
  toggleClassHidden: (courseId: string) => void
  setDiscussionSection: (courseId: string, sectionNumber: string | undefined) => void
  setLabSection: (courseId: string, sectionNumber: string | undefined) => void
  addEvent: (event: Omit<ScheduledEvent, 'id'>) => void
  removeEvent: (id: string) => void
  clearAll: () => void
}

const COLOR_PALETTE = [
  '#3B7EA1', // Founder's Rock blue
  '#FDB515', // Cal Gold
  '#859438', // Soybean
  '#D9661F', // Wellman
  '#00B0DA', // Lap Lane
  '#bc8cff', // purple
  '#ec4899', // pink
  '#46535E', // Pacific
]

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      scheduleName: 'fall26',
      classes: [],
      events: [],

      setScheduleName: (name) => set({ scheduleName: name }),

      addClass: (courseId) => {
        const { classes } = get()
        if (classes.find((c) => c.courseId === courseId)) return
        const color = COLOR_PALETTE[classes.length % COLOR_PALETTE.length]
        set({ classes: [...classes, { courseId, color }] })
      },

      removeClass: (courseId) =>
        set((s) => ({ classes: s.classes.filter((c) => c.courseId !== courseId) })),

      toggleClassHidden: (courseId) =>
        set((s) => ({
          classes: s.classes.map((c) =>
            c.courseId === courseId ? { ...c, hidden: !c.hidden } : c
          ),
        })),

      setDiscussionSection: (courseId, sectionNumber) =>
        set((s) => ({
          classes: s.classes.map((c) =>
            c.courseId === courseId ? { ...c, discussionSection: sectionNumber } : c
          ),
        })),

      setLabSection: (courseId, sectionNumber) =>
        set((s) => ({
          classes: s.classes.map((c) =>
            c.courseId === courseId ? { ...c, labSection: sectionNumber } : c
          ),
        })),

      addEvent: (event) =>
        set((s) => ({ events: [...s.events, { ...event, id: crypto.randomUUID() }] })),

      removeEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

      clearAll: () => set({ classes: [], events: [] }),
    }),
    { name: 'berkeleytime-schedule' }
  )
)
