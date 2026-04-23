import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { DEFAULT_YEAR, DEFAULT_SEMESTER, PAGE_SIZE } from './config.js'
import { gqlQuery } from './lib/graphql-client.js'
import { generateEnrollmentHistory } from './pullers/enrollment.js'
import type { OutputCourse, OutputSection, OutputGradeRecord } from './types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const CATALOG_QUERY = `
  query CatalogSearch($year: Int!, $semester: Semester!, $page: Int!, $pageSize: Int!) {
    catalogSearch(year: $year, semester: $semester, page: $page, pageSize: $pageSize) {
      totalCount
      results {
        year semester subject courseNumber number courseId sessionId
        courseTitle courseDescription
        gradingBasis finalExam unitsMin unitsMax
        academicCareer academicOrganization academicOrganizationName
      }
    }
  }
`

const CLASS_QUERY = `
  query ClassDetail($year: Int!, $semester: Semester!, $sessionId: SessionIdentifier!, $subject: String!, $courseNumber: CourseNumber!, $number: ClassNumber!) {
    class(year: $year, semester: $semester, sessionId: $sessionId, subject: $subject, courseNumber: $courseNumber, number: $number) {
      subject courseNumber title
      primarySection {
        number component online attendanceRequired lecturesRecorded
        meetings { days startTime endTime location instructors { familyName givenName } }
        enrollment { latest { enrolledCount maxEnroll waitlistedCount status } }
      }
      sections {
        number component online
        meetings { days startTime endTime location instructors { familyName givenName } }
        enrollment { latest { enrolledCount maxEnroll waitlistedCount status } }
      }
    }
  }
`

const GRADE_QUERY = `
  query Grade($subject: String!, $courseId: String!) {
    grade(subject: $subject, courseId: $courseId) {
      average pnpPercentage
      distribution { letter percentage count }
    }
  }
