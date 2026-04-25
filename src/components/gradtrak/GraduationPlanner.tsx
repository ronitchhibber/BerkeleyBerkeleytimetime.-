/**
 * Graduation Planner: given the user's remaining unsatisfied requirements
 * and remaining unit gap to 120, suggests how to spread them across future
 * semesters at a reasonable load (12-16 units/sem).
 *
 * Per the user's spec: recommends REQUIREMENTS (not specific classes), since
 * we don't know which classes will be offered in future terms.
 */
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useGradtrakStore } from '@/stores/gradtrakStore'
import { useCourseIndex } from '@/hooks/useCourseIndex'
import { evaluateProgram } from '@/utils/requirementMatcher'
import { buildPlanPathPrompt, copyToClipboard } from '@/utils/llmPrompts'
import { totalUnits as sumUnits } from '@/utils/courseLookup'

const TERM_ORDER = ['Spring', 'Summer', 'Fall'] as const
const NEXT_TERMS: { term: 'Fall' | 'Spring' | 'Summer'; year: number }[] = []
{
  // Generate the next 6 academic terms starting from current
  const now = new Date()
  let y = now.getFullYear()
  let monthIdx = now.getMonth() // 0-11
  // Determine which term we're in
  let currentTermIdx = monthIdx <= 4 ? 0 : monthIdx <= 7 ? 1 : 2
  for (let i = 0; i < 9; i++) {
    NEXT_TERMS.push({ term: TERM_ORDER[currentTermIdx], year: y })
    currentTermIdx = (currentTermIdx + 1) % 3
    if (currentTermIdx === 0) y++
  }
}

