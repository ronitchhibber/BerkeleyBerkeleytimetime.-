import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { gqlQuery } from './lib/graphql-client.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const PAST_TERMS = [
  { year: 2026, semester: 'Spring' }, { year: 2026, semester: 'Summer' }, { year: 2026, semester: 'Fall' },
  { year: 2025, semester: 'Spring' }, { year: 2025, semester: 'Summer' }, { year: 2025, semester: 'Fall' },
  { year: 2024, semester: 'Spring' }, { year: 2024, semester: 'Summer' }, { year: 2024, semester: 'Fall' },
  { year: 2023, semester: 'Spring' }, { year: 2023, semester: 'Summer' }, { year: 2023, semester: 'Fall' },
  { year: 2022, semester: 'Spring' }, { year: 2022, semester: 'Summer' }, { year: 2022, semester: 'Fall' },
  { year: 2021, semester: 'Spring' }, { year: 2021, semester: 'Summer' }, { year: 2021, semester: 'Fall' },
  { year: 2020, semester: 'Spring' }, { year: 2020, semester: 'Summer' }, { year: 2020, semester: 'Fall' },
]

const QUERY = `
  query CatalogSearch($year: Int!, $semester: Semester!, $page: Int!, $pageSize: Int!) {
    catalogSearch(year: $year, semester: $semester, page: $page, pageSize: $pageSize) {
      totalCount
      results {
        subject courseNumber number
        courseTitle courseDescription
        unitsMin unitsMax
        academicCareer academicOrganizationName
      }
    }
  }
`

interface RawCourse {
  subject: string; courseNumber: string; number: string
  courseTitle: string; courseDescription: string
  unitsMin: number; unitsMax: number
  academicCareer: string; academicOrganizationName: string
}

interface MergedCourse {
  code: string
  title: string
  units: number
  department: string
  description: string
  level: 'lower' | 'upper' | 'graduate'
  semestersOffered: string[]
}

const PAGE_SIZE = 50
const MAX_RETRIES = 5

function getLevel(cn: string, career: string): 'lower' | 'upper' | 'graduate' {
  if (career === 'GRAD') return 'graduate'
  const n = parseInt(cn.replace(/\D/g, ''))
  return isNaN(n) ? 'lower' : n < 100 ? 'lower' : n < 200 ? 'upper' : 'graduate'
}

async function fetchPage(year: number, semester: string, page: number): Promise<{ totalCount: number; results: RawCourse[] }> {
  let lastError: unknown
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const data = await gqlQuery<{ catalogSearch: { totalCount: number; results: RawCourse[] } }>(
        QUERY,
        { year, semester, page, pageSize: PAGE_SIZE }
      )
      return data.catalogSearch
    } catch (e) {
      lastError = e
      const wait = Math.min(2000 * Math.pow(2, attempt), 15000)
      console.warn(`    page ${page} attempt ${attempt + 1} failed (${(e as Error).message}). retrying in ${wait}ms…`)
      await new Promise((r) => setTimeout(r, wait))
    }
  }
  throw lastError
}

async function fetchTerm(year: number, semester: string): Promise<RawCourse[]> {
  const all: RawCourse[] = []
  // Get total count first
  const first = await fetchPage(year, semester, 0)
  all.push(...first.results)
  const total = first.totalCount
  const totalPages = Math.ceil(total / PAGE_SIZE)
  console.log(`  ${semester} ${year}: totalCount=${total}, pages=${totalPages}, page 0 returned ${first.results.length}`)

  // Fetch remaining pages with retries
  for (let page = 1; page < totalPages; page++) {
    try {
      const r = await fetchPage(year, semester, page)
      all.push(...r.results)
    } catch (e) {
      console.error(`    FAILED page ${page} after ${MAX_RETRIES} retries:`, (e as Error).message)
      // continue to next page rather than abort
    }
  }
  console.log(`  ${semester} ${year}: collected ${all.length}/${total} (${total - all.length} missing)`)
  return all
}

async function main() {
  const merged = new Map<string, MergedCourse>()

  for (const term of PAST_TERMS) {
    console.log(`\n━━━ ${term.semester} ${term.year} ━━━`)
    try {
      const results = await fetchTerm(term.year, term.semester)
      for (const r of results) {
        const code = `${r.subject} ${r.courseNumber}`
        const semLabel = `${term.semester} ${term.year}`
        if (!merged.has(code)) {
          merged.set(code, {
            code,
            title: r.courseTitle || code,
            units: r.unitsMax || r.unitsMin || 0,
            department: r.academicOrganizationName || r.subject,
            description: r.courseDescription || '',
            level: getLevel(r.courseNumber, r.academicCareer),
            semestersOffered: [semLabel],
          })
        } else {
          const existing = merged.get(code)!
          if (!existing.semestersOffered.includes(semLabel)) {
            existing.semestersOffered.push(semLabel)
          }
          if (!existing.title && r.courseTitle) existing.title = r.courseTitle
          if (!existing.description && r.courseDescription) existing.description = r.courseDescription
          if (!existing.units && (r.unitsMax || r.unitsMin)) existing.units = r.unitsMax || r.unitsMin
        }
      }
      console.log(`  → cumulative unique: ${merged.size}`)
    } catch (e) {
      console.error(`  FAILED ${term.semester} ${term.year}:`, (e as Error).message)
    }

    // Save periodically
    const outputPath = join(__dirname, '..', 'output', 'all-courses.json')
    writeFileSync(
      outputPath,
      JSON.stringify(
        {
          meta: {
            generatedAt: new Date().toISOString(),
            totalCourses: merged.size,
            termsScraped: PAST_TERMS.indexOf(term) + 1,
          },
          courses: [...merged.values()].sort((a, b) => a.code.localeCompare(b.code)),
        },
        null,
        2
      )
    )
  }

  console.log(`\n━━━ Done: ${merged.size} unique courses ━━━`)
}

main().catch((e) => {
  console.error('Failed:', e)
  process.exit(1)
})
