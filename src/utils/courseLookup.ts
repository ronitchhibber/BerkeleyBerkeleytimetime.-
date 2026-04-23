/**
 * Resolve a course code → metadata, preferring the rich Fall 2026 store
 * but falling back to the 12,661-course all-time catalog.
 */
import type { Course } from '@/types'
import type { AllCourse } from '@/stores/allCoursesStore'

export function lookupCourse(
  code: string,
  allCourses: Course[],
  catalogCourses: AllCourse[]
): { title: string; units: number } | undefined {
  const c = allCourses.find((x) => x.code === code)
  if (c) return { title: c.title, units: c.units }
  const a = catalogCourses.find((x) => x.code === code)
  return a ? { title: a.title, units: a.units } : undefined
}

export function totalUnits(
  codes: string[],
  allCourses: Course[],
  catalogCourses: AllCourse[]
): number {
  return codes.reduce((sum, code) => sum + (lookupCourse(code, allCourses, catalogCourses)?.units ?? 0), 0)
}
