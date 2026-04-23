/**
 * AI class finder. Lives at the top of the FilterSidebar.
 *
 * The user types a free-form query ("philosophy class about Eastern thought,
 * AC breadth, RMP > 4"). We:
 *   1. POST it to /api/ai/search → get structured filters back
 *   2. Apply those filters to the existing catalogStore
 *   3. POST the top filtered candidates to /api/ai/rank → get scored hits
 *   4. The ClassList watches the AI store and renders the ranked hits
 *      with their "why this matches" blurb when present.
 *
 * Editorial styling: serif italic placeholder, gold accents, subtle prompt
 * suggestions on first focus.
 */
import { useEffect, useRef, useState } from 'react'
import { useAiSearchStore, fetchExtract, fetchRank, type AskFilters } from '@/stores/aiSearchStore'
import { useCatalogStore } from '@/stores/catalogStore'
import { useDataStore } from '@/stores/dataStore'

const SUGGESTIONS = [
  'philosophy class about Eastern thought, RMP > 4',
  'easy upper-div breadth, no Friday classes',
  'AC requirement that\'s actually interesting',
  'data science elective with Joseph Gonzalez',
]

/**
 * Apply ONLY the hard filters the AI flagged as explicitly stated by the
 * student. The AI prompt is now strict: subjects/breadths/rmp/level/units only
 * appear when the student literally named them. Keywords stay invisible — they
 * exist solely to widen the candidate pool the ranker sees, not to clutter
 * the catalog with surprise chips ("why is RMP > 4 selected when I never
 * asked for that?").
 */
function applyFiltersToStore(filters: AskFilters) {
  const cs = useCatalogStore.getState()
  cs.resetFilters()
  for (const s of filters.subjects) cs.toggleMajor(s)
  for (const b of filters.breadths) {
    if (b === 'American Cultures') cs.toggleRequirement('universityReqs', 'American Cultures')
    else if (b.startsWith('Reading and Composition')) cs.toggleRequirement('universityReqs', b)
    else cs.toggleRequirement('lsBreadth', b)
  }
  if (filters.rmpMin !== null) cs.setRmpMinRating(Math.max(0, Math.min(5, filters.rmpMin)))
  if (filters.level) cs.toggleClassLevel(filters.level)
  if (filters.unitsMin !== null || filters.unitsMax !== null) {
    cs.setUnitsRange([filters.unitsMin ?? 0, filters.unitsMax ?? 5])
  }
}

