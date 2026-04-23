/**
 * Split the monolithic public/data/courses.json into:
 *   public/data/courses-summary.json     — every course MINUS gradeHistory,
 *                                          enrollmentHistory, enrollmentHistoryBySemester
 *   public/data/courses-detail/<id>.json — those three arrays per-course
 *
 * The frontend loads summary at boot (~3 MB gzipped) and lazy-fetches detail
 * only when a user opens a course's Grades or Enrollment tab.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..', 'public', 'data')
const SRC = join(ROOT, 'courses.json')
const SUMMARY = join(ROOT, 'courses-summary.json')
const DETAIL_DIR = join(ROOT, 'courses-detail')

interface Course {
  id: string
  gradeHistory?: unknown[]
  enrollmentHistory?: unknown[]
  enrollmentHistoryBySemester?: Record<string, unknown[]>
  [k: string]: unknown
}

function main() {
  if (!existsSync(SRC)) {
    console.error(`Missing ${SRC} — nothing to split.`)
    process.exit(1)
  }
  const data = JSON.parse(readFileSync(SRC, 'utf-8')) as { courses: Course[]; meta?: unknown }

  if (existsSync(DETAIL_DIR)) rmSync(DETAIL_DIR, { recursive: true })
  mkdirSync(DETAIL_DIR, { recursive: true })

  const summaryCourses: Course[] = []
  let detailCount = 0
  let totalDetailBytes = 0

  for (const c of data.courses) {
    const { gradeHistory = [], enrollmentHistory = [], enrollmentHistoryBySemester, ...rest } = c
    const detail = { gradeHistory, enrollmentHistory, enrollmentHistoryBySemester: enrollmentHistoryBySemester ?? {} }
    const detailJson = JSON.stringify(detail)
    writeFileSync(join(DETAIL_DIR, `${c.id}.json`), detailJson)
    totalDetailBytes += detailJson.length
    detailCount++
    summaryCourses.push({
      ...rest,
      // keep the field names so consumers can mutate them in-place after lazy fetch
      gradeHistory: [],
      enrollmentHistory: [],
      enrollmentHistoryBySemester: {},
    } as Course)
  }

  writeFileSync(SUMMARY, JSON.stringify({ ...data, courses: summaryCourses }, null, 2))

  const summaryBytes = JSON.parse(JSON.stringify({ ...data, courses: summaryCourses }))
  const summaryJson = JSON.stringify(summaryBytes, null, 2)
  console.log(`Summary:  ${(summaryJson.length / 1024 / 1024).toFixed(2)} MB`)
  console.log(`Details:  ${detailCount} files, ${(totalDetailBytes / 1024 / 1024).toFixed(2)} MB total, ~${Math.round(totalDetailBytes / detailCount)} bytes each`)
}

main()
