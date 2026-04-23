import { RATE_LIMIT_MS } from '../config.js'

const RMP_GRAPHQL = 'https://www.ratemyprofessors.com/graphql'
const BERKELEY_SCHOOL_ID = 'U2Nob29sLTEwNzI='

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface RMPTeacher {
  id: string
  firstName: string
  lastName: string
  avgRating: number
  avgDifficulty: number
  numRatings: number
  wouldTakeAgainPercent: number
  department: string
}

export interface RMPResult {
  avgRating: number
  avgDifficulty: number
  numRatings: number
  wouldTakeAgainPercent: number
  department: string
  rmpId: string
}

const SEARCH_QUERY = `
  query SearchTeacher($text: String!, $schoolID: ID!) {
    newSearch {
      teachers(query: { text: $text, schoolID: $schoolID }) {
        edges {
          node {
            id firstName lastName avgRating avgDifficulty numRatings wouldTakeAgainPercent department
          }
        }
      }
    }
  }
`

async function searchRMP(name: string): Promise<RMPTeacher[]> {
  const res = await fetch(RMP_GRAPHQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic dGVzdDp0ZXN0',
    },
    body: JSON.stringify({
      query: SEARCH_QUERY,
      variables: { text: name, schoolID: BERKELEY_SCHOOL_ID },
    }),
  })

  if (!res.ok) return []
  const json = await res.json() as { data?: { newSearch?: { teachers?: { edges?: { node: RMPTeacher }[] } } } }
  return json.data?.newSearch?.teachers?.edges?.map((e) => e.node) || []
}

function bestMatch(results: RMPTeacher[], firstName: string, lastName: string): RMPTeacher | null {
  const target = `${firstName} ${lastName}`.toLowerCase()
  for (const r of results) {
    const full = `${r.firstName} ${r.lastName}`.toLowerCase()
    if (full === target && r.numRatings > 0) return r
  }
  for (const r of results) {
    if (r.lastName.toLowerCase() === lastName.toLowerCase() && r.numRatings > 0) return r
  }
  return null
}

export async function fetchRMPRatings(instructors: string[]): Promise<Map<string, RMPResult>> {
  const map = new Map<string, RMPResult>()
  const unique = [...new Set(instructors.filter((i) => i && i !== 'Staff'))]

  console.log(`  Fetching RMP ratings for ${unique.length} unique instructors...`)
  let done = 0
  let found = 0

  for (const name of unique) {
    await sleep(RATE_LIMIT_MS)
    try {
      const parts = name.split(' ')
      const firstName = parts[0] || ''
      const lastName = parts.slice(1).join(' ') || ''

      const results = await searchRMP(`${firstName} ${lastName}`)
      const match = bestMatch(results, firstName, lastName)

      if (match) {
        map.set(name, {
          avgRating: match.avgRating,
          avgDifficulty: match.avgDifficulty,
          numRatings: match.numRatings,
          wouldTakeAgainPercent: match.wouldTakeAgainPercent,
          department: match.department,
          rmpId: match.id,
        })
        found++
      }
    } catch {}
    done++
    if (done % 100 === 0) console.log(`    ${done}/${unique.length} instructors checked (${found} found)...`)
  }

  console.log(`  Found RMP data for ${map.size}/${unique.length} instructors`)
  return map
}