`

interface CatalogEntry {
  subject: string; courseNumber: string; number: string; courseId: string
  sessionId: string
  courseTitle: string; courseDescription: string
  gradingBasis: string; finalExam: string; unitsMin: number; unitsMax: number
  academicCareer: string; academicOrganization: string; academicOrganizationName: string
}

interface ClassMeeting {
  days: boolean[]; startTime: string; endTime: string; location: string
  instructors: { familyName: string; givenName: string }[]
}

interface ClassSection {
  number: string; component: string; online: boolean
  attendanceRequired?: boolean; lecturesRecorded?: boolean
  meetings: ClassMeeting[]
  enrollment?: { latest?: { enrolledCount: number; maxEnroll: number; waitlistedCount: number; status: string } }
}

interface ClassDetail {
  subject: string; courseNumber: string; title: string | null
  primarySection: ClassSection | null
  sections: ClassSection[]
}

interface GradeDistribution {
  average: number; pnpPercentage: number
  distribution: { letter: string; percentage: number; count: number }[]
}

function parseDays(boolArray: boolean[]): string[] {
  const labels = ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su']
  return boolArray.map((v, i) => v ? labels[i] : '').filter(Boolean)
}

function formatTime(t: string): string { return t.substring(0, 5) }

function getLevel(cn: string, career: string): 'lower' | 'upper' | 'graduate' {
  if (career === 'GRAD') return 'graduate'
  const n = parseInt(cn.replace(/\D/g, ''))
  return isNaN(n) ? 'lower' : n < 100 ? 'lower' : n < 200 ? 'upper' : 'graduate'
}

function getGradingOption(code: string): 'letter' | 'pnp' | 'satisfactory' {
  if (code === 'PNP') return 'pnp'
  if (code === 'SUS') return 'satisfactory'
  return 'letter'
}

function gpaToLetterGrade(gpa: number): string {
  if (gpa >= 3.85) return 'A'
  if (gpa >= 3.5) return 'A-'
  if (gpa >= 3.15) return 'B+'
  if (gpa >= 2.85) return 'B'
  if (gpa >= 2.5) return 'B-'
  if (gpa >= 2.15) return 'C+'
  if (gpa >= 1.85) return 'C'
  if (gpa >= 1.5) return 'C-'
  if (gpa >= 1.15) return 'D+'
  if (gpa >= 0.85) return 'D'
  if (gpa >= 0.5) return 'D-'
  return 'F'
}

function instructorName(inst: { givenName: string; familyName: string } | undefined): string {
  if (!inst) return 'Staff'
  return `${inst.givenName} ${inst.familyName}`.trim() || 'Staff'
}

function buildCourse(entry: CatalogEntry, detail: ClassDetail | null, gradeData: GradeDistribution | null): OutputCourse {
  const ps = detail?.primarySection
  const pm = ps?.meetings?.[0]
  const enr = ps?.enrollment?.latest

  const enrolledCount = enr?.enrolledCount || 0
  const enrollmentCapacity = enr?.maxEnroll || 0
  const waitlistCount = enr?.waitlistedCount || 0
  const enrollmentPercent = enrollmentCapacity > 0 ? Math.round((enrolledCount / enrollmentCapacity) * 1000) / 10 : 0

  const nonLecSections: OutputSection[] = (detail?.sections || [])
    .filter((s) => s.component !== 'LEC' && s.component !== 'SEM')
    .map((s) => {
      const m = s.meetings?.[0]
      const statusMap: Record<string, 'open' | 'closed' | 'waitlist'> = { O: 'open', C: 'closed', W: 'waitlist' }
      return {
        sectionNumber: `${s.component} ${s.number}`,
        type: (s.component === 'LAB' ? 'lab' : 'discussion') as 'discussion' | 'lab',
        days: m ? parseDays(m.days) : [],
        startTime: m ? formatTime(m.startTime) : '00:00',
        endTime: m ? formatTime(m.endTime) : '00:00',
        location: m?.location || 'TBA',
        instructor: instructorName(m?.instructors?.[0]),
        enrolledCount: s.enrollment?.latest?.enrolledCount || 0,
        capacity: s.enrollment?.latest?.maxEnroll || 0,
        waitlistCount: s.enrollment?.latest?.waitlistedCount || 0,
        status: statusMap[s.enrollment?.latest?.status || ''] || 'closed',
      }
    })

  const gradeHistory: OutputGradeRecord[] = gradeData ? [{
    semester: 'All Semesters',
    instructor: 'All Instructors',
    totalEnrolled: gradeData.distribution.reduce((s, d) => s + d.count, 0),
    distribution: {
      aPlus: gradeData.distribution.find(d => d.letter === 'A+')?.count || 0,
      a: gradeData.distribution.find(d => d.letter === 'A')?.count || 0,
      aMinus: gradeData.distribution.find(d => d.letter === 'A-')?.count || 0,
      bPlus: gradeData.distribution.find(d => d.letter === 'B+')?.count || 0,
      b: gradeData.distribution.find(d => d.letter === 'B')?.count || 0,
      bMinus: gradeData.distribution.find(d => d.letter === 'B-')?.count || 0,
      cPlus: gradeData.distribution.find(d => d.letter === 'C+')?.count || 0,
      c: gradeData.distribution.find(d => d.letter === 'C')?.count || 0,
      cMinus: gradeData.distribution.find(d => d.letter === 'C-')?.count || 0,
      dPlus: gradeData.distribution.find(d => d.letter === 'D+')?.count || 0,
      d: gradeData.distribution.find(d => d.letter === 'D')?.count || 0,
      dMinus: gradeData.distribution.find(d => d.letter === 'D-')?.count || 0,
      f: gradeData.distribution.find(d => d.letter === 'F')?.count || 0,
      p: gradeData.distribution.find(d => d.letter === 'P')?.count || 0,
      np: gradeData.distribution.find(d => d.letter === 'NP')?.count || 0,
    },
    averageGPA: gradeData.average,
  }] : []

  const averageGPA = gradeData?.average || 0
  const code = `${entry.subject} ${entry.courseNumber}`
  const id = code.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  return {
    id, code,
    sectionNumber: `#${entry.number.padStart(2, '0')}`,
    title: entry.courseTitle || detail?.title || code,
    department: entry.academicOrganizationName || entry.subject,
    units: entry.unitsMax || entry.unitsMin || 0,
    classNumber: parseInt(entry.number) || 0,
    level: getLevel(entry.courseNumber, entry.academicCareer),
    days: pm ? parseDays(pm.days) : [],
    startTime: pm ? formatTime(pm.startTime) : '00:00',
    endTime: pm ? formatTime(pm.endTime) : '00:00',
    location: pm?.location || 'TBA',
    instructor: instructorName(pm?.instructors?.[0]),
    prerequisites: '',
    description: entry.courseDescription || '',
    finalExam: entry.finalExam === 'Y' ? 'Written final exam during scheduled final exam period' : 'No final exam',
    enrolledCount, enrollmentCapacity, waitlistCount, enrollmentPercent,
    averageGPA: Math.round(averageGPA * 1000) / 1000,
    averageGrade: averageGPA > 0 ? gpaToLetterGrade(averageGPA) : 'N/A',
    gradingOption: getGradingOption(entry.gradingBasis),
    requirements: { lsBreadth: [], universityReqs: [] },
    hasReservedSeating: false,
    starsCount: 0,
    attendanceRequired: ps?.attendanceRequired || false,
    lecturesRecorded: ps?.lecturesRecorded || false,
    sections: nonLecSections,
    gradeHistory,
    enrollmentHistory: generateEnrollmentHistory(enrolledCount, enrollmentCapacity),
  }
}

async function fetchCatalog(year: number, semester: string): Promise<CatalogEntry[]> {
  const all: CatalogEntry[] = []
  let page = 0
  let total = Infinity
  while (all.length < total) {
    console.log(`  Page ${page + 1} (${all.length}/${total === Infinity ? '?' : total})...`)
    const data = await gqlQuery<{ catalogSearch: { totalCount: number; results: CatalogEntry[] } }>(
      CATALOG_QUERY, { year, semester, page, pageSize: PAGE_SIZE })
    total = data.catalogSearch.totalCount
    if (data.catalogSearch.results.length === 0) break
    all.push(...data.catalogSearch.results)
    page++
  }
  return all
}

