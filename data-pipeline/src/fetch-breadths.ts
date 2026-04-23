import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { gqlQuery } from './lib/graphql-client.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const BREADTHS = [
  'American Cultures',
  'American Hist & Institutions',
  'Arts & Literature',
  'Biological Science',
  'Entry Level Writing',
  'Historical Studies',
  'International Studies',
  'Philosophy & Values',
  'Physical Science',
  'Reading and Composition A',
  'Reading and Composition B',
  'Social & Behavioral Sciences',
]

// Scan every term from Fall 2020 onwards so we capture breadth designations
// for any course that was ever offered with a breadth tag.
const TERMS = [
  { year: 2020, semester: 'Spring' }, { year: 2020, semester: 'Summer' }, { year: 2020, semester: 'Fall' },
  { year: 2021, semester: 'Spring' }, { year: 2021, semester: 'Summer' }, { year: 2021, semester: 'Fall' },
  { year: 2022, semester: 'Spring' }, { year: 2022, semester: 'Summer' }, { year: 2022, semester: 'Fall' },
  { year: 2023, semester: 'Spring' }, { year: 2023, semester: 'Summer' }, { year: 2023, semester: 'Fall' },
  { year: 2024, semester: 'Spring' }, { year: 2024, semester: 'Summer' }, { year: 2024, semester: 'Fall' },
  { year: 2025, semester: 'Spring' }, { year: 2025, semester: 'Summer' }, { year: 2025, semester: 'Fall' },
  { year: 2026, semester: 'Spring' }, { year: 2026, semester: 'Summer' }, { year: 2026, semester: 'Fall' },
]

const QUERY = `
  query B($year: Int!, $semester: Semester!, $breadth: String!, $page: Int!, $pageSize: Int!) {
    catalogSearch(year: $year, semester: $semester, filters: { breadths: [$breadth] }, page: $page, pageSize: $pageSize) {
      totalCount
      results { subject courseNumber }
    }
  }
`

async function fetchBreadthForTerm(year: number, semester: string, breadth: string): Promise<string[]> {
  const codes = new Set<string>()
  let page = 0
  const pageSize = 100
  let lastCount = -1

  while (true) {
    try {
      const data = await gqlQuery<{
        catalogSearch: { totalCount: number; results: { subject: string; courseNumber: string }[] }
      }>(QUERY, { year, semester, breadth, page, pageSize })

      const results = data.catalogSearch.results
      if (results.length === 0) break

      for (const r of results) codes.add(`${r.subject} ${r.courseNumber}`)

      // Stop if no new progress
      if (codes.size === lastCount) break
      lastCount = codes.size
      page++
      if (page > 50) break // safety
    } catch (e) {
      console.warn(`      ${breadth} ${semester} ${year} page ${page} error: ${(e as Error).message}`)
      break
    }
  }
  return [...codes]
}

async function main() {
  // courseCode → Set<breadth>
  const courseBreadths = new Map<string, Set<string>>()

  for (const breadth of BREADTHS) {
    console.log(`\n━━━ ${breadth} ━━━`)
    for (const term of TERMS) {
      const codes = await fetchBreadthForTerm(term.year, term.semester, breadth)
      for (const code of codes) {
        if (!courseBreadths.has(code)) courseBreadths.set(code, new Set())
        courseBreadths.get(code)!.add(breadth)
      }
      if (codes.length > 0) console.log(`  ${term.semester} ${term.year}: ${codes.length} courses`)
    }
    console.log(`  → total unique with ${breadth}: ${[...courseBreadths.values()].filter(s => s.has(breadth)).length}`)
  }

  // Convert to object for JSON
  const output: Record<string, string[]> = {}
  for (const [code, breadths] of courseBreadths) {
    output[code] = [...breadths].sort()
  }

  const outputPath = join(__dirname, '..', 'output', 'course-breadths.json')
  writeFileSync(outputPath, JSON.stringify({
    meta: { generatedAt: new Date().toISOString(), totalCourses: Object.keys(output).length },
    breadths: BREADTHS,
    courseBreadths: output,
  }, null, 2))

  console.log(`\n━━━ Done: ${Object.keys(output).length} courses with breadth data ━━━`)
}

main().catch((e) => {
  console.error('Failed:', e)
  process.exit(1)
})
