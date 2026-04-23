/**
 * Berkeleytime sync backend (Cloudflare Workers + Workers KV).
 *
 * Endpoints:
 *   POST /api/auth/google     → body { idToken } → { userId, email, name, picture }
 *   POST /api/user            → { userId } (anonymous random UUID, legacy)
 *   POST /api/sync            → body { userId, plans, schedule } → { syncedAt }
 *   GET  /api/sync/:userId    → { plans, schedule, syncedAt } | 404
 *
 * Auth model: Google OAuth (preferred) or anonymous UUID (legacy fallback).
 * The userId returned by /api/auth/google is the Google `sub` claim, prefixed
 * with `g_` to keep it distinguishable from anonymous UUIDs.
 *
 * Rate limit: max 60 sync writes per userId per hour.
 */
export interface Env {
  SYNC_KV: KVNamespace
  ALLOWED_ORIGIN: string
  GOOGLE_CLIENT_ID: string
  ANTHROPIC_API_KEY: string
}

interface AskFilters {
  subjects: string[]
  breadths: string[]
  rmpMin: number | null
  level: 'lower' | 'upper' | 'graduate' | null
  unitsMin: number | null
  unitsMax: number | null
  topicQuery: string
}

interface RankCandidate {
  id: string
  code: string
  title: string
  description?: string
}

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-haiku-4-5-20251001'

