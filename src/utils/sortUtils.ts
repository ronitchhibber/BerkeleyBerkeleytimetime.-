import type { Course, SortOption } from '@/types'

type Comparator = (a: Course, b: Course) => number

const comparators: Record<SortOption, Comparator> = {
  relevance: () => 0,
  grade: (a, b) => b.averageGPA - a.averageGPA,
  enrolled: (a, b) => b.enrollmentPercent - a.enrollmentPercent,
  units: (a, b) => a.units - b.units,
  number: (a, b) => {
    const numA = parseInt(a.code.replace(/\D/g, '')) || 0
    const numB = parseInt(b.code.replace(/\D/g, '')) || 0
    return numA - numB
  },
  department: (a, b) => a.department.localeCompare(b.department),
  rmp: (a, b) => (b.rmpRating?.avgRating ?? -1) - (a.rmpRating?.avgRating ?? -1),
}

export function sortCourses(
  courses: Course[],
  sortBy: SortOption,
  direction: 'asc' | 'desc'
): Course[] {
  if (sortBy === 'relevance') return courses
  const cmp = comparators[sortBy]
  const sorted = [...courses].sort(cmp)
  return direction === 'asc' ? sorted.reverse() : sorted
}