export default function AskSearch() {
  const query = useAiSearchStore((s) => s.query)
  const isExtracting = useAiSearchStore((s) => s.isExtracting)
  const isRanking = useAiSearchStore((s) => s.isRanking)
  const ranked = useAiSearchStore((s) => s.ranked)
  const error = useAiSearchStore((s) => s.error)
  const setQuery = useAiSearchStore((s) => s.setQuery)
  const reset = useAiSearchStore((s) => s.reset)
  const setExtracting = useAiSearchStore((s) => s.setExtracting)
  const setRanking = useAiSearchStore((s) => s.setRanking)
  const setFilters = useAiSearchStore((s) => s.setFilters)
  const setRanked = useAiSearchStore((s) => s.setRanked)
  const setError = useAiSearchStore((s) => s.setError)

  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const submit = async () => {
    const q = query.trim()
    if (!q || q.length < 3) { setError('Try a longer description'); return }
    setError(null)
    setRanked([])
    // STAGE 1 — extract filters
    setExtracting(true)
    let filters: AskFilters
    try { filters = await fetchExtract(q) }
    catch (e) {
      setExtracting(false)
      setError(e instanceof Error ? e.message : 'Search failed')
      return
    }
    setExtracting(false)
    setFilters(filters)
    applyFiltersToStore(filters)

    // STAGE 2 — semantic candidate selection + rank.
    //
    // Goal: hand the ranker a wide, topically-relevant pool that it can
    // *recommend* from. The old pipeline collapsed the catalog to a single
    // subject ("philosophy" → PHILOS), which missed cross-department offerings
    // (BUDDSTD, EALANG, RELIGST). The new approach keeps the pool wide:
    //
    //   1. Apply hard filters the student explicitly named (rmpMin, level,
    //      units, breadths, subjects-when-named). Skip soft filters.
    //   2. Score every remaining course by how many AI-generated keywords
    //      appear in its title or description.
    //   3. Take the top ~80 by keyword score (plus any ties) — we want a
    //      generous pool because the ranker will prune to a tight final 8.
    if (!filters.topicQuery) return
    setRanking(true)
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    const allCourses = useDataStore.getState().courses

    const subjectsUpper = new Set(filters.subjects.map((s) => s.toUpperCase().trim()))
    const breadthsLower = new Set(filters.breadths.map((b) => b.toLowerCase()))
    const keywords = filters.keywords.map((k) => k.toLowerCase().trim()).filter(Boolean)

    // Pass 1: apply hard constraints only.
    const hardFiltered = allCourses.filter((c) => {
      if (subjectsUpper.size > 0) {
        const subj = (c.code || '').split(' ')[0].toUpperCase()
        if (!subjectsUpper.has(subj)) return false
      }
      if (breadthsLower.size > 0) {
        const courseBreadths = (c.requirements?.lsBreadth ?? []).map((b) => b.toLowerCase())
        const ac = (c.requirements?.universityReqs ?? []).map((r) => r.toLowerCase())
        if (
          !courseBreadths.some((b) => breadthsLower.has(b)) &&
          !ac.some((r) => breadthsLower.has(r))
        ) return false
      }
      if (filters.rmpMin !== null && (c.rmpRating?.avgRating ?? 0) < filters.rmpMin) return false
      if (filters.level && c.level !== filters.level) return false
      return true
    })

    // Pass 2: score by keyword match strength against title + description.
    // Title hits weight 3× description hits — a course with the term in its
    // name is almost always more relevant than one that mentions it in passing.
    type Scored = { course: (typeof allCourses)[number]; score: number }
    let pool: Scored[]
    if (keywords.length === 0) {
      // No keywords (rare — only when the AI returned nothing topical).
      // Fall back to the hard-filtered set, capped.
      pool = hardFiltered.slice(0, 80).map((c) => ({ course: c, score: 0 }))
    } else {
      const scored: Scored[] = []
      for (const c of hardFiltered) {
        const title = (c.title || '').toLowerCase()
        const desc = (c.description || '').toLowerCase()
        let s = 0
        for (const k of keywords) {
          if (!k) continue
          if (title.includes(k)) s += 3
          if (desc.includes(k)) s += 1
        }
        if (s > 0) scored.push({ course: c, score: s })
      }
      scored.sort((a, b) => b.score - a.score)
      pool = scored.slice(0, 80)
    }

    const candidates = pool.map(({ course }) => ({
      id: course.id,
      code: course.code,
      title: course.title,
      description: (course.description ?? '').slice(0, 500),
    }))

    if (candidates.length === 0) {
      setRanking(false)
      setError('No courses matched those terms')
      return
    }
    try {
      const hits = await fetchRank(filters.topicQuery, candidates)
      setRanked(hits)
      if (hits.length === 0) setError('No strong matches in the catalog')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ranking failed')
    } finally {
      setRanking(false)
    }
  }

  // Cmd/Ctrl-K focuses the AI search box.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const isLoading = isExtracting || isRanking
  const hasResults = (ranked?.length ?? 0) > 0

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <span className="eyebrow">Ask</span>
        <div className="flex items-end justify-between gap-3">
          <h2 className="serif text-[20px] font-semibold leading-none tracking-tight text-text-primary">
            Find a <span className="serif-italic text-cal-gold">class</span>
          </h2>
          {hasResults && (
            <button
              onClick={() => { reset(); useCatalogStore.getState().resetFilters() }}
              className="mono text-[10px] font-bold uppercase tracking-[0.16em] text-cal-gold/80 hover:text-cal-gold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <textarea
          ref={inputRef as unknown as React.RefObject<HTMLTextAreaElement>}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void submit() } }}
          placeholder="philosophy class about Eastern thought…"
          rows={2}
          disabled={isLoading}
          className="w-full resize-none rounded-lg border border-cal-gold/25 bg-cal-gold/[0.04] px-3 py-2.5 serif text-[13.5px] text-text-primary placeholder:italic placeholder:text-text-muted/70 focus:border-cal-gold/50 focus:outline-none focus:ring-2 focus:ring-cal-gold/15 disabled:opacity-60"
        />
        <kbd className="pointer-events-none absolute right-2 top-2 mono rounded border border-border-strong bg-bg-card/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-text-muted/70">⌘K</kbd>
        {focused && !query && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-md border border-cal-gold/15 bg-bg-elevated/95 p-2 shadow-xl backdrop-blur-md animate-fade-in">
            <div className="mono mb-1.5 px-1 text-[9px] font-bold uppercase tracking-[0.16em] text-text-muted/70">Try</div>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onMouseDown={(e) => { e.preventDefault(); setQuery(s); inputRef.current?.focus() }}
                className="block w-full rounded px-2 py-1.5 text-left serif text-[12.5px] italic text-text-secondary transition-colors hover:bg-cal-gold/10 hover:text-cal-gold"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => void submit()}
          disabled={isLoading || !query.trim()}
          className="mono flex items-center gap-1.5 rounded-md bg-cal-gold px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-bg-primary transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {isExtracting ? 'Reading…' : isRanking ? 'Ranking…' : 'Ask'}
          {!isLoading && (
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          )}
        </button>
        {error && (
          <span className="mono text-[10px] uppercase tracking-[0.14em] text-wellman">
            {error}
          </span>
        )}
      </div>

      {hasResults && (
        <div className="rounded-md border border-cal-gold/20 bg-cal-gold/[0.03] px-3 py-2">
          <div className="mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-cal-gold/85">
            {ranked!.length} AI match{ranked!.length === 1 ? '' : 'es'} · scroll the list
          </div>
        </div>
      )}
    </div>
  )
}
