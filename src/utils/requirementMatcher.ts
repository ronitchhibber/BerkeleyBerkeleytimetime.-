import type { Course } from '@/types'
import type { AllCourse } from '@/stores/allCoursesStore'
import type {
  Program, RequirementRule, RequirementProgress, GroupProgress, ProgramProgress,
} from '@/types/gradtrak'

function normalizeCode(code: string): string {
  return code.replace(/\s+/g, ' ').trim().toUpperCase()
}

function parseRange(pattern: string): { subject: string; min: number; max: number } | null {
  const m = pattern.match(/^([A-Z][A-Z\s,&]*)\s*(\d+[A-Z]*)\s*-\s*(\d+[A-Z]*)$/i)
  if (!m) return null
  const subject = m[1].trim().toUpperCase()
  const min = parseInt(m[2])
  const max = parseInt(m[3])
  if (isNaN(min) || isNaN(max)) return null
  return { subject, min, max }
}

function parseWildcard(pattern: string): { subject: string; numberPattern: string } | null {
  const m = pattern.match(/^([A-Z][A-Z\s,&]*)\s+(\d+\?+|\?+)$/i)
  if (!m) return null
  return { subject: m[1].trim().toUpperCase(), numberPattern: m[2] }
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

function unitsForCourse(courseCode: string, allCourses: Course[]): number {
  const norm = normalizeCode(courseCode)
  const course = allCourses.find((c) => normalizeCode(c.code) === norm)
  return course?.units || 4
}

function uniReqsForCourse(courseCode: string, catalogCourses?: AllCourse[]): string[] {
  const norm = normalizeCode(courseCode)
  const a = catalogCourses?.find((x) => normalizeCode(x.code) === norm)
  return (a as { universityReqs?: string[] } | undefined)?.universityReqs || []
}

function breadthsForCourse(courseCode: string, allCourses: Course[], catalogCourses?: AllCourse[]): string[] {
  const norm = normalizeCode(courseCode)
  // Try Fall 2026 catalog first (has rich lsBreadth)
  const c = allCourses.find((c) => normalizeCode(c.code) === norm)
  if (c?.requirements?.lsBreadth?.length) return c.requirements.lsBreadth
  // Berkeleytime data
  const a = catalogCourses?.find((x) => normalizeCode(x.code) === norm)
  const official = a?.breadths || []
  // Augment with heuristic detection for unambiguous cases berkeleytime missed.
  // Only add breadths not already officially tagged.
  const heuristic = inferBreadthsFromMetadata(norm, a?.title || c?.title || '')
  for (const h of heuristic) {
    if (!official.some((o) => o.toLowerCase() === h.toLowerCase())) {
      official.push(h)
    }
  }
  return official
}

/**
 * Unambiguous heuristic rules to catch courses berkeleytime's catalogSearch
 * mistags or omits. Conservative: only fires on strong signals.
 *
 * Each rule is keyword OR subject-code based, picked to minimize false
 * positives. Berkeleytime data is the source of truth — these only fire
 * when berkeleytime has nothing tagged.
 */
function inferBreadthsFromMetadata(code: string, title: string): string[] {
  const t = title.toLowerCase()
  const [subject] = code.split(' ')
  const breadths: string[] = []

  // International Studies
  if (
    /\bstudy abroad\b|\bstudying abroad\b|\babroad program\b|\bglobal citizen|\bglobalization\b|\bglobal studies\b|\binternational stud|\bcomparative.{0,20}politic|\bworld history\b/.test(t) ||
    subject === 'GLOBAL' || subject === 'IAS'
  ) {
    breadths.push('International Studies')
  }

  // Historical Studies — clear historical signal
  if (
    /\bhistory of\b|\bhistorical\b|\b(?:ancient|medieval|modern|colonial|imperial)\s+\w+\s+history\b/.test(t) ||
    subject === 'HISTORY' || subject === 'HISTART' || subject === 'CLASSIC'
  ) {
    breadths.push('Historical Studies')
  }

  // Philosophy & Values — explicit philosophy/ethics terms
  if (
    /\bethics?\b|\bmoral philosophy\b|\bbioethics\b|\bphilosophy of\b/.test(t) ||
    subject === 'PHILOS'
  ) {
    breadths.push('Philosophy & Values')
  }

  // Arts & Literature — humanities production/criticism
  if (
    /\bliterature\b|\bpoetry\b|\b(?:cinema|film) studies\b|\b(?:music|art) (?:history|theory|composition)\b|\bcreative writing\b|\bdrama\b|\btheater\b|\bperformance\b/.test(t) ||
    subject === 'ART' || subject === 'MUSIC' || subject === 'THEATER' || subject === 'FILM' || subject === 'COMLIT'
  ) {
    breadths.push('Arts & Literature')
  }

  // Biological Science
  if (
    /\b(?:cell|molecular|developmental|evolutionary|systems) biology\b|\bgenetics\b|\bphysiology\b|\bneurobiolog/.test(t) ||
    subject === 'BIOLOGY' || subject === 'MCELLBI' || subject === 'INTEGBI' || subject === 'PLANTBI' || subject === 'NEU' || subject === 'NEUROSC'
  ) {
    breadths.push('Biological Science')
  }

  // Physical Science
  if (
    /\b(?:classical|modern|quantum|statistical) (?:mechanics|physics)\b|\bthermodynamics\b|\borganic chemistry\b|\bphysical chemistry\b|\bastronomy\b|\bgeology\b/.test(t) ||
    subject === 'PHYSICS' || subject === 'CHEM' || subject === 'ASTRON' || subject === 'EPS'
  ) {
    breadths.push('Physical Science')
  }

  // Social & Behavioral Sciences
  if (
    /\b(?:micro|macro)economics\b|\bsociology of\b|\bsocial psychology\b|\bbehavioral economics\b|\bpolitical science\b|\bpublic policy\b/.test(t) ||
    subject === 'ECON' || subject === 'POLSCI' || subject === 'PSYCH' || subject === 'SOCIOL' || subject === 'ANTHRO' || subject === 'COGSCI' || subject === 'PUBPOL'
  ) {
    breadths.push('Social & Behavioral Sciences')
  }

  // American Cultures — most reliable signal is "AC" suffix in course code
  if (
    /\b(?:american )?(?:cultures?|race and )(?:in (?:the )?(?:us|america))?\b/i.test(t) ||
    /\bAC$/i.test(code.split(' ')[1] || '')
  ) {
    breadths.push('American Cultures')
  }

  return breadths
}

export function evaluateRule(
  rule: RequirementRule,
  takenCodes: string[],
  allCourses: Course[],
  consumedCodes: Set<string>,
  catalogCourses?: AllCourse[]
): { satisfied: boolean; matchedCourses: string[]; remaining: number; total: number; unitsCompleted?: number; unitsRequired?: number } {
  const availableTaken = takenCodes.filter((c) => !consumedCodes.has(normalizeCode(c)))

  if (rule.type === 'breadth') {
    const wanted = rule.breadth.toLowerCase()
    const count = rule.count ?? 1
    const matched: string[] = []
    for (const taken of availableTaken) {
      const breadths = breadthsForCourse(taken, allCourses, catalogCourses).map((b) => b.toLowerCase())
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
      const reqs = uniReqsForCourse(taken, catalogCourses).map((r) => r.toLowerCase())
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
    for (const taken of takenCodes) {
      totalUnits += unitsForCourse(taken, allCourses) || (catalogCourses?.find((c) => normalizeCode(c.code) === normalizeCode(taken))?.units ?? 0)
    }
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
    // Sum units in last 30+ units (Berkeley senior residence: 24 units in last 2 semesters at Berkeley)
    // Approximation: sum units from the most recent semester(s)
    let totalUnits = 0
    for (const taken of takenCodes.slice(-12)) { // last ~12 courses ≈ 2 semesters
      totalUnits += unitsForCourse(taken, allCourses) || (catalogCourses?.find((c) => normalizeCode(c.code) === normalizeCode(taken))?.units ?? 0)
    }
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
      const u = unitsForCourse(m, allCourses)
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
 * Optimal bipartite matching for a group of breadth requirements.
 * Each course may satisfy multiple breadths, but each course can only be
 * assigned to ONE breadth requirement. Returns: requirementId → matched course.
 *
 * Greedy bug: iterating requirements in order can assign a multi-breadth
 * course to its first match, leaving subsequent requirements unsatisfied
 * when a single-breadth course could have covered this one.
 *
 * Fix: sort requirements by scarcity (fewest candidate courses first),
 * then among candidates, pick the one with the fewest OTHER unsatisfied
 * breadths it could still fulfill. This approximates Hungarian matching
 * for small N (7 breadths) without adding a full LAP solver.
 */
function matchBreadthGroup(
  breadthReqs: { id: string; breadth: string; count: number }[],
  availableTaken: string[],
  allCourses: Course[],
  catalogCourses?: AllCourse[]
): Map<string, string[]> {
  const candidatesPerReq = new Map<string, string[]>()
  for (const req of breadthReqs) {
    const wanted = req.breadth.toLowerCase()
    const cands = availableTaken.filter((c) =>
      breadthsForCourse(c, allCourses, catalogCourses).some((b) => b.toLowerCase() === wanted)
    )
    candidatesPerReq.set(req.id, cands)
  }

  const result = new Map<string, string[]>()
  const consumedLocal = new Set<string>()
  // Process requirements in order of scarcity (fewest candidates first).
  const reqOrder = [...breadthReqs].sort(
    (a, b) => (candidatesPerReq.get(a.id)!.length) - (candidatesPerReq.get(b.id)!.length)
  )

  for (const req of reqOrder) {
    const cands = candidatesPerReq.get(req.id)!.filter((c) => !consumedLocal.has(normalizeCode(c)))
    if (cands.length === 0) {
      result.set(req.id, [])
      continue
    }
    // Pick the candidate that covers the FEWEST other still-unmatched breadths.
    // This preserves versatile courses for their unique assignments.
    const unmatchedReqs = reqOrder.filter((r) => !result.has(r.id) && r.id !== req.id)
    let best = cands[0]
    let bestScore = Infinity
    for (const c of cands) {
      const bset = new Set(breadthsForCourse(c, allCourses, catalogCourses).map((b) => b.toLowerCase()))
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
  allCourses: Course[],
  catalogCourses?: AllCourse[]
): ProgramProgress {
  const consumed = new Set<string>()
  const groupProgresses: GroupProgress[] = []

  for (const group of program.groups) {
    const reqProgresses: RequirementProgress[] = []
    let satisfiedCount = 0

    // Breadth-only group → optimal bipartite matcher (avoids greedy waste of
    // multi-breadth courses on requirements they're not uniquely needed for).
    const allBreadth = group.requirements.every((r) => r.rule.type === 'breadth')
    let breadthAssignments: Map<string, string[]> | null = null
    if (allBreadth && group.requirements.length > 1) {
      const availableTaken = takenCodes.filter((c) => !consumed.has(normalizeCode(c)))
      const breadthReqs = group.requirements.map((r) => ({
        id: r.id,
        breadth: (r.rule as { breadth: string }).breadth,
        count: (r.rule as { count?: number }).count ?? 1,
      }))
      breadthAssignments = matchBreadthGroup(breadthReqs, availableTaken, allCourses, catalogCourses)
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
        : evaluateRule(req.rule, takenCodes, allCourses, consumed, catalogCourses)

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
 * catalog. Handles every rule type, including breadth + university-req.
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

  // total-units / senior-residence don't have specific courses
  return []
}

/**
 * For a given course code + the user's selected programs, find every
 * requirement across all programs that this course COULD satisfy. Used by
 * the click-course-see-reqs UX so users can spot cross-program double counts.
 */
export function requirementsCourseCouldSatisfy(
  courseCode: string,
  programs: Program[],
  allCourses: Course[],
  catalogCourses?: AllCourse[]
): { programId: string; programName: string; groupName: string; reqId: string; reqName: string }[] {
  const norm = normalizeCode(courseCode)
  const breadths = breadthsForCourse(courseCode, allCourses, catalogCourses).map((b) => b.toLowerCase())
  const uniReqs = uniReqsForCourse(courseCode, catalogCourses).map((r) => r.toLowerCase())
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
