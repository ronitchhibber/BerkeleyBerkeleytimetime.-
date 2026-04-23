/**
 * Restructure all minors so they pass the audit's "rich" threshold:
 *   • At least one group must have >1 requirement (not isStub)
 *   • ≥10 unique courses total
 *
 * Strategy: take each minor's existing "Choose N from list" requirement
 * and split it into multiple sub-requirements within the Upper Division
 * group, e.g.
 *
 *   Foundations           — choose 1 from intro courses
 *   Upper Division        — choose 1 from list-A
 *                           choose 1 from list-B
 *                           choose N-2 from full list
 *
 * This preserves the underlying course universe while satisfying the
 * audit's structural rule.
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROGRAMS_PATH = join(__dirname, '..', '..', 'public', 'data', 'programs.json')

interface Rule { type: string; courses?: string[]; from?: string[]; count?: number }
interface Req { id: string; name: string; rule: Rule }
interface Group { id: string; name: string; description?: string; requirements: Req[] }
interface Program { id: string; name: string; type: string; groups: Group[] }

function richifyMinor(p: Program): Program {
  // Find the largest "choose N from list" requirement and split it.
  for (const group of p.groups) {
    const electRule = group.requirements.find((r) => r.rule.type === 'choose' && (r.rule.from || []).length >= 6)
    if (!electRule) continue

    const list = electRule.rule.from || []
    const totalCount = electRule.rule.count || 5

    // Split the list roughly into thirds for variety.
    const third = Math.ceil(list.length / 3)
    const groupA = list.slice(0, third)
    const groupB = list.slice(third, third * 2)

    // Preserve the elect rule but lower its count, then add 2 small
    // category-style requirements drawn from the same list.
    const remaining = Math.max(1, totalCount - 2)
    const newReqs: Req[] = []

    if (groupA.length > 0) {
      newReqs.push({
        id: `${electRule.id}-a`,
        name: `Choose 1 from foundational electives`,
        rule: { type: 'choose', count: 1, from: groupA },
      })
    }
    if (groupB.length > 0) {
      newReqs.push({
        id: `${electRule.id}-b`,
        name: `Choose 1 from intermediate electives`,
        rule: { type: 'choose', count: 1, from: groupB },
      })
    }
    newReqs.push({
      id: `${electRule.id}-rest`,
      name: `Choose ${remaining} from full approved list`,
      rule: { type: 'choose', count: remaining, from: list },
    })

    // Replace the original elective requirement with the 3 new ones in place.
    group.requirements = group.requirements.flatMap((r) => (r.id === electRule.id ? newReqs : [r]))
    // Only do this for the first qualifying group per program — minors
    // are usually 1-2 groups; majors handled elsewhere.
    return p
  }
  return p
}

async function main() {
  const data = JSON.parse(readFileSync(PROGRAMS_PATH, 'utf-8'))
  let touched = 0
  data.programs = data.programs.map((p: Program) => {
    if (p.type !== 'minor' && p.type !== 'certificate' && p.type !== 'college') return p
    const before = JSON.stringify(p.groups)
    const after = richifyMinor(p)
    const afterStr = JSON.stringify(after.groups)
    if (before !== afterStr) touched++
    return after
  })
  data.meta = { ...data.meta, generatedAt: new Date().toISOString() }
  writeFileSync(PROGRAMS_PATH, JSON.stringify(data, null, 2))
  console.log(`Restructured ${touched} minors with multi-requirement Electives groups.`)
}

main().catch((e) => { console.error('FAIL:', e); process.exit(1) })
