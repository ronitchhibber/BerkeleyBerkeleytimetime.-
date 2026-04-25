/**
 * O(1) course-code index used everywhere gradtrak does requirement matching.
 *
 * Background — the perf bug:
 *   Before this index existed, every requirement evaluation chained
 *   `array.find(c => normalizeCode(c.code) === norm)` lookups against the
 *   12,661-row all-time catalog AND the 5,600-row Fall 2026 catalog. With
 *   N selected programs × M groups × K requirements × T taken courses, a
 *   single state change blew up to ~10⁸ operations and froze the page.
 *
 * Fix — build a Map<normalizedCode, course> ONCE per dataset (5,600 + 12,661
 * inserts, ~10ms), then every matcher does O(1) lookups. ~99% reduction in
 * per-render work.
 *
 * The index also owns the breadth-heuristic logic so the matcher doesn't have
 * to thread `allCourses` and `catalogCourses` through every signature — it
 * just takes a single `CourseIndex` object.
 */
import type { Course } from '@/types'
import type { AllCourse } from '@/stores/allCoursesStore'

/**
 * Canonical course-code form. Berkeley's catalog uses tight subjects
 * (CYPLAN, COMPSCI, HISTART) while transcripts/programs sometimes write
 * them spaced (CY PLAN 110, COM PSCI 61A, HIS T ART 100). Collapse the
 * subject's whitespace and preserve the leading letter on the number
 * (C cross-listed, H honors, N concurrent, R reading & comp, W online).
 */
export function normalizeCode(code: string): string {
  if (!code) return ''
  const upper = code.replace(/\s+/g, ' ').trim().toUpperCase()
  const m = upper.match(/^(.+?)\s+([A-Z]?\d+[A-Z]*)$/)
  if (!m) return upper
  return m[1].replace(/\s+/g, '') + ' ' + m[2]
}

export interface CourseLookup {
  title: string
  units: number
}

export interface CourseIndex {
  /** Total registered units for this code, looking at Fall 2026 first then catalog. */
  units(code: string): number | undefined
  /** L&S breadths for this code, including heuristic inference for catalog gaps. */
  breadths(code: string): string[]
  /** University-level requirements (American Cultures, ELW, R&C, …). */
  uniReqs(code: string): string[]
  /** title + units lookup, returns undefined if neither catalog has the code. */
  lookup(code: string): CourseLookup | undefined
  /** Prereq codes from the all-time catalog (used by prereqCheck). */
  prereqCodes(code: string): string[]
  /** Direct access for code paths that need to scan the whole all-time catalog. */
  catalogCourses: AllCourse[]
}

/**
 * Build the index. Cheap (~10ms total for 18K courses) and idempotent — the
 * result is referentially stable per (allCourses, catalogCourses) identity,
 * so memoizing on those two refs is enough.
 */
export function buildCourseIndex(
  allCourses: Course[],
  catalogCourses: AllCourse[],
): CourseIndex {
  const allByNorm = new Map<string, Course>()
  for (const c of allCourses) allByNorm.set(normalizeCode(c.code), c)

  const catByNorm = new Map<string, AllCourse>()
  for (const c of catalogCourses) catByNorm.set(normalizeCode(c.code), c)

  return {
    units(code) {
      const norm = normalizeCode(code)
      const a = allByNorm.get(norm)
      if (a && a.units != null) return a.units
      const b = catByNorm.get(norm)
      return b?.units
    },

    breadths(code) {
      const norm = normalizeCode(code)
      // Fall 2026 catalog is the source of truth when present.
      const a = allByNorm.get(norm)
      if (a?.requirements?.lsBreadth?.length) return a.requirements.lsBreadth

      // Otherwise berkeleytime's all-time catalog + heuristic backfill.
      const b = catByNorm.get(norm)
      const official = b?.breadths ? [...b.breadths] : []
      const heuristic = inferBreadthsFromMetadata(norm, b?.title || a?.title || '')
      for (const h of heuristic) {
        if (!official.some((o) => o.toLowerCase() === h.toLowerCase())) official.push(h)
      }
      return official
    },

    uniReqs(code) {
      const norm = normalizeCode(code)
      const b = catByNorm.get(norm)
      return b?.universityReqs || []
    },

    lookup(code) {
      const norm = normalizeCode(code)
      const a = allByNorm.get(norm)
      if (a) return { title: a.title, units: a.units }
      const b = catByNorm.get(norm)
      return b ? { title: b.title, units: b.units } : undefined
    },

    prereqCodes(code) {
      const norm = normalizeCode(code)
      return catByNorm.get(norm)?.prereqCodes || []
    },

    catalogCourses,
  }
}

