import { create } from 'zustand'
import type { ClassLevel, SortOption, DetailTab } from '@/types'

interface CatalogState {
  semester: string
  searchQuery: string
  sortBy: SortOption
  sortDirection: 'asc' | 'desc'
  majors: Set<string>
  classLevels: Set<ClassLevel>
  requirements: {
    lsBreadth: Set<string>
    universityReqs: Set<string>
  }
  unitsRange: [number, number]
  enrollmentStatuses: Set<string>
  gradingOptions: Set<string>
  selectedDays: Set<string>
  timeRange: { from: string | null; to: string | null }
  // 0 = no filter; otherwise show only courses with RMP rating ≥ this number
  rmpMinRating: number

  // Curriculum scope: pick a major/minor/cert, optionally narrow to one of its
  // requirement groups (e.g. "Lower-Division Prerequisites"). Filters the
  // catalog to courses that count toward the chosen program/group.
  selectedProgramId: string | null
  selectedRequirementGroupId: string | null

  selectedCourseId: string | null
  activeDetailTab: DetailTab

  setSemester: (id: string) => void
  setSearchQuery: (q: string) => void
  setSortBy: (sort: SortOption) => void
  toggleSortDirection: () => void
  toggleMajor: (major: string) => void
  toggleClassLevel: (level: ClassLevel) => void
  toggleRequirement: (category: 'lsBreadth' | 'universityReqs', value: string) => void
  setUnitsRange: (range: [number, number]) => void
  toggleEnrollmentStatus: (status: string) => void
  toggleGradingOption: (option: string) => void
  toggleDay: (day: string) => void
  setTimeRange: (from: string | null, to: string | null) => void
  setRmpMinRating: (rating: number) => void
  setSelectedProgramId: (id: string | null) => void
  setSelectedRequirementGroupId: (id: string | null) => void
  selectCourse: (id: string | null) => void
  setActiveDetailTab: (tab: DetailTab) => void
  resetFilters: () => void
  removeFilter: (chipId: string) => void
}

const initialFilters = {
  semester: '2268',
  searchQuery: '',
  sortBy: 'relevance' as SortOption,
  sortDirection: 'desc' as const,
  majors: new Set<string>(),
  classLevels: new Set<ClassLevel>(),
  requirements: {
    lsBreadth: new Set<string>(),
    universityReqs: new Set<string>(),
  },
  unitsRange: [0, 5] as [number, number],
  enrollmentStatuses: new Set<string>(),
  gradingOptions: new Set<string>(),
  selectedDays: new Set<string>(),
  timeRange: { from: null as string | null, to: null as string | null },
  rmpMinRating: 0,
  selectedProgramId: null as string | null,
  selectedRequirementGroupId: null as string | null,
}

function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

export const useCatalogStore = create<CatalogState>((set) => ({
  ...initialFilters,
  selectedCourseId: null,
  activeDetailTab: 'Overview',

  setSemester: (id) => set({ semester: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSortBy: (sort) => set({ sortBy: sort }),
  toggleSortDirection: () =>
    set((s) => ({ sortDirection: s.sortDirection === 'asc' ? 'desc' : 'asc' })),
  toggleMajor: (major) => set((s) => ({ majors: toggleInSet(s.majors, major) })),
  toggleClassLevel: (level) =>
    set((s) => ({ classLevels: toggleInSet(s.classLevels, level) })),
  toggleRequirement: (category, value) =>
    set((s) => ({
      requirements: {
        ...s.requirements,
        [category]: toggleInSet(s.requirements[category], value),
      },
    })),
  setUnitsRange: (range) => set({ unitsRange: range }),
  toggleEnrollmentStatus: (status) =>
    set((s) => ({ enrollmentStatuses: toggleInSet(s.enrollmentStatuses, status) })),
  toggleGradingOption: (option) =>
    set((s) => ({ gradingOptions: toggleInSet(s.gradingOptions, option) })),
  toggleDay: (day) => set((s) => ({ selectedDays: toggleInSet(s.selectedDays, day) })),
  setTimeRange: (from, to) => set({ timeRange: { from, to } }),
  setRmpMinRating: (rating) => set({ rmpMinRating: rating }),
  setSelectedProgramId: (id) =>
    // Switching programs invalidates the previously-chosen group.
    set({ selectedProgramId: id, selectedRequirementGroupId: null }),
  setSelectedRequirementGroupId: (id) => set({ selectedRequirementGroupId: id }),
  selectCourse: (id) => set({ selectedCourseId: id, activeDetailTab: 'Overview' }),
  setActiveDetailTab: (tab) => set({ activeDetailTab: tab }),
  resetFilters: () => set({ ...initialFilters }),
  removeFilter: (chipId) =>
    set((s) => {
      if (chipId === 'search') return { searchQuery: '' }
      if (chipId.startsWith('major:')) {
        const v = chipId.replace('major:', '')
        const next = new Set(s.majors)
        next.delete(v)
        return { majors: next }
      }
      if (chipId.startsWith('level:')) {
        const level = chipId.replace('level:', '') as ClassLevel
        const next = new Set(s.classLevels)
        next.delete(level)
        return { classLevels: next }
      }
      if (chipId.startsWith('lsBreadth:')) {
        const val = chipId.replace('lsBreadth:', '')
        const next = new Set(s.requirements.lsBreadth)
        next.delete(val)
        return { requirements: { ...s.requirements, lsBreadth: next } }
      }
      if (chipId.startsWith('universityReqs:')) {
        const val = chipId.replace('universityReqs:', '')
        const next = new Set(s.requirements.universityReqs)
        next.delete(val)
        return { requirements: { ...s.requirements, universityReqs: next } }
      }
      if (chipId === 'units') return { unitsRange: [0, 5] as [number, number] }
      if (chipId.startsWith('enrollment:')) {
        const val = chipId.replace('enrollment:', '')
        const next = new Set(s.enrollmentStatuses)
        next.delete(val)
        return { enrollmentStatuses: next }
      }
      if (chipId.startsWith('grading:')) {
        const val = chipId.replace('grading:', '')
        const next = new Set(s.gradingOptions)
        next.delete(val)
        return { gradingOptions: next }
      }
      if (chipId.startsWith('day:')) {
        const val = chipId.replace('day:', '')
        const next = new Set(s.selectedDays)
        next.delete(val)
        return { selectedDays: next }
      }
      if (chipId === 'time') return { timeRange: { from: null, to: null } }
      if (chipId === 'rmp') return { rmpMinRating: 0 }
      // Removing the program chip drops the group too — group is meaningless without a program.
      if (chipId === 'program') return { selectedProgramId: null, selectedRequirementGroupId: null }
      if (chipId === 'requirementGroup') return { selectedRequirementGroupId: null }
      return {}
    }),
}))