async function callAnthropic(env: Env, system: string, user: string, maxTokens = 800): Promise<string> {
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Anthropic API ${res.status}: ${errText.slice(0, 200)}`)
  }
  const data = (await res.json()) as { content: { type: string; text: string }[] }
  const text = data.content?.find((c) => c.type === 'text')?.text ?? ''
  return text
}

function extractJson<T>(raw: string): T {
  // LLM responses sometimes include ```json fences or stray prose.
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  const candidate = fenced ? fenced[1] : raw
  // Find the first { … } or [ … ] block.
  const jsonStart = candidate.search(/[{[]/)
  if (jsonStart < 0) throw new Error(`No JSON found in: ${raw.slice(0, 100)}`)
  const trimmed = candidate.slice(jsonStart).trim()
  return JSON.parse(trimmed) as T
}

const EXTRACT_SYSTEM = `You are a Berkeleytime course-search assistant. The user describes a Berkeley class they want. Extract structured filters as JSON.

Return ONLY a single JSON object with these exact fields (no markdown, no commentary):
{
  "subjects": string[],   // Berkeley department codes, e.g. ["PHILOS", "BUDDSTD", "RELIGST"]. Map natural-language disciplines to codes. Empty array if none.
  "breadths": string[],   // Subset of: "Arts & Literature", "Biological Science", "Historical Studies", "International Studies", "Philosophy & Values", "Physical Science", "Social & Behavioral Sciences", "American Cultures", "Reading and Composition A", "Reading and Composition B"
  "rmpMin": number|null,  // RateMyProfessor minimum (1-5), null if unspecified
  "level": "lower"|"upper"|"graduate"|null,
  "unitsMin": number|null,
  "unitsMax": number|null,
  "topicQuery": string    // Short phrase describing what the class should be ABOUT, used for ranking against descriptions. Strip filter language.
}

Subject mapping cheatsheet (partial):
  philosophy → PHILOS; eastern philosophy/buddhism → PHILOS, BUDDSTD, EALANG, RELIGST
  politics → POL SCI; CS/coding → COMPSCI; data/statistics → DATA, STAT
  poli sci → POL SCI; econ → ECON; psych → PSYCH; bio → BIOLOGY, MCELLBI, INTEGBI
  film → FILM; music → MUSIC; art history → HISTART; gender → GWS
  middle east → MELC; east asian → CHINESE, JAPAN, KOREAN, EALANG
  english → ENGLISH; rhetoric → RHETOR; history → HISTORY
  business → UGBA; engineering → varies (ME, EECS, CIVENG, BIOENG, etc.)`

const RANK_SYSTEM = `You are a Berkeleytime course-search assistant. Given a topical query and a list of candidate Berkeley courses, return ONLY courses that are GENUINELY about the topic.

Hard rules:
- DO NOT stretch to find tenuous connections. Tangentially-related ≠ a match.
- DO NOT include a course just because it shares a keyword in the title.
- A course must DIRECTLY address the topic in its title or description to count.
- If NO candidate genuinely matches, return { "ranked": [] }. It is better to return zero matches than fake ones.
- Score 0.7+ = strong match (course is centrally about the topic).
- Score 0.5-0.7 = solid match (significant chunk of the course covers the topic).
- Below 0.5: omit entirely.

For each kept candidate, write a 1-sentence reason starting with a capital letter and ending with a period. The reason must point to specific content (titles, topics, descriptions) — never speculate ("might cover", "could be relevant").

Return ONLY a JSON object (no markdown, no commentary):
{ "ranked": [ { "id": string, "score": number, "why": string }, ... ] }

Sort by score descending. Maximum 8 results. Empty array is a valid and often correct answer.`

async function aiSearch(env: Env, query: string): Promise<AskFilters> {
  const text = await callAnthropic(env, EXTRACT_SYSTEM, query, 400)
  const parsed = extractJson<Partial<AskFilters>>(text)
  // Normalize + defaults
  return {
    subjects: Array.isArray(parsed.subjects) ? parsed.subjects.map(String) : [],
    breadths: Array.isArray(parsed.breadths) ? parsed.breadths.map(String) : [],
    rmpMin: typeof parsed.rmpMin === 'number' ? parsed.rmpMin : null,
    level: parsed.level === 'lower' || parsed.level === 'upper' || parsed.level === 'graduate' ? parsed.level : null,
    unitsMin: typeof parsed.unitsMin === 'number' ? parsed.unitsMin : null,
    unitsMax: typeof parsed.unitsMax === 'number' ? parsed.unitsMax : null,
    topicQuery: typeof parsed.topicQuery === 'string' ? parsed.topicQuery : query,
  }
}

async function aiRank(env: Env, topic: string, candidates: RankCandidate[]): Promise<{ id: string; score: number; why: string }[]> {
  if (candidates.length === 0) return []
  // Cap to 50 to keep prompt size sane.
  const capped = candidates.slice(0, 50)
  const userMsg = `Topic: ${topic}\n\nCandidates:\n${JSON.stringify(capped, null, 0)}`
  const text = await callAnthropic(env, RANK_SYSTEM, userMsg, 1500)
  const parsed = extractJson<{ ranked: { id: string; score: number; why: string }[] }>(text)
  return Array.isArray(parsed.ranked) ? parsed.ranked.slice(0, 8) : []
}

interface SyncPayload {
  userId: string
  plans: unknown
  schedule: unknown
}

interface GoogleTokenInfo {
  iss: string
  azp: string
  aud: string
  sub: string
  email: string
  email_verified: string | boolean
  name?: string
  picture?: string
  given_name?: string
  family_name?: string
  iat: string
  exp: string
}

function pickOrigin(env: Env, requestOrigin: string | null): string {
  const allowed = (env.ALLOWED_ORIGIN ?? '*').split(',').map((s) => s.trim())
  if (allowed.includes('*')) return requestOrigin || '*'
  if (requestOrigin && allowed.includes(requestOrigin)) return requestOrigin
  return allowed[0] || 'null'
}

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

function json(body: unknown, init: ResponseInit = {}, env?: Env, reqOrigin: string | null = null): Response {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  const origin = pickOrigin(env ?? ({ ALLOWED_ORIGIN: '*' } as Env), reqOrigin)
  for (const [k, v] of Object.entries(corsHeaders(origin))) headers.set(k, v)
  return new Response(JSON.stringify(body), { ...init, headers })
}

async function checkRateLimit(env: Env, userId: string): Promise<boolean> {
  const key = `rate:${userId}:${Math.floor(Date.now() / 3600000)}`
  const count = parseInt((await env.SYNC_KV.get(key)) || '0')
  if (count >= 60) return false
  await env.SYNC_KV.put(key, String(count + 1), { expirationTtl: 3700 })
  return true
}

/**
 * Verify a Google id_token using Google's tokeninfo endpoint.
 * Returns the verified payload, or null if the token is invalid / expired
 * / not issued for our client.
 */
async function verifyGoogleToken(idToken: string, env: Env): Promise<GoogleTokenInfo | null> {
  if (!idToken || typeof idToken !== 'string') return null
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
      { method: 'GET' }
    )
    if (!res.ok) return null
    const info = (await res.json()) as GoogleTokenInfo
    // Audience must match our client ID — prevents tokens minted for other apps.
    if (info.aud !== env.GOOGLE_CLIENT_ID) return null
    // Issuer must be Google.
    if (info.iss !== 'https://accounts.google.com' && info.iss !== 'accounts.google.com') return null
    // Token must not be expired.
    if (parseInt(info.exp) * 1000 < Date.now()) return null
    // Email must be verified by Google before we trust it.
    if (info.email_verified !== true && info.email_verified !== 'true') return null
    return info
  } catch {
    return null
  }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const reqOrigin = req.headers.get('Origin')
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(pickOrigin(env, reqOrigin)) })
    }

    const url = new URL(req.url)
    const path = url.pathname

    try {
      // ── Google OAuth sign-in ────────────────────────────────────────────
      if (req.method === 'POST' && path === '/api/auth/google') {
        const body = (await req.json().catch(() => ({}))) as { idToken?: string }
        const info = await verifyGoogleToken(body.idToken ?? '', env)
        if (!info) return json({ error: 'invalid token' }, { status: 401 }, env, reqOrigin)

        const userId = `g_${info.sub}`
        const profile = {
          email: info.email,
          name: info.name ?? info.email,
          picture: info.picture ?? null,
          givenName: info.given_name ?? null,
        }
        const existing = await env.SYNC_KV.get(`user:${userId}:meta`)
        if (!existing) {
          await env.SYNC_KV.put(
            `user:${userId}:meta`,
            JSON.stringify({ ...profile, createdAt: new Date().toISOString() })
          )
        } else {
          // Refresh profile fields so name/picture/email stay current with Google.
          const meta = JSON.parse(existing) as { createdAt?: string }
          await env.SYNC_KV.put(
            `user:${userId}:meta`,
            JSON.stringify({ ...profile, createdAt: meta.createdAt ?? new Date().toISOString() })
          )
        }
        return json({ userId, ...profile }, {}, env, reqOrigin)
      }

      // ── AI search: extract structured filters from a natural-language query ──
      if (req.method === 'POST' && path === '/api/ai/search') {
        if (!env.ANTHROPIC_API_KEY) return json({ error: 'AI search not configured' }, { status: 503 }, env, reqOrigin)
        const body = (await req.json().catch(() => ({}))) as { query?: string }
        const q = (body.query ?? '').trim()
        if (!q || q.length < 3) return json({ error: 'query required' }, { status: 400 }, env, reqOrigin)
        if (q.length > 500) return json({ error: 'query too long' }, { status: 400 }, env, reqOrigin)
        try {
          const filters = await aiSearch(env, q)
          return json({ filters }, {}, env, reqOrigin)
        } catch (e) {
          return json({ error: e instanceof Error ? e.message : 'extract failed' }, { status: 500 }, env, reqOrigin)
        }
      }

      // ── AI rank: rank candidate courses by topical fit ──────────────────
      if (req.method === 'POST' && path === '/api/ai/rank') {
        if (!env.ANTHROPIC_API_KEY) return json({ error: 'AI search not configured' }, { status: 503 }, env, reqOrigin)
        const body = (await req.json().catch(() => ({}))) as { topicQuery?: string; candidates?: RankCandidate[] }
        const topic = (body.topicQuery ?? '').trim()
        const cands = Array.isArray(body.candidates) ? body.candidates : []
        if (!topic || cands.length === 0) return json({ error: 'topicQuery + candidates required' }, { status: 400 }, env, reqOrigin)
        if (cands.length > 80) return json({ error: 'too many candidates (max 80)' }, { status: 400 }, env, reqOrigin)
        try {
          const ranked = await aiRank(env, topic, cands)
          return json({ ranked }, {}, env, reqOrigin)
        } catch (e) {
          return json({ error: e instanceof Error ? e.message : 'rank failed' }, { status: 500 }, env, reqOrigin)
        }
      }

      // ── Anonymous user (legacy / opt-out) ───────────────────────────────
      if (req.method === 'POST' && path === '/api/user') {
        const userId = crypto.randomUUID()
        await env.SYNC_KV.put(`user:${userId}:meta`, JSON.stringify({ createdAt: new Date().toISOString() }))
        return json({ userId }, { status: 201 }, env, reqOrigin)
      }

      if (req.method === 'POST' && path === '/api/sync') {
        const body = (await req.json()) as SyncPayload
        if (!body?.userId || typeof body.userId !== 'string') {
          return json({ error: 'userId required' }, { status: 400 }, env, reqOrigin)
        }
        const meta = await env.SYNC_KV.get(`user:${body.userId}:meta`)
        if (!meta) return json({ error: 'unknown userId' }, { status: 404 }, env, reqOrigin)
        if (!(await checkRateLimit(env, body.userId))) {
          return json({ error: 'rate limit exceeded (60/hour)' }, { status: 429 }, env, reqOrigin)
        }
        const syncedAt = new Date().toISOString()
        await env.SYNC_KV.put(
          `user:${body.userId}:state`,
          JSON.stringify({ plans: body.plans, schedule: body.schedule, syncedAt })
        )
        return json({ syncedAt }, {}, env, reqOrigin)
      }

      // Allow Google sub IDs (g_ prefix + digits) as well as UUIDs.
      const syncMatch = path.match(/^\/api\/sync\/(g_\d+|[0-9a-f-]{36})$/)
      if (req.method === 'GET' && syncMatch) {
        const stored = await env.SYNC_KV.get(`user:${syncMatch[1]}:state`)
        if (!stored) return json({ error: 'no state' }, { status: 404 }, env, reqOrigin)
        return json(JSON.parse(stored), {}, env, reqOrigin)
      }

      // ── Account deletion ────────────────────────────────────────────────
      // userId in the body acts as the bearer token (same trust model as sync).
      // Removes meta + state. The next sign-in will re-create a fresh meta
      // record from the verified Google profile.
      if (req.method === 'POST' && path === '/api/account/delete') {
        const body = (await req.json().catch(() => ({}))) as { userId?: string }
        const userId = body.userId
        if (!userId || typeof userId !== 'string' || !/^(g_\d+|[0-9a-f-]{36})$/.test(userId)) {
          return json({ error: 'userId required' }, { status: 400 }, env, reqOrigin)
        }
        const meta = await env.SYNC_KV.get(`user:${userId}:meta`)
        if (!meta) return json({ error: 'unknown userId' }, { status: 404 }, env, reqOrigin)
        // Delete the two records that hold this user's data. KV deletes are
        // sequential — we await both to make sure neither is left orphaned.
        await env.SYNC_KV.delete(`user:${userId}:meta`)
        await env.SYNC_KV.delete(`user:${userId}:state`)
        return json({ deleted: true, userId }, {}, env, reqOrigin)
      }

      return json({ error: 'not found' }, { status: 404 }, env, reqOrigin)
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : 'internal error' }, { status: 500 }, env, reqOrigin)
    }
  },
}
