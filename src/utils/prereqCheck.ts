/**
 * Detect prerequisite violations: a course taken in semester N whose
 * prereqCodes haven't been satisfied by any earlier semester. Returns
 * the list of missing prereqs (or empty if all OK).
 */
import type { PlannedSemester } from '@/types/gradtrak'
import { type CourseIndex, normalizeCode } from './courseIndex'

const TERM_ORDER: Record<string, number> = { Spring: 0, Summer: 1, Fall: 2 }

function semesterRank(s: PlannedSemester): number {
  return s.year * 10 + (TERM_ORDER[s.term] ?? 0)
}

export function missingPrereqsFor(
  courseCode: string,
  inSemester: PlannedSemester,
  allSemesters: PlannedSemester[],
  index: CourseIndex,
): { missing: string[]; raw: string[] } {
  const prereqs = index.prereqCodes(courseCode)
  if (prereqs.length === 0) return { missing: [], raw: [] }

  const currentRank = semesterRank(inSemester)
  const taken = new Set<string>()
  for (const sem of allSemesters) {
    if (semesterRank(sem) < currentRank) {
      for (const c of sem.courseCodes) taken.add(normalizeCode(c))
    }
  }

  const missing = prereqs.filter((p) => !taken.has(normalizeCode(p)))
  return { missing, raw: prereqs }
}
