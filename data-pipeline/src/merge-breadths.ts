/**
 * Merge course-breadths.json into all-courses.json AND rewrite the
 * L&S Seven-Course Breadth program to use the new `breadth` rule type.
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const BT_TO_LS_BREADTH_NAME: Record<string, string> = {
  'Arts & Literature': 'Arts & Literature',
  'Biological Science': 'Biological Science',
  'Historical Studies': 'Historical Studies',
  'International Studies': 'International Studies',
  'Philosophy & Values': 'Philosophy & Values',
  'Physical Science': 'Physical Science',
  'Social & Behavioral Sciences': 'Social & Behavioral Sciences',
}

async function main() {
  const breadthsPath = join(__dirname, '..', 'output', 'course-breadths.json')
  const coursesPath = join(__dirname, '..', '..', 'public', 'data', 'all-courses.json')
  const programsPath = join(__dirname, '..', '..', 'public', 'data', 'programs.json')

  const breadthData = JSON.parse(readFileSync(breadthsPath, 'utf-8'))
  const coursesData = JSON.parse(readFileSync(coursesPath, 'utf-8'))
  const programsData = JSON.parse(readFileSync(programsPath, 'utf-8'))

  const courseBreadths: Record<string, string[]> = breadthData.courseBreadths

  // 1. Merge breadths into each course
  let withBreadths = 0
  for (const c of coursesData.courses) {
    const b = courseBreadths[c.code]
    if (b && b.length > 0) {
      c.breadths = b
      withBreadths++
    }
  }
  console.log(`Tagged ${withBreadths}/${coursesData.courses.length} courses with breadths`)

  // 2. Rewrite L&S Seven-Course Breadth program
  const ls = programsData.programs.find((p: { id: string }) => p.id === 'ls-breadth')
  if (!ls) {
    console.error('L&S program not found!')
    process.exit(1)
  }

  // Remove ALL existing breadth-area groups (the old hardcoded ones).
  // We replace them with one canonical "Seven-Course Breadth" group that
  // uses the official Berkeley breadth designation per course.
  const SEVEN_BREADTH_NAMES = new Set(Object.values(BT_TO_LS_BREADTH_NAME))
  ls.groups = ls.groups.filter((g: { id: string; name?: string; requirements?: { name?: string }[] }) => {
    if (g.id === 'seven-course-breadth') return false
    // Drop a group if it's named after a single breadth area (the old structure)
    if (g.name && SEVEN_BREADTH_NAMES.has(g.name)) return false
    return true
  })

  const breadthGroup = {
    id: 'seven-course-breadth',
    name: 'Seven-Course Breadth',
    description:
      "Complete one course in each of the seven breadth areas. Auto-verified against each course's official Berkeley breadth designation.",
    requirements: Object.entries(BT_TO_LS_BREADTH_NAME).map(([bt, name]) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name,
      rule: { type: 'breadth' as const, breadth: bt, count: 1 },
    })),
  }

  // Insert breadth group right after Essential Skills if it exists
  const essIdx = ls.groups.findIndex((g: { id: string }) => g.id === 'essential-skills')
  if (essIdx >= 0) {
    ls.groups.splice(essIdx + 1, 0, breadthGroup)
  } else {
    ls.groups.unshift(breadthGroup)
  }

  // Also rewrite the Reading & Composition rules to use breadth
  const essentials = ls.groups.find((g: { id: string }) => g.id === 'essential-skills')
  if (essentials) {
    for (const req of essentials.requirements) {
      if (req.id === 'rc-a') {
        req.rule = { type: 'breadth', breadth: 'Reading and Composition A', count: 1 }
      } else if (req.id === 'rc-b') {
        req.rule = { type: 'breadth', breadth: 'Reading and Composition B', count: 1 }
      }
    }
  }

  console.log(`Updated L&S program with ${breadthGroup.requirements.length} breadth-rule requirements`)

  // 3. Save both
  writeFileSync(coursesPath, JSON.stringify(coursesData, null, 2))
  writeFileSync(programsPath, JSON.stringify(programsData, null, 2))
  console.log('Saved.')
}

main().catch((e) => {
  console.error('Failed:', e)
  process.exit(1)
})
