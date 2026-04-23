/**
 * AI class-finder state.
 *
 * Two-stage flow:
 *   1. Worker /api/ai/search extracts structured filters from the user's
 *      natural-language query (subjects, breadths, RMP threshold, topic).
 *   2. We apply those filters via the existing useFilteredCourses pipeline
 *      to narrow the catalog to a manageable candidate set (~30-50).
 *   3. Worker /api/ai/rank scores each candidate against the topical query
 *      and returns 0-8 results with one-sentence "why this matches" blurbs.
 *
 * The store holds only the AI-specific state. The hard-filter side is
 * applied to the existing catalogStore so the user can see + tweak the
 * automatically-selected filters.
 */
import { create } from 'zustand'

export interface AskFilters {
  // Hard filters — populated by the AI ONLY when the student explicitly named
  // them. These get applied to the catalogStore as visible chips.
  subjects: string[]
  breadths: string[]
  rmpMin: number | null
  level: 'lower' | 'upper' | 'graduate' | null
  unitsMin: number | null
  unitsMax: number | null
  // Soft semantic search terms used to assemble the candidate pool the
  // ranker scores. Never shown as chips.
  keywords: string[]
  topicQuery: string
}

export interface RankedHit {
  id: string
  score: number
  why: string
}

interface AiSearchState {
  query: string
  isExtracting: boolean
  isRanking: boolean
  filters: AskFilters | null
  ranked: RankedHit[] | null
  error: string | null
  lastQueryAt: number | null
  setQuery: (q: string) => void
  reset: () => void
  setExtracting: (b: boolean) => void
  setRanking: (b: boolean) => void
  setFilters: (f: AskFilters) => void
  setRanked: (r: RankedHit[]) => void
  setError: (e: string | null) => void
}

export const useAiSearchStore = create<AiSearchState>((set) => ({
  query: '',
  isExtracting: false,
  isRanking: false,
  filters: null,
  ranked: null,
  error: null,
  lastQueryAt: null,
  setQuery: (q) => set({ query: q }),
  reset: () => set({ query: '', filters: null, ranked: null, error: null, lastQueryAt: null }),
  setExtracting: (b) => set({ isExtracting: b }),
  setRanking: (b) => set({ isRanking: b }),
  setFilters: (f) => set({ filters: f, lastQueryAt: Date.now() }),
  setRanked: (r) => set({ ranked: r }),
  setError: (e) => set({ error: e }),
}))

const API = (import.meta.env.VITE_SYNC_API_URL as string | undefined) || ''

export async function fetchExtract(query: string): Promise<AskFilters> {
  if (!API) throw new Error('AI search not configured (VITE_SYNC_API_URL missing)')
  const res = await fetch(`${API}/api/ai/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error || `AI search failed (${res.status})`)
  }
  const { filters } = (await res.json()) as { filters: AskFilters }
  return filters
}

export interface RankCandidate {
  id: string
  code: string
  title: string
  description?: string
  instructor?: string
  averageGrade?: string
}

export async function fetchRank(topicQuery: string, candidates: RankCandidate[]): Promise<RankedHit[]> {
  if (!API) throw new Error('AI search not configured')
  const res = await fetch(`${API}/api/ai/rank`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topicQuery, candidates }),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error || `AI rank failed (${res.status})`)
  }
  const { ranked } = (await res.json()) as { ranked: RankedHit[] }
  return ranked
}
