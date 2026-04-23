import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { gqlQuery } from './lib/graphql-client.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Single efficient query: get all historical classes for a course with grades + instructors
const COURSE_HISTORY_QUERY = `
  query CourseHistory($subject: String!, $number: CourseNumber!) {
    course(subject: $subject, number: $number) {
      courseId
      classes {
        year semester number sessionId
        primarySection {
          meetings { instructors { familyName givenName } }
        }
        gradeDistribution { average distribution { letter count } }
      }
    }
  }
`

// Historical enrollment query (for past Fall semesters of the SAME section number)
const ENROLLMENT_QUERY = `
  query EnrollmentHistory($year: Int!, $semester: Semester!, $sessionId: SessionIdentifier!, $subject: String!, $courseNumber: CourseNumber!, $sectionNumber: SectionNumber!) {
    enrollment(year: $year, semester: $semester, sessionId: $sessionId, subject: $subject, courseNumber: $courseNumber, sectionNumber: $sectionNumber) {
      history { startTime enrolledCount maxEnroll waitlistedCount }
    }
  }
`

interface ClassInstance {
  year: number
  semester: string
  number: string
  sessionId: string
  primarySection: {
    meetings: { instructors: { familyName: string; givenName: string }[] }[]
  } | null
  gradeDistribution: {
    average: number
    distribution: { letter: string; count: number }[]
  } | null
}

interface EnrollmentHistoryPoint {
  startTime: string
  enrolledCount: number
  maxEnroll: number
  waitlistedCount: number
}

interface Course {
  code: string
  classNumber: number
  enrollmentHistoryBySemester?: Record<string, { day: number; date: string; enrolledCount: number; enrollmentPercent: number; waitlistCount: number }[]>
  gradeHistory: {
    semester: string
    instructor: string
    totalEnrolled: number
    distribution: Record<string, number>
    averageGPA: number
  }[]
}

function buildGradeRecord(label: string, instructor: string, dist: NonNullable<ClassInstance['gradeDistribution']>) {
  const find = (l: string) => dist.distribution.find((d) => d.letter === l)?.count || 0
  const totalEnrolled = dist.distribution.reduce((s, d) => s + d.count, 0)
  return {
    semester: label,
    instructor,
    totalEnrolled,
    distribution: {
      aPlus: find('A+'), a: find('A'), aMinus: find('A-'),
      bPlus: find('B+'), b: find('B'), bMinus: find('B-'),
      cPlus: find('C+'), c: find('C'), cMinus: find('C-'),
      dPlus: find('D+'), d: find('D'), dMinus: find('D-'),
      f: find('F'), p: find('P'), np: find('NP'),
    },
    averageGPA: dist.average || 0,
  }
}

const SEMESTER_ORDER: Record<string, number> = { Spring: 1, Summer: 2, Fall: 3 }
function semesterSortKey(s: string): number {
  const [sem, yr] = s.split(' ')
  return -(parseInt(yr) * 10 + (SEMESTER_ORDER[sem] || 0))
}

