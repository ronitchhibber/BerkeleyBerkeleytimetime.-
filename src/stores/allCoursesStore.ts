import { create } from 'zustand'
import { normalizeQuery } from '@/utils/subjectAliases'

export interface AllCourse {
  code: string
  title: string
  units: number
  department: string
  description: string
  level: 'lower' | 'upper' | 'graduate'
  semestersOffered: string[]
  breadths?: string[]
  universityReqs?: string[]
  prereqCodes?: string[]
  prereqText?: string
}

interface AllCoursesState {
  courses: AllCourse[]
  isLoaded: boolean
  isLoading: boolean
  loadCourses: () => Promise<void>
  searchCourses: (query: string, limit?: number) => AllCourse[]
}

export const useAllCoursesStore = create<AllCoursesState>((set, get) => ({
  courses: [],
  isLoaded: false,
  isLoading: false,

  loadCourses: async () => {
    if (get().isLoaded || get().isLoading) return
    set({ isLoading: true })
    try {
      const res = await fetch('/data/all-courses.json')
      if (!res.ok) throw new Error('Failed to load all courses')
      const data = await res.json()
      set({ courses: data.courses, isLoaded: true, isLoading: false })
    } catch (e) {
      console.error('Failed to load all courses', e)
      set({ isLoading: false })
    }
  },

  searchCourses: (query, limit = 15) => {
    const courses = get().courses
    if (!query) return courses.slice(0, limit)

    const { variants, raw } = normalizeQuery(query)
    const seen = new Set<string>()
    const results: AllCourse[] = []

    // Pass 1: exact code match against any variant (highest priority)
    for (const c of courses) {
      if (results.length >= limit) break
      const codeLower = c.code.toLowerCase()
      if (variants.some((v) => codeLower === v.toLowerCase())) {
        if (!seen.has(c.code)) {
          seen.add(c.code)
          results.push(c)
        }
      }
    }
    if (results.length >= limit) return results

    // Pass 2: code starts-with any variant or raw
    const starters = [...variants.map((v) => v.toLowerCase()), raw]
    for (const c of courses) {
      if (results.length >= limit) break
      const codeLower = c.code.toLowerCase()
      if (starters.some((s) => s && codeLower.startsWith(s))) {
        if (!seen.has(c.code)) {
          seen.add(c.code)
          results.push(c)
        }
      }
    }
    if (results.length >= limit) return results

    // Pass 3: code contains any variant or raw
    for (const c of courses) {
      if (results.length >= limit) break
      const codeLower = c.code.toLowerCase()
      if (starters.some((s) => s && codeLower.includes(s))) {
        if (!seen.has(c.code)) {
          seen.add(c.code)
          results.push(c)
        }
      }
    }
    if (results.length >= limit) return results

    // Pass 4: title contains the raw query
    for (const c of courses) {
      if (results.length >= limit) break
      if (c.title.toLowerCase().includes(raw)) {
        if (!seen.has(c.code)) {
          seen.add(c.code)
          results.push(c)
        }
      }
    }
    return results
  },
}))
