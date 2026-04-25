/**
 * Memoized O(1) course index assembled from the two course catalogs.
 *
 * Rebuilds only when the course arrays' identity changes (loaded once at
 * app start, then ~never). Every gradtrak path that resolves a course code
 * should pull this hook instead of touching the raw arrays.
 */
import { useMemo } from 'react'
import { useDataStore } from '@/stores/dataStore'
import { useAllCoursesStore } from '@/stores/allCoursesStore'
import { buildCourseIndex, type CourseIndex } from '@/utils/courseIndex'

export function useCourseIndex(): CourseIndex {
  const allCourses = useDataStore((s) => s.courses)
  const catalogCourses = useAllCoursesStore((s) => s.courses)
  return useMemo(
    () => buildCourseIndex(allCourses, catalogCourses),
    [allCourses, catalogCourses],
  )
}
