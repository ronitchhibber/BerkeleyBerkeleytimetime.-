/**
 * Refresh "current enrollment" snapshot for the shipping courses.json.
 *
 * Reads + writes directly to public/data/courses.json so the live site
 * picks up the new data on next page load. Intended to run daily via
 * the launchd plist at data-pipeline/launchd/*.plist.
 */
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { gqlQuery } from './lib/graphql-client.js'
import { DEFAULT_YEAR, DEFAULT_SEMESTER } from './config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const ENROLLMENT_QUERY = `
  query ClassEnrollment($year: Int!, $semester: Semester!, $sessionId: SessionIdentifier!, $subject: String!, $courseNumber: CourseNumber!, $number: ClassNumber!) {
    class(year: $year, semester: $semester, sessionId: $sessionId, subject: $subject, courseNumber: $courseNumber, number: $number) {
      primarySection {
        enrollment { latest { enrolledCount maxEnroll waitlistedCount } }
      }
    }
  }
`

interface Course {
  code: string
  classNumber: number
  enrolledCount: number
  enrollmentCapacity: number
  waitlistCount: number
  enrollmentPercent: number
}

async function main() {
  // Read+write directly to the shipped summary so the live site updates.
  // (Enrollment fields live on the summary, not in the per-course detail files.)
  const inputPath = join(__dirname, '..', '..', 'public', 'data', 'courses-summary.json')
  const data = JSON.parse(readFileSync(inputPath, 'utf-8'))

  const year = DEFAULT_YEAR
  const semester = DEFAULT_SEMESTER
  const sessionId = '1'

  console.log(`\nRefreshing enrollment for ${data.courses.length} courses...`)
  console.log(`Term: ${semester} ${year}`)
  let updated = 0
  let errors = 0

  for (let i = 0; i < data.courses.length; i++) {
    const course = data.courses[i] as Course
    const [subject, courseNumber] = course.code.split(' ')
    const classNum = String(course.classNumber).padStart(3, '0')

    try {
      const res = await gqlQuery<{ class: { primarySection: { enrollment: { latest: { enrolledCount: number; maxEnroll: number; waitlistedCount: number } | null } | null } | null } | null }>(
        ENROLLMENT_QUERY,
        { year, semester, sessionId, subject, courseNumber, number: classNum }
      )
      const latest = res.class?.primarySection?.enrollment?.latest
      if (latest) {
        course.enrolledCount = latest.enrolledCount
        course.enrollmentCapacity = latest.maxEnroll
        course.waitlistCount = latest.waitlistedCount
        course.enrollmentPercent = latest.maxEnroll > 0
          ? Math.round((latest.enrolledCount / latest.maxEnroll) * 1000) / 10
          : 0
        updated++
      }
    } catch {
      errors++
    }

    if ((i + 1) % 200 === 0) console.log(`  ${i + 1}/${data.courses.length} (${updated} updated, ${errors} errors)`)
  }

  data.meta.lastEnrollmentRefresh = new Date().toISOString()
  writeFileSync(inputPath, JSON.stringify(data, null, 2))

  console.log(`\nUpdated enrollment for ${updated} courses (${errors} errors)`)
  console.log(`Wrote: ${inputPath}`)
}

main().catch((e) => { console.error('Refresh failed:', e); process.exit(1) })
