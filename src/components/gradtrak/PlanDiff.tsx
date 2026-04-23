/**
 * Plan diff: side-by-side comparison of two plans showing units, classes,
 * selected programs, requirement satisfaction, and which courses differ.
 *
 * Helps the user answer: "what changes if I drop a class / pick a different
 * major / add a minor?"
 */
import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useGradtrakStore } from '@/stores/gradtrakStore'
import { useDataStore } from '@/stores/dataStore'
import { useAllCoursesStore } from '@/stores/allCoursesStore'
import { evaluateProgram } from '@/utils/requirementMatcher'
import { totalUnits as sumUnits } from '@/utils/courseLookup'
import type { Plan } from '@/stores/gradtrakStore'

export default function PlanDiff({ onClose }: { onClose: () => void }) {
  const plans = useGradtrakStore((s) => s.plans)
  const programs = useGradtrakStore((s) => s.programs)
  const allCourses = useDataStore((s) => s.courses)
  const catalogCourses = useAllCoursesStore((s) => s.courses)

  const [leftId, setLeftId] = useState(plans[0]?.id || '')
  const [rightId, setRightId] = useState(plans[1]?.id || plans[0]?.id || '')

  const left = plans.find((p) => p.id === leftId) || plans[0]
  const right = plans.find((p) => p.id === rightId) || plans[0]

  const leftStats = usePlanStats(left, programs, allCourses, catalogCourses)
  const rightStats = usePlanStats(right, programs, allCourses, catalogCourses)

  const courseDiff = useMemo(() => {
    const lc = new Set(left.semesters.flatMap((s) => s.courseCodes))
    const rc = new Set(right.semesters.flatMap((s) => s.courseCodes))
    return {
      onlyLeft: [...lc].filter((c) => !rc.has(c)).sort(),
      onlyRight: [...rc].filter((c) => !lc.has(c)).sort(),
      shared: [...lc].filter((c) => rc.has(c)).sort(),
    }
  }, [left, right])

  const programDiff = useMemo(() => {
    const lp = new Set(left.selectedProgramIds)
    const rp = new Set(right.selectedProgramIds)
    return {
      onlyLeft: [...lp].filter((p) => !rp.has(p)).map((id) => programs.find((x) => x.id === id)?.name || id),
      onlyRight: [...rp].filter((p) => !lp.has(p)).map((id) => programs.find((x) => x.id === id)?.name || id),
    }
  }, [left, right, programs])

  return createPortal((
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-[min(100%-1rem,1100px)] flex-col overflow-hidden rounded-2xl border border-cal-gold/20 bg-bg-elevated shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-border bg-berkeley-blue/30 px-6 py-5">
          <div>
            <div className="mono text-[9.5px] font-semibold uppercase tracking-[0.22em] text-cal-gold/85">
              Compare Plans
            </div>
            <h3 className="serif mt-1 text-[24px] font-light text-text-primary">
              What <span className="serif-italic text-cal-gold">changes</span> between plans?
            </h3>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-bg-hover hover:text-text-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-px border-b border-border bg-border">
          <PlanSelector label="Plan A" value={leftId} onChange={setLeftId} plans={plans} />
          <PlanSelector label="Plan B" value={rightId} onChange={setRightId} plans={plans} />
        </div>

        <div className="grid flex-1 grid-cols-2 gap-px overflow-y-auto bg-border">
          <PlanColumn name={left.name} stats={leftStats} side="left" />
          <PlanColumn name={right.name} stats={rightStats} side="right" />
        </div>

        {/* Diff summary band */}
        <div className="border-t border-border bg-bg-card/40 px-6 py-4">
          <div className="grid grid-cols-3 gap-6">
            <DiffStat label="Δ classes" left={leftStats.classCount} right={rightStats.classCount} />
            <DiffStat label="Δ units" left={leftStats.unitsTotal} right={rightStats.unitsTotal} />
            <DiffStat label="Δ requirements met" left={leftStats.satReqs} right={rightStats.satReqs} />
          </div>
          {(courseDiff.onlyLeft.length > 0 || courseDiff.onlyRight.length > 0 || programDiff.onlyLeft.length > 0 || programDiff.onlyRight.length > 0) && (
            <div className="mt-4 grid grid-cols-2 gap-6 text-[11px]">
              <div>
                <div className="mono mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-cal-gold/80">
                  Only in {left.name}
                </div>
                <div className="space-y-1">
                  {programDiff.onlyLeft.map((p) => (
                    <div key={p} className="flex items-center gap-1.5"><span className="mono text-[8px] uppercase text-founders-rock">prog</span><span className="text-text-secondary">{p}</span></div>
                  ))}
                  {courseDiff.onlyLeft.slice(0, 8).map((c) => (
                    <div key={c} className="mono text-text-secondary">{c}</div>
                  ))}
                  {courseDiff.onlyLeft.length > 8 && <div className="mono text-text-muted">+ {courseDiff.onlyLeft.length - 8} more</div>}
                  {programDiff.onlyLeft.length === 0 && courseDiff.onlyLeft.length === 0 && <div className="italic text-text-muted">— nothing —</div>}
                </div>
              </div>
              <div>
                <div className="mono mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-cal-gold/80">
                  Only in {right.name}
                </div>
                <div className="space-y-1">
                  {programDiff.onlyRight.map((p) => (
                    <div key={p} className="flex items-center gap-1.5"><span className="mono text-[8px] uppercase text-founders-rock">prog</span><span className="text-text-secondary">{p}</span></div>
                  ))}
                  {courseDiff.onlyRight.slice(0, 8).map((c) => (
                    <div key={c} className="mono text-text-secondary">{c}</div>
                  ))}
                  {courseDiff.onlyRight.length > 8 && <div className="mono text-text-muted">+ {courseDiff.onlyRight.length - 8} more</div>}
                  {programDiff.onlyRight.length === 0 && courseDiff.onlyRight.length === 0 && <div className="italic text-text-muted">— nothing —</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ), document.body)
}

function usePlanStats(
  plan: Plan,
  programs: import('@/types/gradtrak').Program[],
  allCourses: import('@/types').Course[],
  catalogCourses: import('@/stores/allCoursesStore').AllCourse[]
) {
  return useMemo(() => {
    const taken = plan.semesters.flatMap((s) => s.courseCodes)
    const classCount = taken.length
    const unitsTotal = sumUnits(taken, allCourses, catalogCourses)

    const selectedPrograms = programs.filter((p) => plan.selectedProgramIds.includes(p.id))
    let totalReqs = 0
    let satReqs = 0
    const programSummaries: { id: string; name: string; type: string; sat: number; total: number }[] = []
    for (const p of selectedPrograms) {
      const progress = evaluateProgram(p, taken, allCourses, catalogCourses)
      let pSat = 0
      let pTotal = 0
      for (const g of progress.groups) {
        for (const r of g.requirements) {
          pTotal++
          totalReqs++
          const overrideKey = `${p.id}:${r.requirementId}`
          if (r.satisfied || plan.manualOverrides[overrideKey]) {
            pSat++
            satReqs++
          }
        }
      }
      programSummaries.push({ id: p.id, name: p.name, type: p.type, sat: pSat, total: pTotal })
    }

    return {
      classCount,
      unitsTotal,
      semesterCount: plan.semesters.length,
      programCount: selectedPrograms.length,
      satReqs,
      totalReqs,
      pct: totalReqs > 0 ? Math.round((satReqs / totalReqs) * 100) : 0,
      programs: programSummaries,
    }
  }, [plan, programs, allCourses, catalogCourses])
}

function PlanSelector({
  label, value, onChange, plans,
}: { label: string; value: string; onChange: (id: string) => void; plans: Plan[] }) {
  return (
    <div className="bg-bg-card px-4 py-3">
      <label className="mono mb-1 block text-[9px] font-semibold uppercase tracking-wider text-cal-gold/70">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border-input bg-bg-input px-2.5 py-1.5 text-[12px] font-medium text-text-primary focus:border-cal-gold/50 focus:outline-none"
      >
        {plans.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
    </div>
  )
}

function PlanColumn({ name, stats, side }: { name: string; stats: ReturnType<typeof usePlanStats>; side: 'left' | 'right' }) {
  return (
    <div className={`bg-bg-card px-5 py-4 ${side === 'left' ? '' : ''}`}>
      <h4 className="serif mb-3 text-[16px] font-light text-text-primary">{name}</h4>
      <div className="mb-4 grid grid-cols-3 gap-2">
        <Stat label="Classes" value={stats.classCount} />
        <Stat label="Units" value={stats.unitsTotal} />
        <Stat label="% done" value={`${stats.pct}%`} />
      </div>
      <div className="space-y-2">
        {stats.programs.length === 0 && <p className="text-[11px] italic text-text-muted">No programs selected</p>}
        {stats.programs.map((p) => {
          const ringColor = p.type === 'major' ? '#FDB515' : p.type === 'minor' ? '#3B7EA1' : '#859438'
          return (
            <div key={p.id} className="rounded-md border border-border bg-bg-input/40 px-2.5 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11.5px] font-medium text-text-primary truncate">{p.name}</span>
                <span className="mono text-[10.5px] font-semibold text-text-secondary">{p.sat}/{p.total}</span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border">
                <div className="h-full transition-all" style={{ width: `${p.total > 0 ? (p.sat / p.total) * 100 : 0}%`, background: ringColor }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border bg-bg-input/30 px-2 py-1.5">
      <div className="mono text-[8.5px] font-semibold uppercase tracking-wider text-cal-gold/70">{label}</div>
      <div className="mt-0.5 mono text-[15px] font-semibold tabular-nums text-text-primary">{value}</div>
    </div>
  )
}

function DiffStat({ label, left, right }: { label: string; left: number; right: number }) {
  const diff = right - left
  const sign = diff > 0 ? '+' : ''
  const color = diff > 0 ? 'text-soybean' : diff < 0 ? 'text-wellman' : 'text-text-muted'
  return (
    <div>
      <div className="mono text-[9px] font-semibold uppercase tracking-wider text-cal-gold/70">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-2">
        <span className="mono text-[14px] tabular-nums text-text-secondary">{left}</span>
        <span className="text-text-muted">→</span>
        <span className="mono text-[14px] tabular-nums text-text-secondary">{right}</span>
        <span className={`mono text-[12px] font-semibold tabular-nums ${color}`}>{sign}{diff}</span>
      </div>
    </div>
  )
}
