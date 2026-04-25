import type { AllCourse } from '@/stores/allCoursesStore'
import type {
  Program, RequirementRule, RequirementProgress, GroupProgress, ProgramProgress,
} from '@/types/gradtrak'
import { type CourseIndex, normalizeCode } from './courseIndex'

// Re-export normalizeCode so existing call sites that imported it from this
// module keep working. (Tests + a couple of utilities reach in for this.)
export { normalizeCode } from './courseIndex'

function parseRange(pattern: string): { subject: string; min: number; max: number } | null {
  const m = pattern.match(/^([A-Z][A-Z\s,&]*)\s*(\d+[A-Z]*)\s*-\s*(\d+[A-Z]*)$/i)
  if (!m) return null
  const subject = m[1].trim().toUpperCase().replace(/\s+/g, '')
  const min = parseInt(m[2])
  const max = parseInt(m[3])
  if (isNaN(min) || isNaN(max)) return null
  return { subject, min, max }
}

function parseWildcard(pattern: string): { subject: string; numberPattern: string } | null {
  const m = pattern.match(/^([A-Z][A-Z\s,&]*)\s+(\d+\?+|\?+)$/i)
  if (!m) return null
  return { subject: m[1].trim().toUpperCase().replace(/\s+/g, ''), numberPattern: m[2] }
}

function courseMatchesPattern(courseCode: string, pattern: string): boolean {
  const normCode = normalizeCode(courseCode)
  const normPattern = normalizeCode(pattern)
  if (normCode === normPattern) return true

  const range = parseRange(pattern)
  if (range) {
    const [subj, num] = normCode.split(' ')
    if (!num) return false
    const numericPart = parseInt(num.replace(/[A-Z]/g, ''))
    if (isNaN(numericPart)) return false
    return subj === range.subject && numericPart >= range.min && numericPart <= range.max
  }

  const wc = parseWildcard(pattern)
  if (wc) {
    const [subj, num] = normCode.split(' ')
    if (!num || subj !== wc.subject) return false
    if (wc.numberPattern.startsWith('1??')) {
      const numericPart = parseInt(num.replace(/[A-Z]/g, ''))
      return !isNaN(numericPart) && numericPart >= 100 && numericPart <= 199
    }
    if (wc.numberPattern.startsWith('2??')) {
      const numericPart = parseInt(num.replace(/[A-Z]/g, ''))
      return !isNaN(numericPart) && numericPart >= 200 && numericPart <= 299
    }
  }
  return false
}

function findMatchingCourses(takenCodes: string[], from: string[]): string[] {
  const matches = new Set<string>()
  for (const taken of takenCodes) {
    for (const pattern of from) {
      if (courseMatchesPattern(taken, pattern)) {
        matches.add(normalizeCode(taken))
        break
      }
    }
  }
  return [...matches]
}

