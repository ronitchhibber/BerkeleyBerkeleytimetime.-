import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { gqlQuery } from './lib/graphql-client.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface Course {
  code: string
  title: string
  units: number
  department: string
  description: string
  level: 'lower' | 'upper' | 'graduate'
  semestersOffered: string[]
}

const COURSE_CLASSES_QUERY = `
  query CourseClasses($subject: String!, $number: CourseNumber!) {
    course(subject: $subject, number: $number) {
      classes { year semester }
    }
  }
`

async function enrichCourse(subject: string, number: string): Promise<string[]> {
  try {
    const data = await gqlQuery<{ course: { classes: { year: number; semester: string }[] } | null }>(
      COURSE_CLASSES_QUERY,
      { subject, number }
    )
    if (!data.course) return []
    const terms = new Set<string>()
    for (const c of data.course.classes) {
      terms.add(`${c.semester} ${c.year}`)
    }
    return [...terms].sort((a, b) => {
      const [sa, ya] = a.split(' ')
      const [sb, yb] = b.split(' ')
      if (ya !== yb) return parseInt(yb) - parseInt(ya)
      const order: Record<string, number> = { Spring: 0, Summer: 1, Fall: 2 }
      return (order[sb] ?? 0) - (order[sa] ?? 0)
    })
  } catch (e) {
    console.warn(`  ${subject} ${number}: ${(e as Error).message}`)
    return []
  }
}

async function main() {
  const coursesPath = join(__dirname, '..', '..', 'public', 'data', 'all-courses.json')
  const data = JSON.parse(readFileSync(coursesPath, 'utf-8'))
  const courses: Course[] = data.courses

  // Courses with fewer than 2 known terms are candidates for enrichment
  const targets = courses.filter((c) => c.semestersOffered.length <= 1)
  console.log(`Enriching ${targets.length}/${courses.length} courses with sparse term data...`)

  let enriched = 0
  let errors = 0
  for (let i = 0; i < targets.length; i++) {
    const course = targets[i]
    const parts = course.code.split(' ')
    const subject = parts[0]
    const number = parts.slice(1).join(' ')
    if (!subject || !number) continue

    const terms = await enrichCourse(subject, number)
    if (terms.length > 0) {
      course.semestersOffered = terms
      enriched++
    } else {
      errors++
    }

    if ((i + 1) % 100 === 0) {
      console.log(`  Progress: ${i + 1}/${targets.length} (enriched ${enriched}, errors ${errors})`)
      // Save incrementally every 100
      writeFileSync(coursesPath, JSON.stringify({ ...data, meta: { ...data.meta, enrichedAt: new Date().toISOString() }, courses }, null, 2))
    }
  }

  writeFileSync(coursesPath, JSON.stringify({ ...data, meta: { ...data.meta, enrichedAt: new Date().toISOString() }, courses }, null, 2))
  console.log(`\nDone. Enriched ${enriched}, errors ${errors}`)
}

main().catch((e) => {
  console.error('Failed:', e)
  process.exit(1)
})