async function main() {
  const args = process.argv.slice(2)
  const skipGrades = args.includes('--no-grades')
  const skipEnrollment = args.includes('--no-enrollment')
  const limitArg = args.indexOf('--limit')
  const limit = limitArg !== -1 ? parseInt(args[limitArg + 1]) : 0

  const inputPath = join(__dirname, '..', 'output', 'courses.json')
  const data = JSON.parse(readFileSync(inputPath, 'utf-8'))

  // Group courses by (subject, courseNumber)
  const uniqueCourses = new Map<string, { subject: string; courseNumber: string; courses: Course[] }>()
  for (const c of data.courses as Course[]) {
    const [subject, courseNumber] = c.code.split(' ')
    const key = `${subject}-${courseNumber}`
    if (!uniqueCourses.has(key)) {
      uniqueCourses.set(key, { subject, courseNumber, courses: [] })
    }
    uniqueCourses.get(key)!.courses.push(c)
  }

  const uniqueList = [...uniqueCourses.entries()]
  const target = limit > 0 ? uniqueList.slice(0, limit) : uniqueList
  console.log(`\nProcessing ${target.length} unique courses (${data.courses.length} sections)`)

  // === STEP 1: Per-semester per-instructor grades via course history ===
  if (!skipGrades) {
    console.log(`\n[GRADES] Single course query gives all historical classes + instructors + grades`)
    let done = 0, recordsTotal = 0, coursesWithRecords = 0
    for (const [, info] of target) {
      try {
        const res = await gqlQuery<{ course: { courseId: string; classes: ClassInstance[] } | null }>(
          COURSE_HISTORY_QUERY, { subject: info.subject, number: info.courseNumber }
        )
        if (!res.course) { done++; continue }

        // Build per-semester per-instructor grade records
        const records: ReturnType<typeof buildGradeRecord>[] = []
        for (const cls of res.course.classes) {
          if (!cls.gradeDistribution || !cls.gradeDistribution.distribution.length) continue
          const total = cls.gradeDistribution.distribution.reduce((s, d) => s + d.count, 0)
          if (total === 0) continue

          const label = `${cls.semester} ${cls.year}`
          const inst = cls.primarySection?.meetings?.[0]?.instructors?.[0]
          const instructor = inst ? `${inst.givenName} ${inst.familyName}`.trim() : 'Staff'
          records.push(buildGradeRecord(label, instructor, cls.gradeDistribution))
        }

        // Sort newest first
        records.sort((a, b) => {
          const aKey = semesterSortKey(a.semester)
          const bKey = semesterSortKey(b.semester)
          if (aKey !== bKey) return aKey - bKey
          return a.instructor.localeCompare(b.instructor)
        })

        if (records.length > 0) {
          for (const c of info.courses) c.gradeHistory = records
          recordsTotal += records.length
          coursesWithRecords++
        }
      } catch {}
      done++
      if (done % 100 === 0) {
        console.log(`  ${done}/${target.length} courses · ${coursesWithRecords} with grade history · ${recordsTotal} total records`)
        writeFileSync(inputPath, JSON.stringify(data, null, 2))
      }
    }
    console.log(`  Done · ${coursesWithRecords} courses with grade history · ${recordsTotal} per-(semester,instructor) records`)
  }

  // === STEP 2: Past Fall enrollment for each course ===
  if (!skipEnrollment) {
    const FALL_TERMS = [
      { year: 2025, semester: 'Fall' },
      { year: 2024, semester: 'Fall' },
      { year: 2023, semester: 'Fall' },
    ]
    const targetCourses = limit > 0 ? data.courses.slice(0, limit * 2) : data.courses
    console.log(`\n[ENROLLMENT] Past Fall enrollment for ${targetCourses.length} sections × ${FALL_TERMS.length} terms`)
    let done = 0, found = 0

    for (const c of targetCourses as Course[]) {
      const [subject, courseNumber] = c.code.split(' ')
      const sectionNumber = String(c.classNumber).padStart(3, '0')
      const histBySem: Record<string, { day: number; date: string; enrolledCount: number; enrollmentPercent: number; waitlistCount: number }[]> = {}

      for (const term of FALL_TERMS) {
        try {
          const res = await gqlQuery<{ enrollment: { history: EnrollmentHistoryPoint[] | null } | null }>(ENROLLMENT_QUERY, {
            year: term.year, semester: term.semester, sessionId: '1', subject, courseNumber, sectionNumber,
          })
          const hist = res.enrollment?.history || []
          if (hist.length > 0) {
            const firstDate = new Date(hist[0].startTime)
            histBySem[`${term.semester} ${term.year}`] = hist.map((h) => {
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
            found++
          }
        } catch {}
      }
      if (Object.keys(histBySem).length > 0) c.enrollmentHistoryBySemester = histBySem
      done++
      if (done % 200 === 0) {
        console.log(`  ${done}/${targetCourses.length} sections · ${found} historical histories`)
        writeFileSync(inputPath, JSON.stringify(data, null, 2))
      }
    }
    console.log(`  Done · ${found} historical enrollment histories`)
  }

  data.meta.lastMultiSemesterFetch = new Date().toISOString()
  writeFileSync(inputPath, JSON.stringify(data, null, 2))
  console.log(`\nWrote ${data.courses.length} courses to output/courses.json`)
}

main().catch((e) => { console.error('Failed:', e); process.exit(1) })