export function evaluateRule(
  rule: RequirementRule,
  takenCodes: string[],
  index: CourseIndex,
  consumedCodes: Set<string>,
): { satisfied: boolean; matchedCourses: string[]; remaining: number; total: number; unitsCompleted?: number; unitsRequired?: number } {
  const availableTaken = takenCodes.filter((c) => !consumedCodes.has(normalizeCode(c)))

  if (rule.type === 'breadth') {
    const wanted = rule.breadth.toLowerCase()
    const count = rule.count ?? 1
    const matched: string[] = []
    for (const taken of availableTaken) {
      const breadths = index.breadths(taken).map((b) => b.toLowerCase())
      if (breadths.includes(wanted)) {
        matched.push(normalizeCode(taken))
        if (matched.length >= count) break
      }
    }
    return {
      satisfied: matched.length >= count,
      matchedCourses: matched,
      remaining: Math.max(0, count - matched.length),
      total: count,
    }
  }

  if (rule.type === 'university-req') {
    const wanted = rule.req.toLowerCase()
    const count = rule.count ?? 1
    const matched: string[] = []
    for (const taken of availableTaken) {
      const reqs = index.uniReqs(taken).map((r) => r.toLowerCase())
      if (reqs.includes(wanted)) {
        matched.push(normalizeCode(taken))
        if (matched.length >= count) break
      }
    }
    return {
      satisfied: matched.length >= count,
      matchedCourses: matched,
      remaining: Math.max(0, count - matched.length),
      total: count,
    }
  }

  if (rule.type === 'total-units') {
    let totalUnits = 0
    for (const taken of takenCodes) totalUnits += index.units(taken) ?? 0
    return {
      satisfied: totalUnits >= rule.units,
      matchedCourses: [],
      remaining: Math.max(0, rule.units - totalUnits),
      total: rule.units,
      unitsCompleted: totalUnits,
      unitsRequired: rule.units,
    }
  }

  if (rule.type === 'senior-residence') {
    // Approximation: sum units from the most recent ~12 courses ≈ 2 semesters
    let totalUnits = 0
    for (const taken of takenCodes.slice(-12)) totalUnits += index.units(taken) ?? 0
    return {
      satisfied: totalUnits >= rule.units,
      matchedCourses: [],
      remaining: Math.max(0, rule.units - totalUnits),
      total: rule.units,
      unitsCompleted: totalUnits,
      unitsRequired: rule.units,
    }
  }

  if (rule.type === 'specific') {
    const matched = rule.courses.filter((c) =>
      availableTaken.some((t) => normalizeCode(t) === normalizeCode(c))
    )
    return {
      satisfied: matched.length === rule.courses.length,
      matchedCourses: matched,
      remaining: Math.max(0, rule.courses.length - matched.length),
      total: rule.courses.length,
    }
  }

  if (rule.type === 'choose') {
    const matches = findMatchingCourses(availableTaken, rule.from)
    const used = matches.slice(0, rule.count)
    return {
      satisfied: matches.length >= rule.count,
      matchedCourses: used,
      remaining: Math.max(0, rule.count - matches.length),
      total: rule.count,
    }
  }

  if (rule.type === 'category') {
    const matches = findMatchingCourses(availableTaken, rule.from)
    const used = matches.slice(0, rule.count)
    return {
      satisfied: matches.length >= rule.count,
      matchedCourses: used,
      remaining: Math.max(0, rule.count - matches.length),
      total: rule.count,
    }
  }

  if (rule.type === 'units') {
    const matches = findMatchingCourses(availableTaken, rule.from)
    let totalUnits = 0
    const used: string[] = []
    for (const m of matches) {
      const u = index.units(m) ?? 0
      totalUnits += u
      used.push(m)
      if (totalUnits >= rule.units) break
    }
    return {
      satisfied: totalUnits >= rule.units,
      matchedCourses: used,
      remaining: Math.max(0, rule.units - totalUnits),
      total: rule.units,
      unitsCompleted: totalUnits,
      unitsRequired: rule.units,
    }
  }

  return { satisfied: false, matchedCourses: [], remaining: 0, total: 0 }
}

/**
 * Optimal bipartite matching for breadth-only requirement groups. Each course
 * may satisfy multiple breadths but can only be assigned to one. Sort by
 * scarcity, then for each requirement pick the candidate course that covers
 * the FEWEST other unmatched breadths — preserves versatile courses for
 * uniquely-needed slots. ≈ Hungarian matching, fine for N=7 breadths.
 */
function matchBreadthGroup(
  breadthReqs: { id: string; breadth: string; count: number }[],
  availableTaken: string[],
  index: CourseIndex,
): Map<string, string[]> {
  const candidatesPerReq = new Map<string, string[]>()
  for (const req of breadthReqs) {
    const wanted = req.breadth.toLowerCase()
    const cands = availableTaken.filter((c) =>
      index.breadths(c).some((b) => b.toLowerCase() === wanted)
    )
    candidatesPerReq.set(req.id, cands)
  }

  const result = new Map<string, string[]>()
  const consumedLocal = new Set<string>()
  const reqOrder = [...breadthReqs].sort(
    (a, b) => (candidatesPerReq.get(a.id)!.length) - (candidatesPerReq.get(b.id)!.length)
  )

  for (const req of reqOrder) {
    const cands = candidatesPerReq.get(req.id)!.filter((c) => !consumedLocal.has(normalizeCode(c)))
    if (cands.length === 0) {
      result.set(req.id, [])
      continue
    }
    const unmatchedReqs = reqOrder.filter((r) => !result.has(r.id) && r.id !== req.id)
    let best = cands[0]
    let bestScore = Infinity
    for (const c of cands) {
      const bset = new Set(index.breadths(c).map((b) => b.toLowerCase()))
      const overlap = unmatchedReqs.filter((r) => bset.has(r.breadth.toLowerCase())).length
      if (overlap < bestScore) {
        bestScore = overlap
        best = c
      }
    }
    result.set(req.id, [normalizeCode(best)])
    consumedLocal.add(normalizeCode(best))
  }
  return result
}

