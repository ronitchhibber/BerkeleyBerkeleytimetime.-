/**
 * Apply all BtLL major requirement definitions to programs.json.
 *
 * Each BtLL constant defines its own structure (lists of approved courses,
 * NCoursesRequirement counts, AndRequirement groupings). We translate these
 * into our programs.json schema:
 *   { "ECON 100A" } → 'ECON 100A'
 *   one_common_course([course], list) → choose rule
 *   NCoursesRequirement {matches, N, "name"} → count: N
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BTLL_PATH = '/tmp/btll-ref.ts'
const PROGRAMS_PATH = join(__dirname, '..', '..', 'public', 'data', 'programs.json')

interface Rule {
  type: 'specific' | 'choose' | 'category' | 'units' | 'breadth'
  [k: string]: unknown
}
interface Req {
  id: string
  name: string
  description?: string
  rule: Rule
}
interface Group {
  id: string
  name: string
  description?: string
  requirements: Req[]
}

function extractCourses(s: string): string[] {
  return [...s.matchAll(/\{\s*"([A-Z]+(?:\s+[A-Z0-9]+)*)"\s*\}/g)].map((m) => m[1])
}

function getConstant(code: string, name: string): string {
  const m = code.match(new RegExp(`export const ${name} = \\\`([\\s\\S]*?)\\\`;`))
  return m ? m[1] : ''
}

/**
 * Find every NCoursesRequirement declaration with its count + name. Then
 * resolve which course list backs it by walking the BtLL declarations.
 */
function parseBtll(btll: string): Req[] {
  const reqs: Req[] = []

  // First, build all declared lists. We capture two patterns:
  //   List<Course> X [{...}, {...}]                    — top-level lists
  //   List<Course> Y filter(courses, ...)              — filters, deferred
  // For nested filter callbacks, we ALSO scan for `<var>_req [...]` inside
  // the body to capture the source list.

  const lists = new Map<string, string[]>()

  // Top-level List<Course> declarations
  for (const m of btll.matchAll(/List<Course>\s+(\w+)\s*\[([^\]]*?)\]/g)) {
    const cs = extractCourses(m[2])
    if (cs.length > 0) lists.set(m[1], cs)
  }

  // Find every NCoursesRequirement
  // Format: NCoursesRequirement <var> {<sourceList>, <count>, "<name>"}
  // The sourceList might be the eligible list (length might be 1 in BtLL's greedy pattern)
  // Walk left-to-right to find the proper source.
  const ncRe = /NCoursesRequirement\s+(\w+)\s*\{([^}]+)\}/g
  for (const m of btll.matchAll(ncRe)) {
    const args = m[2].split(',').map((s) => s.trim())
    if (args.length < 3) continue
    const matchesVar = args[0]
    const count = parseInt(args[args.length - 2]) // sometimes BtLL has 4 args
    const name = args[args.length - 1].replace(/^"|"$/g, '')
    if (isNaN(count) || !name) continue

    // Heuristic resolution: try common backing-var conventions
    const candidates = [
      matchesVar,
      matchesVar.replace(/_matches$/, '_list'),
      matchesVar.replace(/_eligible$/, '_list'),
      matchesVar.replace(/_courses$/, '_list'),
      matchesVar.replace(/_pool$/, '_list'),
    ]
    let courses: string[] | undefined
    for (const c of candidates) {
      if (lists.has(c)) {
        courses = lists.get(c)
        break
      }
    }
    if (!courses) {
      // Fallback: search for any nested `<...>_req` list inside any filter body
      // Look for the variable's filter() defining body
      const bodyRe = new RegExp(`List<Course>\\s+${matchesVar}\\s+filter\\([^,]+,\\s*[^)]*\\)\\s*\\{?([\\s\\S]*?)(?:NCoursesRequirement|\\n\\s*List<|$)`)
      const bm = btll.match(bodyRe)
      if (bm) {
        const inner = extractCourses(bm[1])
        if (inner.length > 0) courses = inner
      }
    }
    if (!courses) continue

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const rule: Rule = courses.length === 1
      ? { type: 'specific', courses }
      : { type: 'choose', count, from: courses }
    reqs.push({ id, name, rule })
  }

  return reqs
}

/**
 * Set or merge a major's requirements with the BtLL-derived ones.
 * Uses fuzzy match on program name to find the right entry.
 */
