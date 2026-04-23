/**
 * Generate a context-rich "Plan my path" prompt the user can paste to Claude
 * (or any LLM). Copied to clipboard and pasted wherever the user has an LLM.
 */
import type { Plan } from '@/stores/gradtrakStore'
import type { Program } from '@/types/gradtrak'
import type { Course } from '@/types'
import type { AllCourse } from '@/stores/allCoursesStore'
import { evaluateProgram } from './requirementMatcher'
import { totalUnits as sumUnits } from './courseLookup'

interface PlanPathInput {
  plan: Plan
  programs: Program[]
  allCourses: Course[]
  catalogCourses: AllCourse[]
}

export function buildPlanPathPrompt({ plan, programs, allCourses, catalogCourses }: PlanPathInput): string {
  const taken = plan.semesters.flatMap((s) => s.courseCodes)
  const totalUnits = sumUnits(taken, allCourses, catalogCourses)
  const selectedPrograms = programs.filter((p) => plan.selectedProgramIds.includes(p.id))

  const remainingByProgram: { name: string; type: string; reqs: string[] }[] = []
  for (const p of selectedPrograms) {
    const progress = evaluateProgram(p, taken, allCourses, catalogCourses)
    const reqsLeft: string[] = []
    for (const g of progress.groups) {
      const programGroup = p.groups.find((pg) => pg.id === g.groupId)
      if (!programGroup) continue
      for (const r of g.requirements) {
        const overrideKey = `${p.id}:${r.requirementId}`
        if (r.satisfied || plan.manualOverrides[overrideKey]) continue
        const programReq = programGroup.requirements.find((pr) => pr.id === r.requirementId)
        if (programReq) reqsLeft.push(`${programGroup.name} → ${programReq.name}`)
      }
    }
    if (reqsLeft.length > 0) remainingByProgram.push({ name: p.name, type: p.type, reqs: reqsLeft })
  }

  return `I'm a UC Berkeley student planning my remaining semesters. Help me think through the order in which to satisfy my remaining requirements.

## My current state
- ${taken.length} classes completed across ${plan.semesters.length} semester${plan.semesters.length !== 1 ? 's' : ''}
- ${totalUnits} units done out of 120 needed for graduation (${120 - totalUnits} units remaining)

## Programs I'm pursuing
${selectedPrograms.map((p) => `- ${p.type.toUpperCase()}: ${p.name}`).join('\n') || '(none selected)'}

## My past coursework
${plan.semesters.length === 0 ? '(no semesters planned)' : plan.semesters.map((s) => `**${s.term} ${s.year}**: ${s.courseCodes.join(', ')}`).join('\n')}

## Remaining requirements (the ones I still need to satisfy)
${remainingByProgram.length === 0 ? 'All requirements satisfied!' : remainingByProgram.map((p) => `\n### ${p.type.toUpperCase()}: ${p.name}\n${p.reqs.map((r) => `- ${r}`).join('\n')}`).join('\n')}

## What I want from you
Suggest a semester-by-semester plan that:
1. Spreads remaining requirements across reasonable course loads (12–16 units/sem)
2. Respects typical prerequisite ordering (lower-div before upper-div)
3. Notes which requirements should pair well in the same semester
4. Calls out any common pitfalls or scheduling conflicts I should watch for

Don't suggest specific course codes — recommend by REQUIREMENT (e.g. "satisfy Quantitative Reasoning + one Historical Studies breadth in Spring 2027") since I'll pick the actual class from current offerings closer to enrollment.`
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback: open in a prompt so the user can copy manually
    return false
  }
}
