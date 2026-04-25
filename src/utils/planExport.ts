/**
 * Plan import/export.
 *
 * Two formats:
 *  - URL share — base64 JSON in `#plan=` hash. Hash (not query) keeps it
 *    client-side only.
 *  - CSV — flat tabular dump for advisors / parents.
 */
import type { PlannedSemester, Program } from '@/types/gradtrak'
import type { CourseIndex } from './courseIndex'
import { evaluateProgram, requirementsCourseCouldSatisfy } from './requirementMatcher'
import { totalUnits as sumUnits, lookupCourse } from './courseLookup'

interface SerializedPlan {
  v: 1
  programs: string[]
  semesters: { t: string; y: number; c: string[] }[]
  overrides?: Record<string, boolean>
}

interface PlanLike {
  selectedProgramIds: string[]
  semesters: PlannedSemester[]
  manualOverrides: Record<string, boolean>
}

export function buildShareUrl(input: PlanLike): string {
  const plan: SerializedPlan = {
    v: 1,
    programs: input.selectedProgramIds,
    semesters: input.semesters.map((s) => ({ t: s.term, y: s.year, c: s.courseCodes })),
    ...(Object.keys(input.manualOverrides).length > 0 && { overrides: input.manualOverrides }),
  }
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(plan))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${window.location.origin}/gradtrak#plan=${b64}`
}

export function decodePlan(encoded: string): SerializedPlan | null {
  try {
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
    const plan = JSON.parse(decodeURIComponent(escape(atob(padded)))) as SerializedPlan
    return (plan.v === 1 && Array.isArray(plan.semesters)) ? plan : null
  } catch {
    return null
  }
}

interface CsvInput {
  semesters: PlannedSemester[]
  selectedPrograms: Program[]
  index: CourseIndex
}

export function exportCsv({ semesters, selectedPrograms, index }: CsvInput): string {
  const rows: string[][] = [['Semester', 'Course', 'Title', 'Units', 'Programs', 'Requirements']]

  for (const sem of semesters) {
    for (const code of sem.courseCodes) {
      const info = lookupCourse(code, index)
      const matches = requirementsCourseCouldSatisfy(code, selectedPrograms, index)
      rows.push([
        `${sem.term} ${sem.year}`,
        code,
        info?.title ?? '',
        String(info?.units ?? ''),
        [...new Set(matches.map((m) => m.programName))].join(' | '),
        matches.map((m) => `${m.programName}: ${m.reqName}`).join(' | '),
      ])
    }
  }

  const allTaken = semesters.flatMap((s) => s.courseCodes)
  rows.push([])
  rows.push(['SUMMARY', '', '', '', '', ''])
  rows.push(['Total courses', String(allTaken.length), '', '', '', ''])
  rows.push(['Total units', String(sumUnits(allTaken, index)), '', '', '', ''])

  for (const p of selectedPrograms) {
    const progress = evaluateProgram(p, allTaken, index)
    const sat = progress.groups.reduce((a, g) => a + g.satisfiedCount, 0)
    const total = progress.groups.reduce((a, g) => a + g.totalCount, 0)
    rows.push([`${p.type.toUpperCase()}: ${p.name}`, `${sat}/${total}`, '', '', '', ''])
  }

  return rows
    .map((row) => row.map((cell) => {
      const s = String(cell ?? '')
      return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }).join(','))
    .join('\n')
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
