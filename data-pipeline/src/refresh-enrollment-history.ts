import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { gqlQuery } from './lib/graphql-client.js'
import { DEFAULT_YEAR, DEFAULT_SEMESTER } from './config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const ENROLLMENT_HISTORY_QUERY = `
  query EnrollmentHistory($year: Int!, $semester: Semester!, $sessionId: SessionIdentifier!, $subject: String!, $courseNumber: CourseNumber!, $sectionNumber: SectionNumber!) {
    enrollment(year: $year, semester: $semester, sessionId: $sessionId, subject: $subject, courseNumber: $courseNumber, sectionNumber: $sectionNumber) {
      history { startTime enrolledCount maxEnroll waitlistedCount }
      latest { enrolledCount maxEnroll waitlistedCount }
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
  enrollmentHistory: { day: number; enrollmentPercent: number; enrolledCount: number; date?: string; waitlistCount?: number }[]
}

interface HistoryPoint {
  startTime: string
  enrolledCount: number
  maxEnroll: number
  waitlistedCount: number
}

async function main() {
  const args = process.argv.slice(2)
  const yi = args.indexOf('--year'); const si = args.indexOf('--semester'); const fi = args.indexOf('--file')
  const year = yi !== -1 ? parseInt(args[yi + 1]) : DEFAULT_YEAR
  const semester = si !== -1 ? args[si + 1] : DEFAULT_SEMESTER
  const fileTag = `${semester.toLowerCase()}-${year}`
  const inputName = fi !== -1 ? args[fi + 1] : `courses-${fileTag}.json`
  const inputPath = join(__dirname, '..', 'output', inputName)
  const data = JSON.parse(readFileSync(inputPath, 'utf-8'))

  console.log(`\nFetching real enrollment history for ${data.courses.length} courses...`)
  let updated = 0
  let errors = 0
  let withHistory = 0

  for (let i = 0; i < data.courses.length; i++) {
    const course = data.courses[i] as Course
    const [subject, courseNumber] = course.code.split(' ')
    const sectionNum = String(course.classNumber).padStart(3, '0')

    try {
      const res = await gqlQuery<{ enrollment: { history: HistoryPoint[] | null; latest: { enrolledCount: number; maxEnroll: number; waitlistedCount: number } | null } | null }>(
        ENROLLMENT_HISTORY_QUERY,
        { year, semester, sessionId, subject, courseNumber, sectionNumber: sectionNum }
      )

      const history = res.enrollment?.history || []
      const latest = res.enrollment?.latest

      if (latest) {
        course.enrolledCount = latest.enrolledCount
        course.enrollmentCapacity = latest.maxEnroll
        course.waitlistCount = latest.waitlistedCount
        course.enrollmentPercent = latest.maxEnroll > 0
          ? Math.round((latest.enrolledCount / latest.maxEnroll) * 1000) / 10
          : 0
      }

      if (history.length > 0) {
        const firstDate = new Date(history[0].startTime)
        course.enrollmentHistory = history.map((h) => {
          const d = new Date(h.startTime)
          const day = Math.floor((d.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
          return {
            day,
            date: h.startTime.substring(0, 10),
            enrolledCount: h.enrolledCount,
            enrollmentPercent: h.maxEnroll > 0 ? Math.round((h.enrolledCount / h.maxEnroll) * 1000) / 10 : 0,
            waitlistCount: h.waitlistedCount,
          }
        })
        withHistory++
      } else {
        course.enrollmentHistory = []
      }
      updated++
    } catch {
      errors++
    }

    if ((i + 1) % 200 === 0) console.log(`  ${i + 1}/${data.courses.length} (${updated} updated, ${withHistory} with history, ${errors} errors)`)
  }

  data.meta.lastEnrollmentRefresh = new Date().toISOString()
  writeFileSync(inputPath, JSON.stringify(data, null, 2))

  console.log(`\nDone: ${updated} updated, ${withHistory} with real history, ${errors} errors`)
}

main().catch((e) => { console.error('Failed:', e); process.exit(1) })
