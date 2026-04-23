import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PlannedSemester, Program, ProgramsData, SemesterTerm } from '@/types/gradtrak'

/**
 * A named scenario the user can save + switch between, e.g. "CS major" vs
 * "CS major + DS minor". All audit-driving state lives per-plan.
 */
export interface Plan {
  id: string
  name: string
  selectedProgramIds: string[]
  semesters: PlannedSemester[]
  /** `${programId}:${requirementId}` → true means "I've completed this manually". */
  manualOverrides: Record<string, boolean>
}

interface GradtrakState {
  plans: Plan[]
  activePlanId: string

  // Proxy of the active plan's fields so consumers can read s.semesters etc.
  // without resolving the plan themselves. Kept in sync via withActivePlan().
  selectedProgramIds: string[]
  semesters: PlannedSemester[]
  manualOverrides: Record<string, boolean>

  programs: Program[]
  programsLoaded: boolean

  createPlan: (name: string) => void
  renamePlan: (id: string, name: string) => void
  deletePlan: (id: string) => void
  setActivePlan: (id: string) => void
  duplicatePlan: (id: string) => void

  loadPrograms: () => Promise<void>
  toggleProgram: (id: string) => void
  addSemester: (term: SemesterTerm, year: number) => void
  removeSemester: (id: string) => void
  addCourseToSemester: (semesterId: string, courseCode: string) => void
  removeCourseFromSemester: (semesterId: string, courseCode: string) => void
  toggleOverride: (programId: string, requirementId: string) => void
  clearAll: () => void
}

const SEM_ORDER: Record<SemesterTerm, number> = { Spring: 0, Summer: 1, Fall: 2 }
const DEFAULT_PLAN_ID = 'default'

const sortSemesters = (s: PlannedSemester[]): PlannedSemester[] =>
  [...s].sort((a, b) => (a.year - b.year) || (SEM_ORDER[a.term] - SEM_ORDER[b.term]))

const emptyPlan = (id: string, name: string): Plan => ({
  id, name, selectedProgramIds: [], semesters: [], manualOverrides: {},
})

const proxyOf = (active: Plan) => ({
  selectedProgramIds: active.selectedProgramIds,
  semesters: active.semesters,
  manualOverrides: active.manualOverrides,
})

/** Mutate the active plan in-place and re-sync the proxy fields. */
function withActivePlan(get: () => GradtrakState, mutate: (plan: Plan) => Plan) {
  const state = get()
  const newPlans = state.plans.map((p) => (p.id === state.activePlanId ? mutate(p) : p))
  const active = newPlans.find((p) => p.id === state.activePlanId) || newPlans[0]
  return { plans: newPlans, ...proxyOf(active) }
}

