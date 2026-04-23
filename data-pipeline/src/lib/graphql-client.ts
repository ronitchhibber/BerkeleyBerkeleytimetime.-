import { BT_GRAPHQL_URL, RATE_LIMIT_MS } from '../config.js'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function gqlQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  await sleep(RATE_LIMIT_MS)

  const res = await fetch(BT_GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })

  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.status} ${res.statusText}`)
  }

  const json = await res.json() as { data?: T; errors?: { message: string }[] }

  if (json.errors?.length) {
    throw new Error(`GraphQL errors: ${json.errors.map((e) => e.message).join(', ')}`)
  }

  return json.data as T
}
