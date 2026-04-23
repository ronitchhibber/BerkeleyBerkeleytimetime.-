/**
 * Detects time conflicts between a candidate course and the user's
 * scheduled-tab classes. Used by Catalog cards to surface a clock emblem
 * on classes that would clash with anything they've added to the scheduler.
 */
import type { Course } from '@/types'
import type { ScheduledClass } from '@/stores/scheduleStore'
import { timeOverlaps } from './timeUtils'

export interface ConflictInfo {
  conflicts: boolean
  withCourse?: { code: string; sectionNumber: string }
  overlappingDays?: string[]
}

export function checkConflict(
  candidate: Course,
  scheduledClasses: ScheduledClass[],
  allCourses: Course[]
): ConflictInfo {
  if (!candidate.startTime || !candidate.endTime || !candidate.days?.length) {
    return { conflicts: false }
  }

  for (const sc of scheduledClasses) {
    if (sc.hidden) continue
    if (sc.courseId === candidate.id) continue // already in schedule, no self-conflict
    const scheduled = allCourses.find((c) => c.id === sc.courseId)
    if (!scheduled?.startTime || !scheduled?.endTime || !scheduled.days?.length) continue

    const sharedDays = candidate.days.filter((d) => scheduled.days.includes(d))
    if (sharedDays.length === 0) continue

    if (timeOverlaps(
      candidate.startTime,
      candidate.endTime,
      scheduled.startTime,
      scheduled.endTime
    )) {
      return {
        conflicts: true,
        withCourse: { code: scheduled.code, sectionNumber: scheduled.sectionNumber },
        overlappingDays: sharedDays,
      }
    }
  }

  return { conflicts: false }
}