export default function GraduationPlanner({ onClose }: { onClose: () => void }) {
  const programs = useGradtrakStore((s) => s.programs)
  const selectedIds = useGradtrakStore((s) => s.selectedProgramIds)
  const semesters = useGradtrakStore((s) => s.semesters)
  const overrides = useGradtrakStore((s) => s.manualOverrides)
  const index = useCourseIndex()

  const [targetUnitsPerSem, setTargetUnitsPerSem] = useState(14)
  const [includeSummer, setIncludeSummer] = useState(false)

  const taken = useMemo(() => semesters.flatMap((s) => s.courseCodes), [semesters])
  const totalUnitsTaken = useMemo(() => sumUnits(taken, index), [taken, index])

  const remaining = useMemo(() => {
    const selectedPrograms = programs.filter((p) => selectedIds.includes(p.id))
    const reqsLeft: { programName: string; programType: string; groupName: string; reqName: string; estUnits: number; programId: string; reqId: string }[] = []

    for (const p of selectedPrograms) {
      const progress = evaluateProgram(p, taken, index)
      for (const g of progress.groups) {
        const programGroup = p.groups.find((pg) => pg.id === g.groupId)
        if (!programGroup) continue
        for (const r of g.requirements) {
          const overrideKey = `${p.id}:${r.requirementId}`
          if (r.satisfied || overrides[overrideKey]) continue
          const programReq = programGroup.requirements.find((pr) => pr.id === r.requirementId)
          if (!programReq) continue
          // Estimate units to add: from rule type
          let estUnits = 4
          if (programReq.rule.type === 'units') estUnits = programReq.rule.units
          else if (programReq.rule.type === 'total-units') estUnits = 0 // already counted
          else if (programReq.rule.type === 'senior-residence') estUnits = 0
          reqsLeft.push({
            programName: p.name,
            programType: p.type,
            groupName: programGroup.name,
            reqName: programReq.name,
            estUnits,
            programId: p.id,
            reqId: programReq.id,
          })
        }
      }
    }
    return reqsLeft
  }, [programs, selectedIds, taken, index, overrides])

  const futureTerms = includeSummer
    ? NEXT_TERMS.slice(0, 9)
    : NEXT_TERMS.filter((t) => t.term !== 'Summer').slice(0, 6)

  // Greedy assignment: distribute requirements across future terms within unit cap
  const plan = useMemo(() => {
    const buckets: { term: string; year: number; reqs: typeof remaining; units: number }[] =
      futureTerms.map((t) => ({ term: t.term, year: t.year, reqs: [], units: 0 }))

    let bucketIdx = 0
    for (const req of remaining) {
      // Find the next bucket that has room
      let attempts = 0
      while (attempts < buckets.length && buckets[bucketIdx].units + req.estUnits > targetUnitsPerSem) {
        bucketIdx = (bucketIdx + 1) % buckets.length
        attempts++
      }
      if (attempts >= buckets.length) {
        // No bucket has room — overflow into bucketIdx anyway
      }
      buckets[bucketIdx].reqs.push(req)
      buckets[bucketIdx].units += req.estUnits
      bucketIdx = (bucketIdx + 1) % buckets.length
    }

    return buckets
  }, [remaining, futureTerms, targetUnitsPerSem])

  const unitsToGraduate = Math.max(0, 120 - totalUnitsTaken)
  const semestersNeeded = Math.ceil(unitsToGraduate / targetUnitsPerSem)

  return createPortal((
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-[min(100%-1rem,920px)] flex-col overflow-hidden rounded-2xl border border-cal-gold/20 bg-bg-elevated shadow-2xl"
      >
        <div className="border-b border-border bg-berkeley-blue/30 px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="mono text-[9.5px] font-semibold uppercase tracking-[0.22em] text-cal-gold/85">
                Path Planner
              </div>
              <h3 className="serif mt-1 text-[24px] font-light text-text-primary">
                Your <span className="serif-italic text-cal-gold">remaining</span> path
              </h3>
              <p className="mt-1 text-[12px] text-text-muted">
                Suggested distribution of <span className="text-text-primary">{remaining.length}</span> remaining requirements across upcoming semesters.
              </p>
            </div>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-bg-hover hover:text-text-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-4 border-t border-border pt-4">
            <Stat label="Units done" value={totalUnitsTaken} suffix="/120" />
            <Stat label="Units left" value={unitsToGraduate} />
            <Stat label="Reqs left" value={remaining.length} />
            <Stat label="Sem needed" value={semestersNeeded} />
          </div>
        </div>

        <div className="border-b border-border bg-bg-card/40 px-6 py-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-text-muted">Target units/sem:</label>
              <input
                type="range" min="10" max="20" step="1"
                value={targetUnitsPerSem}
                onChange={(e) => setTargetUnitsPerSem(parseInt(e.target.value))}
                className="w-24"
              />
              <span className="mono w-7 text-[12px] font-semibold text-cal-gold">{targetUnitsPerSem}</span>
            </div>
            <label className="flex items-center gap-1.5 text-[11px] text-text-muted">
              <input type="checkbox" checked={includeSummer} onChange={(e) => setIncludeSummer(e.target.checked)} />
              include Summer
            </label>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {remaining.length === 0 ? (
            <div className="rounded-lg border border-soybean/30 bg-soybean/5 px-6 py-10 text-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-2 text-soybean">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <p className="serif text-[18px] font-light text-text-primary">All requirements satisfied</p>
              <p className="mt-1 text-[12px] text-text-muted">You're set to graduate with your selected programs!</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {plan.map((bucket) => bucket.reqs.length > 0 && (
                <div key={`${bucket.term}-${bucket.year}`} className="rounded-lg border border-border bg-bg-card overflow-hidden">
                  <div className={`flex items-center justify-between border-b border-border px-4 py-2.5 ${
                    bucket.term === 'Fall' ? 'bg-medalist/[0.05]' : bucket.term === 'Spring' ? 'bg-soybean/[0.05]' : 'bg-cal-gold/[0.05]'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`mono text-[10px] font-bold uppercase tracking-wider ${
                        bucket.term === 'Fall' ? 'text-medalist' : bucket.term === 'Spring' ? 'text-soybean' : 'text-cal-gold'
                      }`}>{bucket.term} '{String(bucket.year).slice(-2)}</span>
                    </div>
                    <span className="mono text-[10px] text-text-muted">~{bucket.units}u</span>
                  </div>
                  <div className="divide-y divide-border">
                    {bucket.reqs.map((r) => (
                      <div key={`${r.programId}-${r.reqId}`} className="px-4 py-2.5">
                        <div className="text-[12px] font-medium text-text-primary">{r.reqName}</div>
                        <div className="mt-0.5 flex items-center gap-2 text-[10px] text-text-muted">
                          <span className={`mono uppercase tracking-wider ${r.programType === 'major' ? 'text-cal-gold/70' : r.programType === 'minor' ? 'text-founders-rock/70' : 'text-soybean/70'}`}>{r.programType}</span>
                          <span>·</span>
                          <span className="truncate">{r.programName}</span>
                          {r.estUnits > 0 && (
                            <>
                              <span>·</span>
                              <span className="mono">~{r.estUnits}u</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <AskClaudeBlock />
          <p className="mt-4 text-center text-[10.5px] text-text-muted">
            Click any requirement in the audit panel to see eligible courses → click those to check historical offerings.
          </p>
        </div>
      </div>
    </div>
  ), document.body)
}

function AskClaudeBlock() {
  const [copied, setCopied] = useState(false)
  const plans = useGradtrakStore((s) => s.plans)
  const activeId = useGradtrakStore((s) => s.activePlanId)
  const programs = useGradtrakStore((s) => s.programs)
  const index = useCourseIndex()
  const plan = plans.find((p) => p.id === activeId) || plans[0]
  if (!plan) return null

  const handleCopy = async () => {
    const prompt = buildPlanPathPrompt({ plan, programs, index })
    const ok = await copyToClipboard(prompt)
    if (!ok) {
      window.prompt('Copy this prompt and paste into Claude:', prompt)
    } else {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  return (
    <div className="mt-5 rounded-lg border border-founders-rock/25 bg-founders-rock/[0.05] p-3.5">
      <div className="flex items-start gap-2.5">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-founders-rock">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium text-text-primary">Want a second opinion from Claude?</p>
          <p className="mt-0.5 text-[10.5px] text-text-muted">
            Copy a context-rich prompt with your plan + remaining reqs. Paste into <a href="https://claude.ai" target="_blank" rel="noreferrer" className="text-founders-rock hover:underline">claude.ai</a> for a personalized planning conversation.
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="shrink-0 rounded-md border border-founders-rock/40 bg-founders-rock/10 px-3 py-1.5 text-[11px] font-semibold text-founders-rock transition-all hover:border-founders-rock hover:bg-founders-rock/20"
        >
          {copied ? '✓ Copied' : 'Copy prompt'}
        </button>
      </div>
    </div>
  )
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div>
      <div className="mono text-[9px] font-semibold uppercase tracking-wider text-cal-gold/70">{label}</div>
      <div className="mt-0.5 mono tabular-nums text-[20px] font-semibold text-text-primary">
        {value}{suffix && <span className="text-[12px] text-text-muted">{suffix}</span>}
      </div>
    </div>
  )
}
