/**
 * Per-program audit report. For each major / minor / certificate / college,
 * counts requirements + total approved courses, classifies the data quality,
 * and writes a markdown report + JSON summary so the user can target the
 * worst gaps with their own research.
 *
 * Usage:
 *   npx tsx src/audit-programs.ts
 *
 * Outputs:
 *   output/audit-report.md    — human-readable, sortable summary table
 *   output/audit-report.json  — machine-readable detail per program
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROGRAMS_PATH = join(__dirname, '..', '..', 'public', 'data', 'programs.json')
const ALL_COURSES_PATH = join(__dirname, '..', '..', 'public', 'data', 'all-courses.json')
const OUT_MD = join(__dirname, '..', 'output', 'audit-report.md')
const OUT_JSON = join(__dirname, '..', 'output', 'audit-report.json')

interface Rule {
  type: string
  courses?: string[]
  from?: string[]
  count?: number
  units?: number
  breadth?: string
  req?: string
}
interface Req { id: string; name: string; rule: Rule }
interface Group { id: string; name: string; requirements: Req[] }
interface Program {
  id: string
  name: string
  type: 'major' | 'minor' | 'college' | 'certificate' | 'university'
  groups: Group[]
}

interface AuditedProgram {
  id: string
  name: string
  type: string
  totalGroups: number
  totalRequirements: number
  totalApprovedCourses: number
  invalidCourses: string[]
  hasNoCourses: boolean
  isStub: boolean
  isRich: boolean
  qualityTier: 'rich' | 'partial' | 'stub' | 'empty'
  notes: string[]
}

function ruleCourseList(rule: Rule): string[] {
  if (rule.type === 'specific') return rule.courses || []
  if (rule.type === 'choose' || rule.type === 'category' || rule.type === 'units') return rule.from || []
  return []
}

/**
 * A rule is "substantive" if it constrains course selection somehow — either
 * an explicit course list OR a catalog-attribute rule (breadth, university-req,
 * total-units, senior-residence). Used to distinguish "stub" from "substantive
 * but rule-driven" programs in the audit.
 */
function ruleIsSubstantive(rule: Rule): boolean {
  if ((rule.courses || []).length > 0) return true
  if ((rule.from || []).length > 0) return true
  return ['breadth', 'university-req', 'total-units', 'senior-residence'].includes(rule.type)
}

function normalizeCode(code: string): string {
  const upper = code.replace(/\s+/g, ' ').trim().toUpperCase()
  const m = upper.match(/^(.+?)\s+([A-Z]?\d+[A-Z]*)$/)
  if (!m) return upper
  return m[1].replace(/\s+/g, '') + ' ' + m[2]
}

