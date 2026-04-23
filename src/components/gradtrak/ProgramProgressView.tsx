import { useMemo, useState } from 'react'
import { useGradtrakStore } from '@/stores/gradtrakStore'
import { useDataStore } from '@/stores/dataStore'
import { useAllCoursesStore } from '@/stores/allCoursesStore'
import { evaluateProgram, eligibleCoursesForRule } from '@/utils/requirementMatcher'
import type { AllCourse } from '@/stores/allCoursesStore'

// Current term used to highlight "offered now" courses in drill-down.
const CURRENT_TERM = 'Fall 2026'

const TYPE_THEME = {
  major: { badge: 'bg-cal-gold/15 text-cal-gold ring-1 ring-cal-gold/30', ring: '#FDB515', text: 'text-cal-gold' },
  minor: { badge: 'bg-founders-rock/15 text-founders-rock ring-1 ring-founders-rock/30', ring: '#3B7EA1', text: 'text-founders-rock' },
  college: { badge: 'bg-soybean/15 text-soybean ring-1 ring-soybean/30', ring: '#859438', text: 'text-soybean' },
} as const

export default function ProgramProgressView() {
  const programs = useGradtrakStore((s) => s.programs)
  const selected = useGradtrakStore((s) => s.selectedProgramIds)
  const semesters = useGradtrakStore((s) => s.semesters)
  const overrides = useGradtrakStore((s) => s.manualOverrides)
  const toggleOverride = useGradtrakStore((s) => s.toggleOverride)
  const allCourses = useDataStore((s) => s.courses)
  const catalogCourses = useAllCoursesStore((s) => s.courses)

  // Track which requirements are expanded to show their eligible courses
  const [expandedReqs, setExpandedReqs] = useState<Set<string>>(new Set())
  const toggleExpand = (key: string) =>
    setExpandedReqs((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  const takenCodes = useMemo(() => semesters.flatMap((s) => s.courseCodes), [semesters])
  const selectedPrograms = useMemo(() => programs.filter((p) => selected.includes(p.id)), [programs, selected])

  const progresses = useMemo(
    () =>
      selectedPrograms.map((p) => {
        const raw = evaluateProgram(p, takenCodes, allCourses, catalogCourses)
        const adjusted = {
          ...raw,
          groups: raw.groups.map((g) => {
            const adjReqs = g.requirements.map((r) => {
              const overrideKey = `${p.id}:${r.requirementId}`
              const isOverridden = overrides[overrideKey]
              return isOverridden && !r.satisfied
                ? { ...r, satisfied: true, _overridden: true }
                : { ...r, _overridden: false }
            })
            const satisfiedCount = adjReqs.filter((r) => r.satisfied).length
            return { ...g, requirements: adjReqs, satisfiedCount, satisfied: satisfiedCount === g.totalCount }
          }),
        }
        adjusted.satisfied = adjusted.groups.every((g) => g.satisfied)
        return { program: p, progress: adjusted }
      }),
    [selectedPrograms, takenCodes, allCourses, catalogCourses, overrides]
  )

  if (selectedPrograms.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-dashed border-border-strong bg-bg-card/30 px-7 py-12 text-center">
        <div className="berkeley-dots pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-cal-gold/30 bg-cal-gold/5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cal-gold">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <p className="serif text-[18px] font-light text-text-primary">Choose your programs</p>
          <p className="mx-auto mt-1.5 max-w-[280px] text-[12.5px] text-text-muted">
            Select majors, minors, or college requirements from the sidebar to see your audit unfold.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {progresses.map(({ program, progress }) => {
        const totalReqs = progress.groups.reduce((sum, g) => sum + g.totalCount, 0)
        const satReqs = progress.groups.reduce((sum, g) => sum + g.satisfiedCount, 0)
        const pct = totalReqs > 0 ? (satReqs / totalReqs) * 100 : 0
        const theme = TYPE_THEME[program.type as keyof typeof TYPE_THEME] || TYPE_THEME.major

        return (
          <div
            key={program.id}
            className="group/program animate-rise relative overflow-hidden rounded-xl border border-border bg-bg-card transition-all hover:border-border-strong"
          >
            {/* gold-leaf top accent when complete */}
            {progress.satisfied && (
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-soybean/50 to-transparent" />
            )}

            {/* HEADER */}
            <div className="relative border-b border-border bg-bg-card/40 px-5 py-5 gold-leaf">
              <div className="flex items-start gap-5">
                {/* Mini progress dial */}
                <MiniDial pct={pct} satisfied={progress.satisfied} color={theme.ring} />

                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className={`mono text-[8.5px] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded ${theme.badge}`}>
                      {program.type}
                    </span>
                    {progress.satisfied && (
                      <span className="mono inline-flex items-center gap-1 rounded bg-soybean/15 px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.18em] text-soybean ring-1 ring-soybean/30">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Complete
                      </span>
                    )}
                  </div>
                  <h3 className="serif text-[19px] font-normal leading-tight text-text-primary">
                    {program.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-2.5">
                    <span className="mono text-[12.5px] font-semibold text-text-primary tabular-nums">
                      {satReqs}<span className="text-text-muted">/{totalReqs}</span>
                    </span>
                    <span className="text-[10.5px] uppercase tracking-wider text-text-muted">requirements met</span>
                  </div>

                  {/* Linear progress */}
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: progress.satisfied
                          ? 'linear-gradient(90deg, #859438, #b3c266)'
                          : `linear-gradient(90deg, ${theme.ring}99, ${theme.ring})`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* GROUPS / REQUIREMENTS */}
            {progress.groups.length === 0 || progress.groups.every((g) => g.totalCount === 0) ? (
              <div className="px-5 py-10 text-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2.5 text-text-muted/50">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-[12.5px] text-text-secondary">Detailed requirements coming soon</p>
                <p className="mt-1 text-[11px] text-text-muted">
                  Visit the official Berkeley catalog for the latest requirements.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {progress.groups.map((group) => {
                  const programGroup = program.groups.find((g) => g.id === group.groupId)
                  if (!programGroup || group.totalCount === 0) return null
                  const groupPct = group.totalCount > 0 ? (group.satisfiedCount / group.totalCount) * 100 : 0
                  return (
                    <div key={group.groupId} className="px-5 py-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[12.5px] font-semibold text-text-primary">{programGroup.name}</h4>
                          {programGroup.description && (
                            <p className="mt-0.5 text-[10.5px] leading-snug text-text-muted">
                              {programGroup.description}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <div className={`mono text-[11.5px] font-semibold tabular-nums ${group.satisfied ? 'text-soybean' : 'text-text-secondary'}`}>
                            {group.satisfiedCount}/{group.totalCount}
                          </div>
                          <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-border">
                            <div
                              className={`h-full transition-all duration-500 ${group.satisfied ? 'bg-soybean' : 'bg-cal-gold/70'}`}
                              style={{ width: `${groupPct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        {group.requirements.map((req) => {
                          const programReq = programGroup.requirements.find((r) => r.id === req.requirementId)
                          if (!programReq) return null
                          const isOverridden = (req as { _overridden?: boolean })._overridden
                          const expandKey = `${program.id}:${req.requirementId}`
                          const isExpanded = expandedReqs.has(expandKey)
                          // total-units / senior-residence have no eligible-course list
                          const hasDrilldown = !['total-units', 'senior-residence'].includes(programReq.rule.type)
                          return (
                            <div
                              key={req.requirementId}
                              className={`group/req relative rounded-md border transition-all ${
                                req.satisfied
                                  ? isOverridden
                                    ? 'border-founders-rock/30 bg-founders-rock/5'
                                    : 'border-soybean/25 bg-soybean/[0.04]'
                                  : 'border-border bg-bg-input/30 hover:border-border-strong'
                              }`}
                            >
                              <div className="flex items-start gap-2.5 px-3 py-2">
                                <button
                                  onClick={() => toggleOverride(program.id, req.requirementId)}
                                  className="mt-0.5 shrink-0 transition-transform hover:scale-110"
                                  title={
                                    isOverridden
                                      ? 'Click to remove manual override'
                                      : 'Click to mark as completed manually'
                                  }
                                >
                                  {req.satisfied ? (
                                    <span
                                      className={`flex h-4 w-4 items-center justify-center rounded-full ${
                                        isOverridden ? 'bg-founders-rock/20' : 'bg-soybean/20'
                                      }`}
                                    >
                                      <svg
                                        width="10"
                                        height="10"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3.5"
                                        className={isOverridden ? 'text-founders-rock' : 'text-soybean'}
                                      >
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    </span>
                                  ) : (
                                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-text-muted/40 transition-colors hover:border-cal-gold" />
                                  )}
                                </button>
                                <div
                                  className={`min-w-0 flex-1 ${hasDrilldown ? 'cursor-pointer' : ''}`}
                                  onClick={hasDrilldown ? () => toggleExpand(expandKey) : undefined}
                                  title={hasDrilldown ? 'Click to see eligible courses' : undefined}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-[11.5px] font-medium text-text-primary">
                                      {programReq.name}
                                      {isOverridden && (
                                        <span className="ml-1.5 mono text-[9px] font-semibold uppercase tracking-wider text-founders-rock">
                                          manual
                                        </span>
                                      )}
                                    </p>
                                    {hasDrilldown && (
                                      <svg
                                        width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                        className={`shrink-0 text-text-muted/60 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                      >
                                        <polyline points="9 18 15 12 9 6" />
                                      </svg>
                                    )}
                                  </div>
                                  {req.matchedCourses.length > 0 && (
                                    <p className="mono mt-0.5 text-[10.5px] text-soybean/90">
                                      <span className="text-soybean">✓</span> {req.matchedCourses.join(', ')}
                                    </p>
                                  )}
                                  {!req.satisfied && req.remaining > 0 && (
                                    <p className="mt-0.5 text-[10.5px] text-text-muted">
                                      {req.unitsCompleted !== undefined
                                        ? <><span className="mono text-text-secondary">{req.unitsCompleted}</span><span className="text-text-muted">/{req.unitsRequired}</span> units</>
                                        : <><span className="mono text-text-secondary">{req.remaining}</span> more needed</>
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                              {isExpanded && hasDrilldown && (
                                <RequirementDrilldown
                                  rule={programReq.rule}
                                  catalogCourses={catalogCourses}
                                  takenCodes={takenCodes}
                                />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Requirement drill-down: shows every course currently eligible for this
 * requirement, prioritized by:
 *   1. Already taken (✓)
 *   2. Currently offered (★ this term)
 *   3. Recently offered (within last 4 terms)
 *   4. Historical only
 *
 * For breadth/university-req rules with hundreds of matches, we cap at 100
 * but show the total count.
 */
function RequirementDrilldown({
  rule,
  catalogCourses,
  takenCodes,
}: {
  rule: import('@/types/gradtrak').RequirementRule
  catalogCourses: AllCourse[]
  takenCodes: string[]
}) {
  const [showAll, setShowAll] = useState(false)
  const [showOnlyOffered, setShowOnlyOffered] = useState(false)

  const eligible = useMemo(
    () => eligibleCoursesForRule(rule, catalogCourses, 500),
    [rule, catalogCourses]
  )

  const takenSet = useMemo(() => new Set(takenCodes.map((c) => c.toUpperCase().trim())), [takenCodes])

  const enriched = useMemo(() => {
    return eligible.map((c) => {
      const isTaken = takenSet.has(c.code.toUpperCase().trim())
      const isOffered = c.semestersOffered?.includes(CURRENT_TERM)
      const recentTerm = c.semestersOffered?.[0] // sorted newest-first by scrape
      let priority = 3 // historical
      if (isTaken) priority = 0
      else if (isOffered) priority = 1
      else if (recentTerm && /20(2[5-9]|3\d)/.test(recentTerm)) priority = 2
      return { course: c, isTaken, isOffered, recentTerm, priority }
    }).sort((a, b) => a.priority - b.priority || a.course.code.localeCompare(b.course.code))
  }, [eligible, takenSet])

  const filtered = showOnlyOffered ? enriched.filter((e) => e.isOffered || e.isTaken) : enriched
  const visible = showAll ? filtered : filtered.slice(0, 12)
  const hiddenCount = filtered.length - visible.length

  if (eligible.length === 0) {
    return (
      <div className="border-t border-border bg-bg-input/20 px-3 py-2.5">
        <p className="text-[10.5px] italic text-text-muted">No eligible courses found in catalog.</p>
      </div>
    )
  }

  return (
    <div className="border-t border-border bg-bg-input/30 px-3 py-2.5">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="mono text-[10px] font-semibold uppercase tracking-wider text-cal-gold/80">
            {filtered.length} eligible
          </span>
          <span className="text-[10px] text-text-muted">·</span>
          <button
            onClick={() => setShowOnlyOffered(!showOnlyOffered)}
            className={`text-[10px] transition-colors ${showOnlyOffered ? 'text-cal-gold' : 'text-text-muted hover:text-text-primary'}`}
          >
            {showOnlyOffered ? '✓ ' : ''}offered now
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {visible.map(({ course, isTaken, isOffered, recentTerm }) => (
          <div
            key={course.code}
            className={`flex items-baseline justify-between gap-2 rounded border px-2 py-1.5 ${
              isTaken
                ? 'border-soybean/30 bg-soybean/[0.06]'
                : isOffered
                ? 'border-cal-gold/25 bg-cal-gold/[0.04]'
                : 'border-border-input/40 bg-bg-input/40'
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                {isTaken && <span className="text-[9px] text-soybean">✓</span>}
                {!isTaken && isOffered && <span className="text-[9px] text-cal-gold">★</span>}
                <span className="mono text-[10.5px] font-semibold text-text-primary">{course.code}</span>
                {course.units > 0 && <span className="mono text-[9px] text-cal-gold/70">{course.units}u</span>}
              </div>
              <p className="truncate text-[10px] text-text-muted" title={course.title}>{course.title}</p>
            </div>
            {!isTaken && (
              <span className="mono shrink-0 text-[8.5px] uppercase tracking-wider text-text-muted/70" title={`Most recent: ${recentTerm || 'unknown'}`}>
                {isOffered ? 'now' : (recentTerm?.split(' ').map((p, i) => i === 1 ? `'${p.slice(-2)}` : p.slice(0, 2)).join('') || 'old')}
              </span>
            )}
          </div>
        ))}
      </div>
      {hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-2 text-[10.5px] text-cal-gold/80 hover:text-cal-gold"
        >
          {showAll ? 'Show fewer' : `Show ${hiddenCount} more`}
        </button>
      )}
    </div>
  )
}

function MiniDial({ pct, satisfied, color }: { pct: number; satisfied: boolean; color: string }) {
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference
  const finalColor = satisfied ? '#859438' : color

  return (
    <div className="relative shrink-0">
      <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90 transform">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="rgba(168, 176, 189, 0.12)" strokeWidth="3" />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke={finalColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.2, 0.7, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="mono text-[11px] font-semibold tabular-nums text-text-primary">
          {Math.round(pct)}%
        </span>
      </div>
    </div>
  )
}
