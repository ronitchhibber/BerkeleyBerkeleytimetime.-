/**
 * Scrape prerequisite data from berkeleytime's Course.requiredCourses field.
 * Returns a map of courseCode → { prereqs: [...], description: string }.
 */
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { gqlQuery } from './lib/graphql-client.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const BATCH_QUERY = `
  query AllCoursesPrereqs {
    courses {
      subject
      number
      requirements
      requiredCourses { subject number }
    }
  }
`

interface CourseEntry {
  subject: string
  number: string
  requirements: string | null
  requiredCourses: { subject: string; number: string }[]
}

async function main() {
  console.log('Fetching prerequisites for all courses…')
  const data = await gqlQuery<{ courses: CourseEntry[] }>(BATCH_QUERY)
  const courses = data.courses
  console.log(`Got ${courses.length} courses`)

  const out: Record<string, { prereqText: string | null; prereqCodes: string[] }> = {}
  let withPrereqs = 0
  let withText = 0
  for (const c of courses) {
    const code = `${c.subject} ${c.number}`
    const prereqCodes = (c.requiredCourses || []).map((r) => `${r.subject} ${r.number}`)
    const prereqText = c.requirements
    if (prereqCodes.length > 0 || prereqText) {
      out[code] = { prereqText, prereqCodes }
      if (prereqCodes.length > 0) withPrereqs++
      if (prereqText) withText++
    }
  }
  console.log(`  ${withPrereqs} courses with required-course list`)
  console.log(`  ${withText} courses with requirements text`)

  writeFileSync(join(__dirname, '..', 'output', 'course-prereqs.json'), JSON.stringify({
    meta: { generatedAt: new Date().toISOString(), totalCourses: Object.keys(out).length },
    prereqs: out,
  }, null, 2))
  console.log('Saved.')
}

main().catch((e) => { console.error('Failed:', e); process.exit(1) })