export const useGradtrakStore = create<GradtrakState>()(
  persist(
    (set, get) => ({
      plans: [emptyPlan(DEFAULT_PLAN_ID, 'My Plan')],
      activePlanId: DEFAULT_PLAN_ID,
      ...proxyOf(emptyPlan(DEFAULT_PLAN_ID, 'My Plan')),
      programs: [],
      programsLoaded: false,

      createPlan: (name) => {
        const id = crypto.randomUUID()
        const plan = emptyPlan(id, name || `Plan ${get().plans.length + 1}`)
        set((s) => ({ plans: [...s.plans, plan], activePlanId: id, ...proxyOf(plan) }))
      },

      renamePlan: (id, name) =>
        set((s) => ({ plans: s.plans.map((p) => (p.id === id ? { ...p, name } : p)) })),

      deletePlan: (id) =>
        set((s) => {
          const remaining = s.plans.filter((p) => p.id !== id)
          if (remaining.length === 0) remaining.push(emptyPlan(DEFAULT_PLAN_ID, 'My Plan'))
          const newActiveId = s.activePlanId === id ? remaining[0].id : s.activePlanId
          const active = remaining.find((p) => p.id === newActiveId) || remaining[0]
          return { plans: remaining, activePlanId: newActiveId, ...proxyOf(active) }
        }),

      setActivePlan: (id) =>
        set((s) => {
          const active = s.plans.find((p) => p.id === id)
          return active ? { activePlanId: id, ...proxyOf(active) } : {}
        }),

      duplicatePlan: (id) => {
        const source = get().plans.find((p) => p.id === id)
        if (!source) return
        const dup: Plan = {
          ...source,
          id: crypto.randomUUID(),
          name: `${source.name} (copy)`,
          semesters: source.semesters.map((s) => ({ ...s, id: crypto.randomUUID(), courseCodes: [...s.courseCodes] })),
          manualOverrides: { ...source.manualOverrides },
          selectedProgramIds: [...source.selectedProgramIds],
        }
        set((s) => ({ plans: [...s.plans, dup], activePlanId: dup.id, ...proxyOf(dup) }))
      },

      loadPrograms: async () => {
        if (get().programsLoaded) return
        try {
          const res = await fetch('/data/programs.json')
          if (!res.ok) throw new Error('Failed to load programs')
          const data: ProgramsData = await res.json()
          set({ programs: data.programs, programsLoaded: true })
        } catch (e) {
          console.error('Failed to load programs', e)
        }
      },

      toggleProgram: (id) =>
        set(() => withActivePlan(get, (p) => ({
          ...p,
          selectedProgramIds: p.selectedProgramIds.includes(id)
            ? p.selectedProgramIds.filter((x) => x !== id)
            : [...p.selectedProgramIds, id],
        }))),

      addSemester: (term, year) =>
        set(() => withActivePlan(get, (p) => {
          if (p.semesters.some((sem) => sem.term === term && sem.year === year)) return p
          const next: PlannedSemester = { id: crypto.randomUUID(), term, year, courseCodes: [] }
          return { ...p, semesters: sortSemesters([...p.semesters, next]) }
        })),

      removeSemester: (id) =>
        set(() => withActivePlan(get, (p) => ({ ...p, semesters: p.semesters.filter((s) => s.id !== id) }))),

      addCourseToSemester: (semesterId, courseCode) =>
        set(() => withActivePlan(get, (p) => ({
          ...p,
          semesters: p.semesters.map((sem) =>
            sem.id === semesterId && !sem.courseCodes.includes(courseCode)
              ? { ...sem, courseCodes: [...sem.courseCodes, courseCode] }
              : sem
          ),
        }))),

      removeCourseFromSemester: (semesterId, courseCode) =>
        set(() => withActivePlan(get, (p) => ({
          ...p,
          semesters: p.semesters.map((sem) =>
            sem.id === semesterId ? { ...sem, courseCodes: sem.courseCodes.filter((c) => c !== courseCode) } : sem
          ),
        }))),

      toggleOverride: (programId, requirementId) =>
        set(() => withActivePlan(get, (p) => {
          const key = `${programId}:${requirementId}`
          const next = { ...p.manualOverrides }
          if (next[key]) delete next[key]
          else next[key] = true
          return { ...p, manualOverrides: next }
        })),

      clearAll: () =>
        set(() => withActivePlan(get, (p) => ({
          ...p, selectedProgramIds: [], semesters: [], manualOverrides: {},
        }))),
    }),
    {
      name: 'berkeleytime-gradtrak',
      version: 2,
      // v1 → v2: wrap the single legacy plan into the new plans[] array.
      migrate: (persisted: unknown, fromVersion: number) => {
        if (fromVersion < 2 && persisted && typeof persisted === 'object') {
          const p = persisted as Partial<Plan>
          const migrated: Plan = {
            id: DEFAULT_PLAN_ID,
            name: 'My Plan',
            selectedProgramIds: p.selectedProgramIds || [],
            semesters: p.semesters || [],
            manualOverrides: p.manualOverrides || {},
          }
          return { plans: [migrated], activePlanId: DEFAULT_PLAN_ID, ...proxyOf(migrated) }
        }
        return persisted as object
      },
      // After hydration, push the active plan's fields up to the proxy.
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const active = state.plans.find((p) => p.id === state.activePlanId) || state.plans[0]
        if (active) Object.assign(state, proxyOf(active))
      },
      partialize: (s) => ({ plans: s.plans, activePlanId: s.activePlanId }),
    }
  )
)