export function evaluateProgram(
  program: Program,
  takenCodes: string[],
  index: CourseIndex,
): ProgramProgress {
  const consumed = new Set<string>()
  const groupProgresses: GroupProgress[] = []

  for (const group of program.groups) {
    const reqProgresses: RequirementProgress[] = []
    let satisfiedCount = 0

    const allBreadth = group.requirements.every((r) => r.rule.type === 'breadth')
    let breadthAssignments: Map<string, string[]> | null = null
    if (allBreadth && group.requirements.length > 1) {
      const availableTaken = takenCodes.filter((c) => !consumed.has(normalizeCode(c)))
      const breadthReqs = group.requirements.map((r) => ({
        id: r.id,
        breadth: (r.rule as { breadth: string }).breadth,
        count: (r.rule as { count?: number }).count ?? 1,
      }))
      breadthAssignments = matchBreadthGroup(breadthReqs, availableTaken, index)
    }

    for (const req of group.requirements) {
      const matched = breadthAssignments?.get(req.id)
      const count = (req.rule as { count?: number }).count ?? 1
      const result = matched
        ? {
            satisfied: matched.length >= count,
            matchedCourses: matched,
            remaining: Math.max(0, count - matched.length),
            total: count,
          }
        : evaluateRule(req.rule, takenCodes, index, consumed)

      result.matchedCourses.forEach((c) => consumed.add(normalizeCode(c)))
      reqProgresses.push({
        requirementId: req.id,
        satisfied: result.satisfied,
        matchedCourses: result.matchedCourses,
        remaining: result.remaining,
        total: result.total,
        unitsCompleted: result.unitsCompleted,
        unitsRequired: result.unitsRequired,
      })
      if (result.satisfied) satisfiedCount++
    }

    groupProgresses.push({
      groupId: group.id,
      satisfied: satisfiedCount === group.requirements.length,
      satisfiedCount,
      totalCount: group.requirements.length,
      requirements: reqProgresses,
    })
  }

  return {
    programId: program.id,
    satisfied: groupProgresses.every((g) => g.satisfied),
    groups: groupProgresses,
  }
}

/**
 * Discover all eligible courses for a requirement across the all-time
 * catalog. Iterates the catalog once (capped at `limit`); the index isn't
 * useful here because the access pattern is "scan all → keep matches".
 */
export function eligibleCoursesForRule(
  rule: RequirementRule,
  catalogCourses: AllCourse[],
  limit = 200
): AllCourse[] {
  const matches: AllCourse[] = []

  if (rule.type === 'breadth') {
    const wanted = rule.breadth.toLowerCase()
    for (const c of catalogCourses) {
      const breadths = (c.breadths || []).map((b) => b.toLowerCase())
      if (breadths.includes(wanted)) {
        matches.push(c)
        if (matches.length >= limit) break
      }
    }
    return matches
  }

  if (rule.type === 'university-req') {
    const wanted = rule.req.toLowerCase()
    for (const c of catalogCourses) {
      const reqs = ((c as { universityReqs?: string[] }).universityReqs || []).map((r) => r.toLowerCase())
      if (reqs.includes(wanted)) {
        matches.push(c)
        if (matches.length >= limit) break
      }
    }
    return matches
  }

  if (rule.type === 'specific' || rule.type === 'choose' || rule.type === 'category' || rule.type === 'units') {
    const patterns = rule.type === 'specific' ? rule.courses : rule.from
    for (const c of catalogCourses) {
      for (const pattern of patterns) {
        if (courseMatchesPattern(c.code, pattern)) {
          matches.push(c)
          break
        }
      }
      if (matches.length >= limit) break
    }
    return matches
  }

  return []
}

/**
 * For a course code + the user's selected programs, find every requirement
 * across all programs that the course COULD satisfy. Used by the
 * click-course-see-reqs UX to spot cross-program double counts.
 */
export function requirementsCourseCouldSatisfy(
  courseCode: string,
  programs: Program[],
  index: CourseIndex,
): { programId: string; programName: string; groupName: string; reqId: string; reqName: string }[] {
  const norm = normalizeCode(courseCode)
  const breadths = index.breadths(courseCode).map((b) => b.toLowerCase())
  const uniReqs = index.uniReqs(courseCode).map((r) => r.toLowerCase())
  const matches: { programId: string; programName: string; groupName: string; reqId: string; reqName: string }[] = []

  for (const p of programs) {
    for (const g of p.groups) {
      for (const r of g.requirements) {
        const rule = r.rule
        let satisfies = false
        if (rule.type === 'breadth') {
          satisfies = breadths.includes(rule.breadth.toLowerCase())
        } else if (rule.type === 'university-req') {
          satisfies = uniReqs.includes(rule.req.toLowerCase())
        } else if (rule.type === 'specific') {
          satisfies = rule.courses.some((c) => normalizeCode(c) === norm)
        } else if (rule.type === 'choose' || rule.type === 'category' || rule.type === 'units') {
          satisfies = rule.from.some((p) => courseMatchesPattern(courseCode, p))
        }
        if (satisfies) {
          matches.push({
            programId: p.id,
            programName: p.name,
            groupName: g.name,
            reqId: r.id,
            reqName: r.name,
          })
        }
      }
    }
  }
  return matches
}

// Re-export so legacy callers can keep using the empty index when no data is loaded.
export { EMPTY_COURSE_INDEX } from './courseIndex'
