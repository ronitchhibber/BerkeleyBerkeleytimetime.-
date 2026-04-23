/**
 * Scrape university-requirement designations (American Cultures, American
 * History/Institutions, Entry Level Writing, Reading & Composition) from
 * berkeleytime's catalogSearch filter, in the same shape as breadths.
 */
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { gqlQuery } from './lib/graphql-client.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const UNI_REQS = [
  'Am Cultures & Am History',
  'American Cultures',
  'American History',
  'American Institutions',
  'Entry Level Writing & Reading Composition A',
  'Reading and Composition A',
  'Reading and Composition A or B',
  'Reading and Composition B',
]

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
  query U($year: Int!, $semester: Semester!, $req: String!, $page: Int!, $pageSize: Int!) {
    catalogSearch(year: $year, semester: $semester, filters: { universityRequirements: [$req] }, page: $page, pageSize: $pageSize) {
      totalCount
      results { subject courseNumber }
    }
  }
`

async function fetchUniReqForTerm(year: number, semester: string, req: string): Promise<string[]> {
  const codes = new Set<string>()
  let page = 0
  let lastCount = -1
  while (true) {
    try {
      const data = await gqlQuery<{
        catalogSearch: { totalCount: number; results: { subject: string; courseNumber: string }[] }
      }>(QUERY, { year, semester, req, page, pageSize: 100 })
      const results = data.catalogSearch.results
      if (results.length === 0) break
      for (const r of results) codes.add(`${r.subject} ${r.courseNumber}`)
      if (codes.size === lastCount) break
      lastCount = codes.size
      page++
      if (page > 50) break
    } catch (e) {
      console.warn(`      ${req} ${semester} ${year} page ${page} error`)
      break
    }
  }
  return [...codes]
}

async function main() {
  const courseUniReqs = new Map<string, Set<string>>()

  for (const req of UNI_REQS) {
    console.log(`\n━━━ ${req} ━━━`)
    for (const term of TERMS) {
      const codes = await fetchUniReqForTerm(term.year, term.semester, req)
      for (const c of codes) {
        if (!courseUniReqs.has(c)) courseUniReqs.set(c, new Set())
        courseUniReqs.get(c)!.add(req)
      }
      if (codes.length > 0) console.log(`  ${term.semester} ${term.year}: ${codes.length}`)
    }
    console.log(`  → unique with ${req}: ${[...courseUniReqs.values()].filter((s) => s.has(req)).length}`)
  }

  const output: Record<string, string[]> = {}
  for (const [code, reqs] of courseUniReqs) output[code] = [...reqs].sort()

  writeFileSync(join(__dirname, '..', 'output', 'course-uni-reqs.json'), JSON.stringify({
    meta: { generatedAt: new Date().toISOString(), totalCourses: Object.keys(output).length },
    universityRequirements: UNI_REQS,
    courseUniReqs: output,
  }, null, 2))
  console.log(`\n━━━ Done: ${Object.keys(output).length} courses ━━━`)
}

main().catch((e) => { console.error('Failed:', e); process.exit(1) })