function applyToProgram(programs: any[], programNames: string[], groups: Group[]) {
  for (const name of programNames) {
    const prog = programs.find(
      (p) => p.name.toLowerCase() === name.toLowerCase() ||
             p.id === name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    )
    if (prog) {
      prog.groups = groups
      console.log(`  ✓ Applied to "${prog.name}" (${groups.length} groups, ${groups.reduce((a, g) => a + g.requirements.length, 0)} reqs)`)
      return prog
    }
  }
  console.log(`  ✗ No program found matching: ${programNames.join(' / ')}`)
  return null
}

function main() {
  const code = readFileSync(BTLL_PATH, 'utf-8')
  const programs = JSON.parse(readFileSync(PROGRAMS_PATH, 'utf-8'))

  console.log('\n=== Computer Science ===')
  let reqs = parseBtll(getConstant(code, 'COMPSCI_REQ_BTLL'))
  if (reqs.length > 0) {
    applyToProgram(programs.programs, ['Computer Science'], [
      { id: 'cs-major', name: 'Major Requirements', requirements: reqs }
    ])
  }

  console.log('\n=== Data Science ===')
  reqs = parseBtll(getConstant(code, 'DATASCI_REQ_BTLL'))
  if (reqs.length > 0) {
    // Data Sci has ~64 reqs so split into groups by name keyword
    const lower = reqs.filter((r) => /Calculus|Stat|CS|Data 8|introductory|Foundation/i.test(r.name))
    const upper = reqs.filter((r) => !/Calculus|Stat|CS|Data 8|introductory|Foundation/i.test(r.name))
    applyToProgram(programs.programs, ['Data Science'], [
      ...(lower.length > 0 ? [{ id: 'lower-div', name: 'Lower Division', requirements: lower }] : []),
      ...(upper.length > 0 ? [{ id: 'upper-div', name: 'Upper Division', requirements: upper }] : []),
    ])
  }

  console.log('\n=== EECS ===')
  reqs = parseBtll(getConstant(code, 'EECS_REQ_BTLL'))
  if (reqs.length > 0) {
    applyToProgram(programs.programs, ['Electrical Engineering & Computer Sciences', 'Electrical Engineering and Computer Sciences', 'EECS'], [
      { id: 'eecs-major', name: 'Major Requirements', requirements: reqs }
    ])
  }

  console.log('\n=== Mechanical Engineering ===')
  reqs = parseBtll(getConstant(code, 'MECHE_REQ_BTLL'))
  if (reqs.length > 0) {
    applyToProgram(programs.programs, ['Mechanical Engineering'], [
      { id: 'meche-major', name: 'Major Requirements', requirements: reqs }
    ])
  }

  console.log('\n=== Applied Mathematics ===')
  reqs = parseBtll(getConstant(code, 'APPLIED_MATH_REQ_BTLL'))
  if (reqs.length > 0) {
    applyToProgram(programs.programs, ['Applied Mathematics'], [
      { id: 'amath-major', name: 'Major Requirements', requirements: reqs }
    ])
  }

  console.log('\n=== Business Administration (Haas) ===')
  reqs = parseBtll(getConstant(code, 'BUSINESS_REQ_BTLL'))
  if (reqs.length > 0) {
    applyToProgram(programs.programs, ['Business Administration', 'Haas Business'], [
      { id: 'bus-major', name: 'Major Requirements', requirements: reqs }
    ])
  }

  console.log('\n=== UC Reqs to L&S ===')
  // Add the 120-unit minimum + senior residence + ELRC to L&S program
  const ls = programs.programs.find((p: any) => p.id === 'ls-breadth')
  if (ls) {
    // Add UC graduation requirements as a new group
    const ucReqs: Req[] = [
      // Note: these would need a 'units' or 'meta' rule type to evaluate properly
      // For now use 'specific' as a marker — matcher won't satisfy them
      // until we add a 'meta' rule type (TODO).
    ]
    // Add Entry Level Writing if user has any RC A course (typically also satisfies ELW)
    // We use breadth rule for "Reading and Composition A" — it's already in essentials
    console.log('  (UC reqs already partially covered by R&C A in essentials)')
  }

  writeFileSync(PROGRAMS_PATH, JSON.stringify(programs, null, 2))
  console.log('\nSaved programs.json')
}

main()