function main() {
  const data = JSON.parse(readFileSync(PROGRAMS_PATH, 'utf-8')) as { programs: Program[] }
  const allCourses = JSON.parse(readFileSync(ALL_COURSES_PATH, 'utf-8')) as { courses: { code: string }[] }
  const validCodes = new Set(allCourses.courses.map((c) => normalizeCode(c.code)))

  const audited: AuditedProgram[] = data.programs.map((p) => {
    const totalGroups = p.groups?.length ?? 0
    let totalRequirements = 0
    const allCourseList = new Set<string>()
    const invalid: string[] = []

    for (const g of p.groups || []) {
      for (const r of g.requirements || []) {
        totalRequirements++
        for (const code of ruleCourseList(r.rule)) {
          allCourseList.add(code)
          // Check if this referenced course actually exists in the catalog history.
          const norm = normalizeCode(code)
          if (!validCodes.has(norm)) invalid.push(code)
        }
      }
    }

    const totalApprovedCourses = allCourseList.size
    // hasNoSubstantiveContent: every rule is a placeholder. A program with only
    // breadth/university-req/total-units rules IS substantive (catalog-driven).
    const hasNoSubstantiveContent = (p.groups || []).every((g) => (g.requirements || []).every((r) => !ruleIsSubstantive(r.rule)))
    const hasNoCourses = totalApprovedCourses === 0
    const allReqsAreSingles = (p.groups || []).every((g) => (g.requirements || []).length <= 1)
    const isStub = hasNoSubstantiveContent || (hasNoCourses && allReqsAreSingles)
    const isRich = totalRequirements >= 5 && totalApprovedCourses >= 10

    let qualityTier: AuditedProgram['qualityTier']
    if (totalRequirements === 0) qualityTier = 'empty'
    else if (hasNoSubstantiveContent) qualityTier = 'stub'
    else if (allReqsAreSingles && totalApprovedCourses < 10) qualityTier = 'partial'
    else if (totalRequirements < 3 || totalApprovedCourses < 10) qualityTier = 'partial'
    else qualityTier = 'rich'

    const notes: string[] = []
    if (invalid.length > 0) notes.push(`${invalid.length} course(s) not in catalog: ${invalid.slice(0, 3).join(', ')}${invalid.length > 3 ? '…' : ''}`)
    if (totalRequirements === 0) notes.push('No requirements at all')
    if (totalRequirements > 0 && totalApprovedCourses === 0) notes.push('Only breadth/category rules — no course lists')

    return {
      id: p.id,
      name: p.name,
      type: p.type,
      totalGroups,
      totalRequirements,
      totalApprovedCourses,
      invalidCourses: [...new Set(invalid)],
      hasNoCourses,
      isStub,
      isRich,
      qualityTier,
      notes,
    }
  })

  // Group by type + tier
  const byType: Record<string, Record<string, AuditedProgram[]>> = {}
  for (const a of audited) {
    byType[a.type] ??= { rich: [], partial: [], stub: [], empty: [] }
    byType[a.type][a.qualityTier].push(a)
  }

  // ── Markdown report ────────────────────────────────────────────────
  const lines: string[] = []
  lines.push('# Berkeleytime Programs — Audit Report')
  lines.push('')
  lines.push(`Generated: ${new Date().toISOString()}`)
  lines.push(`Source: ${PROGRAMS_PATH.replace(__dirname + '/../../', '')}`)
  lines.push('')
  lines.push('## Quality tiers')
  lines.push('- **Rich** — ≥5 requirements AND ≥10 approved courses listed')
  lines.push('- **Partial** — has some course data but limited (≤10 courses or all single-req groups)')
  lines.push('- **Stub** — has requirement structure but no course lists')
  lines.push('- **Empty** — no requirements at all')
  lines.push('')

  // Summary
  lines.push('## Summary by type')
  lines.push('')
  lines.push('| Type | Total | Rich | Partial | Stub | Empty |')
  lines.push('|---|---|---|---|---|---|')
  for (const [type, tiers] of Object.entries(byType)) {
    const total = Object.values(tiers).reduce((n, arr) => n + arr.length, 0)
    lines.push(`| ${type} | ${total} | ${tiers.rich.length} | ${tiers.partial.length} | ${tiers.stub.length} | ${tiers.empty.length} |`)
  }
  lines.push('')

  // Invalid course references
  const allInvalid = audited.flatMap((a) => a.invalidCourses.map((c) => ({ p: a.name, c })))
  const invalidByCourse = new Map<string, string[]>()
  for (const { p, c } of allInvalid) {
    invalidByCourse.set(c, [...(invalidByCourse.get(c) ?? []), p])
  }
  lines.push(`## Invalid course references (${invalidByCourse.size} unique codes referenced but not in catalog)`)
  lines.push('')
  if (invalidByCourse.size > 0) {
    lines.push('Most-referenced invalid codes:')
    const sorted = [...invalidByCourse.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 30)
    lines.push('')
    lines.push('| Code | # programs | Sample programs |')
    lines.push('|---|---|---|')
    for (const [code, programs] of sorted) {
      lines.push(`| \`${code}\` | ${programs.length} | ${programs.slice(0, 3).join(', ')} |`)
    }
  } else {
    lines.push('All referenced course codes match the catalog. ✓')
  }
  lines.push('')

  // Per-type detailed breakdown
  for (const type of ['major', 'minor', 'certificate', 'college', 'university']) {
    const items = audited.filter((a) => a.type === type)
    if (items.length === 0) continue
    lines.push(`## ${type.charAt(0).toUpperCase() + type.slice(1)}s (${items.length})`)
    lines.push('')
    lines.push('| Quality | Program | Reqs | Courses | Invalid | Notes |')
    lines.push('|---|---|---|---|---|---|')
    items.sort((a, b) => {
      const tier = { empty: 0, stub: 1, partial: 2, rich: 3 }
      if (tier[a.qualityTier] !== tier[b.qualityTier]) return tier[a.qualityTier] - tier[b.qualityTier]
      return a.name.localeCompare(b.name)
    })
    for (const a of items) {
      const badge = { empty: '🔴 empty', stub: '🟡 stub', partial: '🟠 partial', rich: '🟢 rich' }[a.qualityTier]
      const notes = a.notes.join('; ').replace(/\|/g, '\\|')
      lines.push(`| ${badge} | ${a.name} | ${a.totalRequirements} | ${a.totalApprovedCourses} | ${a.invalidCourses.length} | ${notes} |`)
    }
    lines.push('')
  }

  writeFileSync(OUT_MD, lines.join('\n'))
  writeFileSync(OUT_JSON, JSON.stringify(audited, null, 2))

  // Console summary
  console.log('Audit complete.')
  console.log(`  ${audited.length} programs audited`)
  for (const [type, tiers] of Object.entries(byType)) {
    const counts = Object.entries(tiers).map(([k, v]) => `${k}:${v.length}`).join(' ')
    console.log(`  ${type.padEnd(12)} → ${counts}`)
  }
  console.log(`  ${invalidByCourse.size} invalid course codes referenced across ${allInvalid.length} sites`)
  console.log()
  console.log(`Reports written:`)
  console.log(`  ${OUT_MD}`)
  console.log(`  ${OUT_JSON}`)
}

main()