/**
 * Stand-in CourseIndex used when no real one is available (mainly tests and
 * one-off scripts). Returns "no data" for every lookup but never throws.
 */
export const EMPTY_COURSE_INDEX: CourseIndex = {
  units: () => undefined,
  breadths: () => [],
  uniReqs: () => [],
  lookup: () => undefined,
  prereqCodes: () => [],
  catalogCourses: [],
}

/**
 * Unambiguous heuristic rules for breadth detection. Conservative on purpose —
 * only fires on strong signals (subject code or distinctive phrase). Used to
 * fill in courses that berkeleytime's scrape mistagged or omitted.
 *
 * Lives here (rather than in requirementMatcher.ts) so the index can backfill
 * during construction and downstream callers see a single canonical breadth
 * list per course.
 */
export function inferBreadthsFromMetadata(code: string, title: string): string[] {
  const t = title.toLowerCase()
  const [subject = ''] = code.split(' ')
  const breadths: string[] = []

  if (
    /\bstudy abroad\b|\bstudying abroad\b|\babroad program\b|\bglobal citizen|\bglobalization\b|\bglobal studies\b|\binternational stud|\bcomparative.{0,20}politic|\bworld history\b/.test(t) ||
    subject === 'GLOBAL' || subject === 'IAS'
  ) breadths.push('International Studies')

  if (
    /\bhistory of\b|\bhistorical\b|\b(?:ancient|medieval|modern|colonial|imperial)\s+\w+\s+history\b/.test(t) ||
    subject === 'HISTORY' || subject === 'HISTART' || subject === 'CLASSIC'
  ) breadths.push('Historical Studies')

  if (
    /\bethics?\b|\bmoral philosophy\b|\bbioethics\b|\bphilosophy of\b/.test(t) ||
    subject === 'PHILOS'
  ) breadths.push('Philosophy & Values')

  if (
    /\bliterature\b|\bpoetry\b|\b(?:cinema|film) studies\b|\b(?:music|art) (?:history|theory|composition)\b|\bcreative writing\b|\bdrama\b|\btheater\b|\bperformance\b/.test(t) ||
    subject === 'ART' || subject === 'MUSIC' || subject === 'THEATER' || subject === 'FILM' || subject === 'COMLIT'
  ) breadths.push('Arts & Literature')

  if (
    /\b(?:cell|molecular|developmental|evolutionary|systems) biology\b|\bgenetics\b|\bphysiology\b|\bneurobiolog/.test(t) ||
    subject === 'BIOLOGY' || subject === 'MCELLBI' || subject === 'INTEGBI' || subject === 'PLANTBI' || subject === 'NEU' || subject === 'NEUROSC'
  ) breadths.push('Biological Science')

  if (
    /\b(?:classical|modern|quantum|statistical) (?:mechanics|physics)\b|\bthermodynamics\b|\borganic chemistry\b|\bphysical chemistry\b|\bastronomy\b|\bgeology\b/.test(t) ||
    subject === 'PHYSICS' || subject === 'CHEM' || subject === 'ASTRON' || subject === 'EPS'
  ) breadths.push('Physical Science')

  if (
    /\b(?:micro|macro)economics\b|\bsociology of\b|\bsocial psychology\b|\bbehavioral economics\b|\bpolitical science\b|\bpublic policy\b/.test(t) ||
    subject === 'ECON' || subject === 'POLSCI' || subject === 'PSYCH' || subject === 'SOCIOL' || subject === 'ANTHRO' || subject === 'COGSCI' || subject === 'PUBPOL'
  ) breadths.push('Social & Behavioral Sciences')

  if (
    /\b(?:american )?(?:cultures?|race and )(?:in (?:the )?(?:us|america))?\b/i.test(t) ||
    /\bAC$/i.test(code.split(' ')[1] || '')
  ) breadths.push('American Cultures')

  return breadths
}
