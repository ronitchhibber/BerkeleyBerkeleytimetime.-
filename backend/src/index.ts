/**
 * Berkeleytime sync backend (Cloudflare Workers + Workers KV).
 *
 * Endpoints:
 *   POST /api/user            → { userId } (random UUID, persisted in KV)
 *   POST /api/sync            → body { userId, plans, schedule } → { syncedAt }
 *   GET  /api/sync/:userId    → { plans, schedule, syncedAt } | 404
 *
 * Auth model: userId IS the bearer token (single-user-per-device). Real
 * CalNet OAuth is a future task; this is the foundation.
 *
 * Rate limit: max 60 sync writes per userId per hour.
 */
export interface Env {
  SYNC_KV: KVNamespace
  ALLOWED_ORIGIN: string
}

interface SyncPayload {
  userId: string
  plans: unknown
  schedule: unknown
}

const cors = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
})

function json(body: unknown, init: ResponseInit = {}, env?: Env): Response {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  for (const [k, v] of Object.entries(cors(env?.ALLOWED_ORIGIN ?? '*'))) headers.set(k, v)
  return new Response(JSON.stringify(body), { ...init, headers })
}

async function checkRateLimit(env: Env, userId: string): Promise<boolean> {
  const key = `rate:${userId}:${Math.floor(Date.now() / 3600000)}`
  const count = parseInt((await env.SYNC_KV.get(key)) || '0')
  if (count >= 60) return false
  await env.SYNC_KV.put(key, String(count + 1), { expirationTtl: 3700 })
  return true
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: cors(env.ALLOWED_ORIGIN) })
    }

    const url = new URL(req.url)
    const path = url.pathname

    try {
      if (req.method === 'POST' && path === '/api/user') {
        const userId = crypto.randomUUID()
        await env.SYNC_KV.put(`user:${userId}:meta`, JSON.stringify({ createdAt: new Date().toISOString() }))
        return json({ userId }, { status: 201 }, env)
      }

      if (req.method === 'POST' && path === '/api/sync') {
        const body = (await req.json()) as SyncPayload
        if (!body?.userId || typeof body.userId !== 'string') {
          return json({ error: 'userId required' }, { status: 400 }, env)
        }
        const meta = await env.SYNC_KV.get(`user:${body.userId}:meta`)
        if (!meta) return json({ error: 'unknown userId' }, { status: 404 }, env)
        if (!(await checkRateLimit(env, body.userId))) {
          return json({ error: 'rate limit exceeded (60/hour)' }, { status: 429 }, env)
        }
        const syncedAt = new Date().toISOString()
        await env.SYNC_KV.put(
          `user:${body.userId}:state`,
          JSON.stringify({ plans: body.plans, schedule: body.schedule, syncedAt })
        )
        return json({ syncedAt }, {}, env)
      }

      const syncMatch = path.match(/^\/api\/sync\/([0-9a-f-]{36})$/)
      if (req.method === 'GET' && syncMatch) {
        const stored = await env.SYNC_KV.get(`user:${syncMatch[1]}:state`)
        if (!stored) return json({ error: 'no state' }, { status: 404 }, env)
        return json(JSON.parse(stored), {}, env)
      }

      return json({ error: 'not found' }, { status: 404 }, env)
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : 'internal error' }, { status: 500 }, env)
    }
  },
}
