import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { fetchRMPRatings } from './pullers/rmp.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main() {
  const inputPath = join(__dirname, '..', 'output', 'courses.json')
  const data = JSON.parse(readFileSync(inputPath, 'utf-8'))

  console.log(`\nAdding RMP ratings to ${data.courses.length} courses...`)

  const instructors = data.courses.map((c: { instructor: string }) => c.instructor)
  const rmpMap = await fetchRMPRatings(instructors)

  let added = 0
  for (const course of data.courses) {
    const rmp = rmpMap.get(course.instructor)
    if (rmp) {
      course.rmpRating = rmp
      added++
    }
  }

  console.log(`\nAdded RMP ratings to ${added} courses`)
  writeFileSync(inputPath, JSON.stringify(data, null, 2))
  console.log(`Updated ${inputPath}`)
  console.log(`Copy to frontend: cp output/courses.json ../public/data/courses.json`)
}

main().catch((e) => { console.error('Failed:', e); process.exit(1) })
