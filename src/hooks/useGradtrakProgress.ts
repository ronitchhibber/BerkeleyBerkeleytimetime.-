/**
 * Single source of truth for "what does each selected program look like
 * given the user's planned courses?". Both GradtrakPage (header stats) and
 * ProgramProgressView (detail panels) used to call evaluateProgram() in
 * separate useMemos — that's a 2× compute per state change, on top of the
 * already-quadratic matcher work.
 *
 * This hook computes once, both views read it.
 */
import { useMemo } from 'react'
import { useGradtrakStore } from '@/stores/gradtrakStore'
import { evaluateProgram } from '@/utils/requirementMatcher'
import { useCourseIndex } from './useCourseIndex'
import type { Program, ProgramProgress } from '@/types/gradtrak'

export interface GradtrakProgressEntry {
  program: Program
  progress: ProgramProgress
}

export interface GradtrakProgress {
  takenCodes: string[]
  selectedPrograms: Program[]
  entries: GradtrakProgressEntry[]
  totals: { satReqs: number; totalReqs: number; pct: number }
}

export function useGradtrakProgress(): GradtrakProgress {
  const semesters = useGradtrakStore((s) => s.semesters)
  const programs = useGradtrakStore((s) => s.programs)
  const selectedProgramIds = useGradtrakStore((s) => s.selectedProgramIds)
  const overrides = useGradtrakStore((s) => s.manualOverrides)
  const index = useCourseIndex()

  const takenCodes = useMemo(
    () => semesters.flatMap((s) => s.courseCodes),
    [semesters],
  )

  const selectedPrograms = useMemo(
    () => programs.filter((p) => selectedProgramIds.includes(p.id)),
    [programs, selectedProgramIds],
  )

  return useMemo(() => {
    let totalReqs = 0
    let satReqs = 0
    const entries: GradtrakProgressEntry[] = selectedPrograms.map((program) => {
      const progress = evaluateProgram(program, takenCodes, index)
      // Apply manual overrides (user marked a requirement complete by hand).
      // Done here so chrome — both stats AND detail rows — share one truth.
      const adjustedGroups = progress.groups.map((g) => {
        const adjReqs = g.requirements.map((r) => {
          const overrideKey = `${program.id}:${r.requirementId}`
          const isOverridden = overrides[overrideKey]
          return isOverridden && !r.satisfied
            ? { ...r, satisfied: true, _overridden: true as const }
            : { ...r, _overridden: false as const }
        })
        const sCount = adjReqs.filter((r) => r.satisfied).length
        return { ...g, requirements: adjReqs, satisfiedCount: sCount, satisfied: sCount === g.totalCount }
      })
      const adjusted: ProgramProgress = {
        ...progress,
        groups: adjustedGroups,
        satisfied: adjustedGroups.every((g) => g.satisfied),
      }
      for (const g of adjustedGroups) {
        totalReqs += g.totalCount
        satReqs += g.satisfiedCount
      }
      return { program, progress: adjusted }
    })
    const pct = totalReqs > 0 ? Math.round((satReqs / totalReqs) * 100) : 0
    return { takenCodes, selectedPrograms, entries, totals: { satReqs, totalReqs, pct } }
  }, [selectedPrograms, takenCodes, index, overrides])
}
