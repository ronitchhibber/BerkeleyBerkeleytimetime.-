import { useMemo } from 'react'
import { useDataStore } from '@/stores/dataStore'
import { useCatalogStore } from '@/stores/catalogStore'
import { useGradtrakStore } from '@/stores/gradtrakStore'
import { useDebounce } from './useDebounce'
import {
  matchesSearch,
  matchesLevel,
  matchesMajor,
  matchesUnits,
  matchesRequirements,
  matchesEnrollmentStatus,
  matchesGradingOption,
  matchesDays,
  matchesTimeRange,
  matchesRmpRating,
} from '@/utils/filterUtils'
import { buildProgramScope, matchesProgramScope } from '@/utils/programFilterUtils'
import { sortCourses } from '@/utils/sortUtils'
import type { Course } from '@/types'

export function useFilteredCourses(): Course[] {
  const courses = useDataStore((s) => s.courses)
  const searchQuery = useCatalogStore((s) => s.searchQuery)
  const sortBy = useCatalogStore((s) => s.sortBy)
  const sortDirection = useCatalogStore((s) => s.sortDirection)
  const majors = useCatalogStore((s) => s.majors)
  const classLevels = useCatalogStore((s) => s.classLevels)
  const requirements = useCatalogStore((s) => s.requirements)
  const unitsRange = useCatalogStore((s) => s.unitsRange)
  const enrollmentStatuses = useCatalogStore((s) => s.enrollmentStatuses)
  const gradingOptions = useCatalogStore((s) => s.gradingOptions)
  const selectedDays = useCatalogStore((s) => s.selectedDays)
  const timeRange = useCatalogStore((s) => s.timeRange)
  const rmpMinRating = useCatalogStore((s) => s.rmpMinRating)
  const selectedProgramId = useCatalogStore((s) => s.selectedProgramId)
  const selectedRequirementGroupId = useCatalogStore((s) => s.selectedRequirementGroupId)
  const selectedRequirementId = useCatalogStore((s) => s.selectedRequirementId)
  const programs = useGradtrakStore((s) => s.programs)

  const debouncedSearch = useDebounce(searchQuery, 300)

  // Build the program scope once per program/group/requirement change. Doing
  // it inside the filter loop would re-walk the program tree for every course.
  const programScope = useMemo(() => {
    if (!selectedProgramId) return null
    const program = programs.find((p) => p.id === selectedProgramId)
    if (!program) return null
    return buildProgramScope(program, selectedRequirementGroupId, selectedRequirementId)
  }, [programs, selectedProgramId, selectedRequirementGroupId, selectedRequirementId])

  return useMemo(() => {
    const result = courses.filter((c) => {
      if (!matchesSearch(c, debouncedSearch)) return false
      if (!matchesMajor(c, majors)) return false
      if (!matchesLevel(c, classLevels)) return false
      if (!matchesUnits(c, unitsRange)) return false
      if (!matchesRequirements(c, requirements.lsBreadth, requirements.universityReqs))
        return false
      if (!matchesEnrollmentStatus(c, enrollmentStatuses)) return false
      if (!matchesGradingOption(c, gradingOptions)) return false
      if (!matchesDays(c, selectedDays)) return false
      if (!matchesTimeRange(c, timeRange.from, timeRange.to)) return false
      if (!matchesRmpRating(c, rmpMinRating)) return false
      if (!matchesProgramScope(c.code, programScope)) return false
      return true
    })

    return sortCourses(result, sortBy, sortDirection)
  }, [
    courses,
    debouncedSearch,
    sortBy,
    sortDirection,
    majors,
    classLevels,
    requirements,
    unitsRange,
    enrollmentStatuses,
    gradingOptions,
    selectedDays,
    timeRange,
    rmpMinRating,
    programScope,
  ])
}
