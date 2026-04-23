import { create } from 'zustand'
import type { Course, CoursesData, GradeRecord, EnrollmentDataPoint } from '@/types'

export interface CourseDetail {
  gradeHistory: GradeRecord[]
  enrollmentHistory: EnrollmentDataPoint[]
  enrollmentHistoryBySemester: Record<string, EnrollmentDataPoint[]>
}

interface DataState {
  courses: Course[]
  /** O(1) lookup map; rebuilt once after loadData. */
  coursesById: Map<string, Course>
  /** Per-course detail (lazy). Detail panel subscribes via selector — does not re-render the list. */
  details: Record<string, CourseDetail>
  /** In-flight detail fetches keyed by courseId. */
  inflightDetail: Map<string, Promise<void>>
  isLoading: boolean
  error: string | null
  isLoaded: boolean
  loadData: () => Promise<void>
  loadCourseDetail: (courseId: string) => Promise<void>
  getCourseById: (id: string) => Course | undefined
  getCourseDetail: (id: string) => CourseDetail | undefined
}

function deduplicateCourses(courses: Course[]): Course[] {
  const byCode = new Map<string, Course>()
  for (const course of courses) {
    const existing = byCode.get(course.code)
    if (!existing) {
      byCode.set(course.code, course)
      continue
    }
    const score = (c: Course) =>
      (c.startTime !== '00:00' ? 4 : 0) +
      (c.instructor !== 'Staff' ? 3 : 0) +
      (c.location !== 'TBA' ? 2 : 0) +
      (c.rmpRating ? 1 : 0)
    if (score(course) > score(existing)) byCode.set(course.code, course)
  }
  return [...byCode.values()]
}

export const useDataStore = create<DataState>((set, get) => ({
  courses: [],
  coursesById: new Map(),
  details: {},
  inflightDetail: new Map(),
  isLoading: false,
  error: null,
  isLoaded: false,

  loadData: async () => {
    if (get().isLoaded || get().isLoading) return
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/data/courses-summary.json')
      if (!res.ok) throw new Error(`Failed to load course data: ${res.status}`)
      const data: CoursesData = await res.json()
      const courses = deduplicateCourses(data.courses)
      const coursesById = new Map(courses.map((c) => [c.id, c]))
      set({ courses, coursesById, isLoading: false, isLoaded: true })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Unknown error', isLoading: false })
    }
  },

  loadCourseDetail: async (courseId: string) => {
    const state = get()
    if (state.details[courseId]) return
    const inflight = state.inflightDetail.get(courseId)
    if (inflight) return inflight
    const promise = (async () => {
      try {
        const res = await fetch(`/data/courses-detail/${courseId}.json`)
        if (!res.ok) throw new Error(`Failed to load detail for ${courseId}: ${res.status}`)
        const detail = (await res.json()) as CourseDetail
        set((s) => ({
          details: {
            ...s.details,
            [courseId]: {
              gradeHistory: detail.gradeHistory ?? [],
              enrollmentHistory: detail.enrollmentHistory ?? [],
              enrollmentHistoryBySemester: detail.enrollmentHistoryBySemester ?? {},
            },
          },
        }))
      } catch (e) {
        console.warn(`[dataStore] loadCourseDetail(${courseId}) failed`, e)
      } finally {
        const m = new Map(get().inflightDetail)
        m.delete(courseId)
        set({ inflightDetail: m })
      }
    })()
    const m = new Map(state.inflightDetail)
    m.set(courseId, promise)
    set({ inflightDetail: m })
    return promise
  },

  getCourseById: (id: string) => get().coursesById.get(id),
  getCourseDetail: (id: string) => get().details[id],
}))

/** Selector hook: returns detail or undefined. Does NOT trigger re-render of unrelated components. */
export function useCourseDetail(courseId: string | null | undefined): CourseDetail | undefined {
  return useDataStore((s) => (courseId ? s.details[courseId] : undefined))
}
