/**
 * Detect prerequisite violations: a course taken in semester N whose
 * prereqCodes haven't been satisfied by any earlier semester. Returns
 * the list of missing prereqs (or empty if all OK).
 */
import type { PlannedSemester } from '@/types/gradtrak'
import type { AllCourse } from '@/stores/allCoursesStore'

const TERM_ORDER: Record<string, number> = { Spring: 0, Summer: 1, Fall: 2 }

function semesterRank(s: PlannedSemester): number {
  return s.year * 10 + (TERM_ORDER[s.term] ?? 0)
}

function normalize(code: string): string {
  return code.replace(/\s+/g, ' ').trim().toUpperCase()
}

export function missingPrereqsFor(
  courseCode: string,
  inSemester: PlannedSemester,
  allSemesters: PlannedSemester[],
  catalogCourses: AllCourse[]
): { missing: string[]; raw: string[] } {
  const course = catalogCourses.find((c) => normalize(c.code) === normalize(courseCode))
  const prereqs = course?.prereqCodes || []
  if (prereqs.length === 0) return { missing: [], raw: [] }

  const currentRank = semesterRank(inSemester)
  // All courses taken BEFORE this semester (strictly earlier rank)
  const taken = new Set<string>()
  for (const sem of allSemesters) {
    if (semesterRank(sem) < currentRank) {
      for (const c of sem.courseCodes) taken.add(normalize(c))
    }
  }

  const missing = prereqs.filter((p) => !taken.has(normalize(p)))
  return { missing, raw: prereqs }
}
