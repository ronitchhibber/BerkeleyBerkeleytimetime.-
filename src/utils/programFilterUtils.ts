/**
 * Convert a program (and optionally a single requirement group within it)
 * into a flat set of course codes the catalog can filter against.
 *
 * Programs reference courses three ways:
 *   1. Exact:   "MATH 53"             → literal code
 *   2. Choose:  ["COMPSCI 61A", ...]  → any of these literals
 *   3. Range:   "HISTART 100-199"     → any HISTART numbered 100–199
 *
 * We collect (1) and (2) into a Set of literal codes, and (3) into a list
 * of {subject, lo, hi} range patterns. The matcher checks both.
 *
 * Course-code shapes vary across data sources — Berkeleytime catalog uses
 * tight subjects ("CYPLAN") while program data uses spaced ("CY PLAN").
 * normalizeCode collapses both into a canonical form before comparison.
 */
import type { Program, RequirementRule } from '@/types/gradtrak'

export interface ProgramScope {
  literals: Set<string>
  ranges: { subject: string; lo: number; hi: number }[]
}

/**
 * Canonicalize a course code so "CY PLAN 110", "CYPLAN 110", and "CYPLAN  110"
 * all compare equal. Strip whitespace inside the subject prefix; preserve a
 * single space before the catalog number; uppercase.
 */
export function normalizeCode(raw: string): string {
  if (!raw) return ''
  const upper = raw.toUpperCase().trim()
  // Split on the first numeric character (numbers may be prefixed by a letter
  // like "C8" or "N10A" — keep that prefix attached to the number).
  const m = upper.match(/^([A-Z\s]+?)\s*([CHNR]?\d.*)$/)
  if (!m) return upper.replace(/\s+/g, ' ')
  const subj = m[1].replace(/\s+/g, '')
  const num = m[2].replace(/\s+/g, '')
  return `${subj} ${num}`
}

function parseRange(s: string): { subject: string; lo: number; hi: number } | null {
  const m = s.toUpperCase().trim().match(/^([A-Z\s]+?)\s+(\d+)\s*-\s*(\d+)$/)
  if (!m) return null
  return { subject: m[1].replace(/\s+/g, ''), lo: parseInt(m[2], 10), hi: parseInt(m[3], 10) }
}

function addFromRule(rule: RequirementRule, scope: ProgramScope): void {
  if (rule.type === 'specific') {
    for (const c of rule.courses) {
      const range = parseRange(c)
      if (range) scope.ranges.push(range)
      else scope.literals.add(normalizeCode(c))
    }
    return
  }
  if (rule.type === 'choose' || rule.type === 'category' || rule.type === 'units') {
    for (const c of rule.from) {
      const range = parseRange(c)
      if (range) scope.ranges.push(range)
      else scope.literals.add(normalizeCode(c))
    }
  }
  // 'breadth', 'university-req', 'total-units', 'senior-residence' — these
  // don't reference specific course codes, so they contribute nothing here.
}

/**
 * Build the catalog-filter scope for a chosen program.
 *
 *   groupId=null,       requirementId=null  → every course in the program
 *   groupId="lower-..", requirementId=null  → every course in that group
 *   groupId="lower-..", requirementId="econometrics" → only that requirement's
 *                                                       course list
 *
 * `requirementId` is only honored when `groupId` is set — a requirement id is
 * not unique across groups in arbitrary programs, so we resolve it within the
 * chosen group's scope.
 */
export function buildProgramScope(
  program: Program,
  groupId: string | null,
  requirementId: string | null = null,
): ProgramScope {
  const scope: ProgramScope = { literals: new Set(), ranges: [] }
  for (const g of program.groups) {
    if (groupId && g.id !== groupId) continue
    for (const req of g.requirements) {
      if (groupId && requirementId && req.id !== requirementId) continue
      addFromRule(req.rule, scope)
    }
  }
  return scope
}

/**
 * Check whether a course code falls within a program scope.
 * Empty scope = no constraint (match all).
 */
export function matchesProgramScope(courseCode: string, scope: ProgramScope | null): boolean {
  if (!scope) return true
  if (scope.literals.size === 0 && scope.ranges.length === 0) return true
  const code = normalizeCode(courseCode)
  if (scope.literals.has(code)) return true
  // Range check: split canonical "SUBJECT NUMBER" and parse leading digits.
  const space = code.indexOf(' ')
  if (space < 0) return false
  const subject = code.slice(0, space)
  const numStr = code.slice(space + 1).match(/^[CHNR]?(\d+)/)
  if (!numStr) return false
  const num = parseInt(numStr[1], 10)
  for (const r of scope.ranges) {
    if (r.subject === subject && num >= r.lo && num <= r.hi) return true
  }
  return false
}

/**
 * Group requirement-groups for the dropdown. Filter out groups that contribute
 * nothing to the catalog (e.g. graduation/total-units groups), so the picker
 * only shows actionable choices.
 */
export function groupsWithCourses(program: Program): Program['groups'] {
  return program.groups.filter((g) => {
    const scope = buildProgramScope({ ...program, groups: [g] }, null)
    return scope.literals.size > 0 || scope.ranges.length > 0
  })
}

/**
 * Within a single group, return only the requirements that actually reference
 * specific courses (specific / choose / category / units rules). This drops
 * breadth/total-units/etc. lines that don't make sense as a catalog filter.
 */
export function requirementsWithCourses(
  group: Program['groups'][number],
): Program['groups'][number]['requirements'] {
  return group.requirements.filter((req) => {
    const t = req.rule.type
    if (t === 'specific') return req.rule.courses.length > 0
    if (t === 'choose' || t === 'category' || t === 'units') return req.rule.from.length > 0
    return false
  })
}
