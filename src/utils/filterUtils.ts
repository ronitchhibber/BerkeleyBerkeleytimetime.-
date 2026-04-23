import type { Course, ClassLevel } from '@/types'
import { timeOverlaps } from './timeUtils'
import { normalizeQuery } from './subjectAliases'

export function matchesRmpRating(course: Course, minRating: number): boolean {
  if (minRating === 0) return true
  const rating = course.rmpRating?.avgRating
  if (rating == null) return false
  if (minRating === 5) return rating === 5
  return rating > minRating
}

export function matchesSearch(course: Course, query: string): boolean {
  if (!query) return true
  const { variants, raw } = normalizeQuery(query)
  const codeLower = course.code.toLowerCase()
  // Match if any alias-resolved variant matches the code (exact, prefix, or contains),
  // or the raw query appears in the title/description.
  if (variants.some((v) => codeLower.includes(v.toLowerCase()))) return true
  return (
    codeLower.includes(raw) ||
    course.title.toLowerCase().includes(raw) ||
    course.description.toLowerCase().includes(raw)
  )
}

export function matchesLevel(course: Course, levels: Set<ClassLevel>): boolean {
  if (levels.size === 0) return true
  return levels.has(course.level)
}

export function matchesMajor(course: Course, majors: Set<string>): boolean {
  if (majors.size === 0) return true
  const subject = course.code.split(' ')[0]
  return majors.has(subject)
}

export function matchesUnits(course: Course, range: [number, number]): boolean {
  const [min, max] = range
  if (min === 0 && max === 5) return true
  if (max === 5) return course.units >= min
  return course.units >= min && course.units <= max
}

export function matchesRequirements(
  course: Course,
  lsBreadth: Set<string>,
  universityReqs: Set<string>
): boolean {
  if (lsBreadth.size === 0 && universityReqs.size === 0) return true
  const matchesLs =
    lsBreadth.size === 0 || course.requirements.lsBreadth.some((r) => lsBreadth.has(r))
  const matchesUni =
    universityReqs.size === 0 ||
    course.requirements.universityReqs.some((r) => universityReqs.has(r))
  return matchesLs && matchesUni
}

export function matchesEnrollmentStatus(course: Course, statuses: Set<string>): boolean {
  if (statuses.size === 0) return true
  if (statuses.has('Open Seats (Non-Reserved)')) {
    if (course.enrolledCount < course.enrollmentCapacity && !course.hasReservedSeating) return true
  }
  if (statuses.has('Open Seats')) {
    if (course.enrolledCount < course.enrollmentCapacity) return true
  }
  if (statuses.has('Open Wait List')) {
    if (course.waitlistCount > 0) return true
  }
  return false
}

export function matchesGradingOption(course: Course, options: Set<string>): boolean {
  if (options.size === 0) return true
  const map: Record<string, string> = {
    'Letter Graded': 'letter',
    'Pass/Not Pass': 'pnp',
    'Satisfactory/Unsatisfactory': 'satisfactory',
  }
  for (const opt of options) {
    if (map[opt] === course.gradingOption) return true
  }
  return false
}

export function matchesDays(course: Course, selectedDays: Set<string>): boolean {
  if (selectedDays.size === 0) return true
  return course.days.some((d) => selectedDays.has(d))
}

export function matchesTimeRange(
  course: Course,
  from: string | null,
  to: string | null
): boolean {
  if (!from && !to) return true
  return timeOverlaps(
    course.startTime,
    course.endTime,
    from || '00:00',
    to || '23:59'
  )
}
