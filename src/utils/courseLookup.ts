/**
 * Code → metadata resolution. Backed by a CourseIndex (O(1) lookups across
 * the Fall 2026 + 12,661-course all-time catalogs).
 *
 * Older signatures took two raw arrays and did O(n) `find()` per call —
 * see the courseIndex.ts header for why that froze the gradtrak page.
 */
import type { CourseIndex } from './courseIndex'

export function lookupCourse(code: string, index: CourseIndex) {
  return index.lookup(code)
}

export function totalUnits(codes: string[], index: CourseIndex): number {
  return codes.reduce((sum, code) => sum + (index.units(code) ?? 0), 0)
}