async function fetchClassDetails(year: number, semester: string, _defaultSessionId: string, entries: CatalogEntry[]): Promise<Map<string, ClassDetail>> {
  const map = new Map<string, ClassDetail>()
  let done = 0
  let errors = 0
  for (const e of entries) {
    try {
      // Use the per-class sessionId from catalogSearch (Summer has many: 6W1, 8W, etc.).
      // Fall back to the global default if missing.
      const sessionId = e.sessionId || _defaultSessionId
      const data = await gqlQuery<{ class: ClassDetail | null }>(CLASS_QUERY, {
        year, semester, sessionId, subject: e.subject, courseNumber: e.courseNumber, number: e.number,
      })
      if (data.class) map.set(`${e.subject}-${e.courseNumber}-${e.number}`, data.class)
    } catch { errors++ }
    done++
    if (done % 200 === 0) console.log(`    ${done}/${entries.length} classes fetched...`)
  }
  console.log(`  Fetched details for ${map.size} classes (${errors} errors)`)
  return map
}

async function fetchGrades(entries: CatalogEntry[]): Promise<Map<string, GradeDistribution>> {
  const map = new Map<string, GradeDistribution>()
  const unique = new Map<string, { subject: string; courseId: string }>()
  for (const e of entries) {
    const key = `${e.subject}-${e.courseId}`
    if (!unique.has(key)) unique.set(key, { subject: e.subject, courseId: e.courseId })
  }
  console.log(`  Fetching grades for ${unique.size} unique courses...`)
  let done = 0, errors = 0
  for (const [key, { subject, courseId }] of unique) {
    try {
      const data = await gqlQuery<{ grade: GradeDistribution | null }>(GRADE_QUERY, { subject, courseId })
      if (data.grade?.distribution?.length) map.set(key, data.grade)
    } catch { errors++ }
    done++
    if (done % 200 === 0) console.log(`    ${done}/${unique.size} grades fetched...`)
  }
  console.log(`  Fetched grades for ${map.size} courses (${errors} errors)`)
  return map
}

async function main() {
  const args = process.argv.slice(2)
  const noGrades = args.includes('--no-grades')
  const noDetails = args.includes('--no-details')
  const limitArg = args.indexOf('--limit')
  const limit = limitArg !== -1 ? parseInt(args[limitArg + 1]) : 0
  const semArg = args.indexOf('--semester')
  const yearArg = args.indexOf('--year')
  const outArg = args.indexOf('--out')

  const year = yearArg !== -1 ? parseInt(args[yearArg + 1]) : DEFAULT_YEAR
  const semester = semArg !== -1 ? args[semArg + 1] : DEFAULT_SEMESTER
  const sessionId = '1'

  console.log(`\nBerkeleytime Data Pipeline v2`)
  console.log(`Source: berkeleytime.com/api/graphql`)
  console.log(`Term: ${semester} ${year} (session ${sessionId})`)
  console.log('---')

  console.log('\n[1/4] Fetching catalog...')
  let entries = await fetchCatalog(year, semester)
  console.log(`  Total: ${entries.length} classes`)
  if (limit > 0) { entries = entries.slice(0, limit); console.log(`  Limited to ${limit}`) }

  let detailMap = new Map<string, ClassDetail>()
  if (!noDetails) {
    console.log('\n[2/4] Fetching class details (schedule, instructor, location)...')
    detailMap = await fetchClassDetails(year, semester, sessionId, entries)
  } else { console.log('\n[2/4] Skipping details (--no-details)') }

  let gradeMap = new Map<string, GradeDistribution>()
  if (!noGrades) {
    console.log('\n[3/4] Fetching grade distributions...')
    gradeMap = await fetchGrades(entries)
  } else { console.log('\n[3/4] Skipping grades (--no-grades)') }

  console.log('\n[4/4] Transforming data...')
  const courses = entries.map((e) => {
    const detail = detailMap.get(`${e.subject}-${e.courseNumber}-${e.number}`) || null
    const grade = gradeMap.get(`${e.subject}-${e.courseId}`) || null
    return buildCourse(e, detail, grade)
  })

  const withSchedule = courses.filter(c => c.days.length > 0 && c.startTime !== '00:00').length
  const withInstructor = courses.filter(c => c.instructor !== 'Staff').length
  const withGrades = courses.filter(c => c.averageGPA > 0).length
  console.log(`  ${withSchedule} with schedule, ${withInstructor} with instructor, ${withGrades} with grades`)

  const output = {
    meta: { generatedAt: new Date().toISOString(), termId: `${year}-${semester}`, termName: `${semester} ${year}`, totalCourses: courses.length },
    courses,
  }

  const fileTag = `${semester.toLowerCase()}-${year}`
  const outFilename = outArg !== -1 ? args[outArg + 1] : `courses-${fileTag}.json`
  const outputPath = join(__dirname, '..', 'output', outFilename)
  writeFileSync(outputPath, JSON.stringify(output, null, 2))
  console.log(`\nWrote ${courses.length} courses to output/${outFilename}`)
}

main().catch((e) => { console.error('Pipeline failed:', e); process.exit(1) })
