import { useEffect, useMemo, useState, useRef, lazy, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { useGradtrakStore } from '@/stores/gradtrakStore'
import { useDataStore } from '@/stores/dataStore'
import { useAllCoursesStore } from '@/stores/allCoursesStore'
import { evaluateProgram, requirementsCourseCouldSatisfy } from '@/utils/requirementMatcher'
import { buildShareUrl, decodePlan, exportCsv, downloadCsv } from '@/utils/planExport'
import { parseCalCentralPaste } from '@/utils/calcentralImport'
import { lookupCourse, totalUnits as sumUnits } from '@/utils/courseLookup'
import ProgramSelector from '@/components/gradtrak/ProgramSelector'
import SemesterBlock from '@/components/gradtrak/SemesterBlock'
import AddSemesterButton from '@/components/gradtrak/AddSemesterButton'
import ProgramProgressView from '@/components/gradtrak/ProgramProgressView'
const PlanDiff = lazy(() => import('@/components/gradtrak/PlanDiff'))
const GraduationPlanner = lazy(() => import('@/components/gradtrak/GraduationPlanner'))

export default function GradtrakPage() {
  const loadData = useDataStore((s) => s.loadData)
  const isLoading = useDataStore((s) => s.isLoading)
  const allCourses = useDataStore((s) => s.courses)
  const catalogCourses = useAllCoursesStore((s) => s.courses)
  const loadPrograms = useGradtrakStore((s) => s.loadPrograms)
  const loadAllCourses = useAllCoursesStore((s) => s.loadCourses)
  const semesters = useGradtrakStore((s) => s.semesters)
  const programs = useGradtrakStore((s) => s.programs)
  const selectedProgramIds = useGradtrakStore((s) => s.selectedProgramIds)
  const overrides = useGradtrakStore((s) => s.manualOverrides)
  const clearAll = useGradtrakStore((s) => s.clearAll)

  useEffect(() => {
    loadData()
    loadPrograms()
    loadAllCourses()

    // Import shared plan from URL hash on mount
    const hash = window.location.hash
    if (hash.startsWith('#plan=')) {
      const encoded = hash.slice('#plan='.length)
      const plan = decodePlan(encoded)
      if (plan && confirm(`Import shared plan? (${plan.programs.length} programs, ${plan.semesters.length} semesters)`)) {
        useGradtrakStore.setState({
          selectedProgramIds: plan.programs,
          semesters: plan.semesters.map((s) => ({
            id: crypto.randomUUID(),
            term: s.t as 'Fall' | 'Spring' | 'Summer',
            year: s.y,
            courseCodes: s.c,
          })),
          manualOverrides: plan.overrides || {},
        })
        history.replaceState(null, '', window.location.pathname)
      }
    }
  }, [loadData, loadPrograms, loadAllCourses])

  const stats = useMemo(() => {
    const takenCodes = semesters.flatMap((s) => s.courseCodes)
    const totalUnits = sumUnits(takenCodes, allCourses, catalogCourses)
    const selected = programs.filter((p) => selectedProgramIds.includes(p.id))
    let totalReqs = 0
    let satReqs = 0
    selected.forEach((p) => {
      const raw = evaluateProgram(p, takenCodes, allCourses, catalogCourses)
      raw.groups.forEach((g) => {
        g.requirements.forEach((r) => {
          totalReqs++
          const overrideKey = `${p.id}:${r.requirementId}`
          if (r.satisfied || overrides[overrideKey]) satReqs++
        })
      })
    })
    const overallPct = totalReqs > 0 ? Math.round((satReqs / totalReqs) * 100) : 0
    return {
      classes: takenCodes.length,
      units: totalUnits,
      programs: selected.length,
      satReqs,
      totalReqs,
      overallPct,
    }
  }, [semesters, allCourses, catalogCourses, programs, selectedProgramIds, overrides])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full border-2 border-cal-gold/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cal-gold" />
          </div>
          <p className="serif text-[14px] italic text-text-muted">Preparing your degree audit…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-bg-primary lg:flex-row">
      {/* SIDEBAR */}
      <aside className="relative flex h-auto w-full shrink-0 flex-col overflow-hidden border-b border-border lg:h-full lg:w-[340px] lg:border-b-0 lg:border-r">
        {/* Decorative gold rule on right edge */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-cal-gold/20 to-transparent" />

        {/* Berkeley Crest header */}
        <div className="relative overflow-hidden border-b border-cal-gold/15 bg-berkeley-blue/30 px-6 pb-7 pt-7 parchment">
          <div className="berkeley-dots pointer-events-none absolute inset-0 opacity-20" />
          <div className="relative">
            <div className="mb-4 flex items-center gap-2.5">
              <svg width="22" height="22" viewBox="0 0 24 24" className="text-cal-gold">
                <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
                <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.6" />
                <path d="M12 4 L13.2 8 L17.2 8 L14 10.4 L15.2 14.4 L12 12 L8.8 14.4 L10 10.4 L6.8 8 L10.8 8 Z" fill="currentColor" />
              </svg>
              <div className="flex-1">
                <div className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-cal-gold/85">
                  University of California
                </div>
                <div className="mono text-[10px] font-semibold tracking-[0.32em] text-text-muted">
                  BERKELEY · EST 1868
                </div>
              </div>
            </div>

            <h2 className="serif text-[34px] font-light leading-none text-text-primary">
              Grad<span className="serif-italic font-normal text-cal-gold">trak</span>
            </h2>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="h-px w-8 bg-cal-gold/60" />
              <span className="mono text-[9.5px] uppercase tracking-[0.2em] text-text-muted">
                Degree Audit
              </span>
            </div>

            <PlanSwitcher />
          </div>
        </div>

        {/* Program selector */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <ProgramSelector />
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-bg-card/40 px-6 py-5">
          <div className="mb-3.5 flex items-start gap-2.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 shrink-0 text-cal-gold/60">
              <path d="M12 2 L2 7 L12 12 L22 7 L12 2 Z" />
              <path d="M2 17 L12 22 L22 17" />
              <path d="M2 12 L12 17 L22 12" />
            </svg>
            <p className="text-[11px] leading-relaxed text-text-muted">
              Track progress across majors, minors, and college requirements. Saved locally to your browser.
            </p>
          </div>
          <ExportMenu />
          <CalCentralImportButton />
          <button
            onClick={() => {
              if (confirm('Reset all semesters and program selections?')) clearAll()
            }}
            className="group mt-2 flex w-full items-center justify-between rounded-md border border-border-strong/50 bg-transparent px-3 py-2 text-[11px] font-medium text-text-muted transition-all hover:border-wellman/40 hover:bg-wellman/5 hover:text-wellman"
          >
            <span className="flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              Reset planner
            </span>
            <span className="mono text-[9.5px] uppercase tracking-wider opacity-60">⌘R</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="relative flex-1 overflow-y-auto">
        {/* Top decorative bar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-cal-gold/40 to-transparent" />

        <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 md:px-12 md:pt-12">
          {/* HERO */}
          <header className="animate-rise relative mb-12">
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-10 bg-cal-gold" />
              <span className="mono text-[10px] font-semibold uppercase tracking-[0.32em] text-cal-gold/85">
                Section 01 · Degree Planner
              </span>
              <span className="text-text-muted">/</span>
              <span className="text-[11px] text-text-muted">Spring 2026 Term</span>
            </div>

            <div className="grid grid-cols-12 gap-10">
              <div className="col-span-12 lg:col-span-7">
                <h1 className="serif text-[36px] md:text-[48px] lg:text-[60px] font-light leading-[1.08] tracking-tight text-text-primary">
                  Map your<br />
                  <span className="serif-italic font-normal">path to</span>{' '}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-cal-gold">graduation</span>
                    <span className="absolute -bottom-2 left-0 right-0 h-[3px] origin-left bg-cal-gold/30 animate-draw-line" style={{ animationDelay: '0.4s' }} />
                  </span>.
                </h1>
                <p className="mt-8 max-w-xl text-[14.5px] leading-relaxed text-text-secondary">
                  A living degree audit. Add semesters, log your classes, and watch
                  requirements check themselves off across <span className="text-text-primary font-medium">{programs.length}</span> Berkeley programs.
                </p>
              </div>

              {/* Right side — stat ring */}
              <div className="col-span-12 lg:col-span-5 flex flex-col items-center justify-center gap-4 lg:items-end lg:justify-end">
                <ProgressRing pct={stats.overallPct} satReqs={stats.satReqs} totalReqs={stats.totalReqs} />
                <PathPlannerButton />
              </div>
            </div>

            {/* Stat strip */}
            <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-4 border-y border-border py-5 md:grid-cols-4">
              <Stat label="Programs" value={stats.programs} hint={`of ${programs.length} at Berkeley`} />
              <Stat label="Semesters" value={semesters.length} hint={`spanning your career`} />
              <Stat label="Classes" value={stats.classes} hint={`courses logged`} />
              <Stat label="Units" value={stats.units} hint={`120 needed to graduate`} />
            </div>
          </header>

          {/* TWO COLUMNS */}
          <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            {/* SEMESTERS */}
            <section className="animate-rise" style={{ animationDelay: '0.05s' }}>
              <SectionHeading
                kicker="Section 02"
                title="My Path"
                subtitle="Each semester, every class — your transcript-in-progress."
              />

              <div className="space-y-3.5">
                {semesters.length === 0 ? (
                  <EmptySemesters />
                ) : (
                  semesters.map((sem) => <SemesterBlock key={sem.id} semester={sem} />)
                )}
                <AddSemesterButton />
              </div>

              <UnmatchedCoursesPanel />
            </section>

            {/* PROGRESS */}
            <section className="animate-rise" style={{ animationDelay: '0.1s' }}>
              <SectionHeading
                kicker="Section 03"
                title="Degree Progress"
                subtitle="Real-time audit against catalog requirements."
              />
              <ProgramProgressView />
            </section>
          </div>

          {/* Footer ornament */}
          <div className="mt-20 flex items-center justify-center gap-3 opacity-60">
            <span className="h-px w-16 bg-border-strong" />
            <svg width="14" height="14" viewBox="0 0 24 24" className="text-cal-gold/60">
              <path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" fill="currentColor" />
            </svg>
            <span className="h-px w-16 bg-border-strong" />
          </div>
          <p className="mt-3 text-center text-[10px] uppercase tracking-[0.32em] text-text-muted">
            Fiat Lux · Let There Be Light
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────── Subcomponents ─────────────────────── */

function Stat({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="group">
      <div className="mb-1 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-cal-gold/70">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="serif text-[32px] font-light leading-none text-text-primary tabular-nums">
          {value}
        </div>
      </div>
      <div className="mt-1 text-[10.5px] text-text-muted">{hint}</div>
    </div>
  )
}

function ProgressRing({ pct, satReqs, totalReqs }: { pct: number; satReqs: number; totalReqs: number }) {
  const radius = 78
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="relative">
      {/* outer decorative ring */}
      <div className="absolute -inset-3 rounded-full border border-cal-gold/10" />
      <div className="absolute -inset-6 rounded-full border border-cal-gold/5" />

      <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90 transform">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDB515" />
            <stop offset="100%" stopColor="#C4820E" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(253, 181, 21, 0.08)" strokeWidth="3" />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.2, 0.7, 0.2, 1)' }}
        />
        {/* tick marks */}
        {Array.from({ length: 60 }, (_, i) => {
          const angle = (i / 60) * 360
          const isMajor = i % 5 === 0
          return (
            <line
              key={i}
              x1="100"
              y1={isMajor ? 8 : 12}
              x2="100"
              y2={isMajor ? 14 : 14}
              stroke="rgba(253, 181, 21, 0.3)"
              strokeWidth={isMajor ? 1 : 0.5}
              transform={`rotate(${angle} 100 100)`}
            />
          )
        })}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="mono text-[9px] font-semibold uppercase tracking-[0.2em] text-cal-gold/70">
          Overall
        </div>
        <div className="serif text-[52px] font-light leading-none text-text-primary tabular-nums">
          {pct}<span className="text-[26px] text-cal-gold">%</span>
        </div>
        <div className="mt-1 text-[10.5px] text-text-muted">
          <span className="mono text-text-secondary">{satReqs}</span> / <span className="mono">{totalReqs}</span> reqs
        </div>
      </div>
    </div>
  )
}

function SectionHeading({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
  return (
    <div className="mb-6 border-b border-border pb-4">
      <div className="mb-2 flex items-center gap-2.5">
        <span className="h-px w-6 bg-cal-gold/60" />
        <span className="mono text-[9.5px] font-semibold uppercase tracking-[0.28em] text-cal-gold/80">
          {kicker}
        </span>
      </div>
      <h2 className="serif text-[26px] font-light leading-tight text-text-primary">
        {title}
      </h2>
      <p className="mt-1 text-[12.5px] text-text-muted">{subtitle}</p>
    </div>
  )
}

/**
 * Path planner trigger: opens the GraduationPlanner modal which spreads
 * remaining requirements across upcoming semesters.
 */
function PathPlannerButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border border-cal-gold/40 bg-cal-gold/[0.06] px-3.5 py-2 text-[11.5px] font-semibold text-cal-gold transition-all hover:border-cal-gold hover:bg-cal-gold/15"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        Plan my path →
      </button>
      {open && (
        <Suspense fallback={null}>
          <GraduationPlanner onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  )
}

/**
 * CalCentral paste-import: opens a modal where the user pastes their
 * CalCentral "My Academics" page (Cmd-A Cmd-C). We parse out semester
 * headers + course codes and merge them into the active plan.
 */
function CalCentralImportButton() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [preview, setPreview] = useState<ReturnType<typeof parseCalCentralPaste>>([])
  const addSemester = useGradtrakStore((s) => s.addSemester)
  const addCourse = useGradtrakStore((s) => s.addCourseToSemester)
  const semesters = useGradtrakStore((s) => s.semesters)

  const handleParse = (input: string) => {
    setText(input)
    setPreview(parseCalCentralPaste(input))
  }

  const handleImport = () => {
    for (const sem of preview) {
      let existing = semesters.find((s) => s.term === sem.term && s.year === sem.year)
      if (!existing) {
        addSemester(sem.term, sem.year)
        // After addSemester, useGradtrakStore.getState() now has the new semester
        existing = useGradtrakStore.getState().semesters.find((s) => s.term === sem.term && s.year === sem.year)
      }
      if (!existing) continue
      for (const code of sem.courseCodes) addCourse(existing.id, code)
    }
    setOpen(false)
    setText('')
    setPreview([])
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-cal-gold/25 bg-cal-gold/5 px-2 py-2 text-[11px] font-medium text-cal-gold transition-all hover:border-cal-gold/50 hover:bg-cal-gold/10"
        title="Paste from CalCentral My Academics"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="2" width="6" height="4" rx="1" />
          <path d="M9 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-4" />
        </svg>
        Import from CalCentral
      </button>
      {open && createPortal((
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="flex max-h-[85vh] w-[min(100%-1rem,640px)] flex-col overflow-hidden rounded-2xl border border-cal-gold/20 bg-bg-elevated shadow-2xl">
            <div className="border-b border-border bg-berkeley-blue/30 px-6 py-5">
              <div className="mono text-[9.5px] font-semibold uppercase tracking-[0.22em] text-cal-gold/85">
                Berkeley CalCentral
              </div>
              <h3 className="serif mt-1 text-[22px] font-light text-text-primary">
                Import from <span className="serif-italic text-cal-gold">My Academics</span>
              </h3>
              <p className="mt-1 text-[11.5px] text-text-muted">
                Open <span className="text-cal-gold">calcentral.berkeley.edu → My Academics → Past Enrollments</span>, select all (⌘A), copy (⌘C), paste below.
              </p>
            </div>
            <div className="flex-1 overflow-hidden p-5">
              <textarea
                value={text}
                onChange={(e) => handleParse(e.target.value)}
                placeholder="Paste your CalCentral text here…"
                autoFocus
                className="h-44 w-full resize-none rounded-md border border-border-input bg-bg-input p-3 mono text-[11px] text-text-primary placeholder-text-placeholder focus:border-cal-gold/50 focus:outline-none"
              />
              {preview.length > 0 && (
                <div className="mt-4 max-h-[280px] overflow-y-auto rounded-md border border-cal-gold/20 bg-bg-card/40 p-3">
                  <div className="mono mb-2 text-[10px] font-semibold uppercase tracking-wider text-cal-gold/80">
                    Detected: {preview.reduce((a, s) => a + s.courseCodes.length, 0)} courses across {preview.length} semester{preview.length !== 1 ? 's' : ''}
                  </div>
                  <div className="space-y-2">
                    {preview.map((s) => (
                      <div key={`${s.term}-${s.year}`}>
                        <div className="mono mb-0.5 text-[10.5px] font-semibold text-text-primary">{s.term} {s.year}</div>
                        <div className="flex flex-wrap gap-1">
                          {s.courseCodes.map((c) => (
                            <span key={c} className="mono rounded bg-bg-input px-1.5 py-0.5 text-[10px] text-cal-gold">{c}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-border bg-bg-card/40 px-5 py-3">
              <button onClick={() => setOpen(false)} className="text-[12px] text-text-muted hover:text-text-primary">
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={preview.length === 0}
                className="rounded-md bg-cal-gold px-4 py-1.5 text-[12px] font-semibold text-bg-primary transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Import {preview.reduce((a, s) => a + s.courseCodes.length, 0)} class{preview.reduce((a, s) => a + s.courseCodes.length, 0) !== 1 ? 'es' : ''}
              </button>
            </div>
          </div>
        </div>
      ), document.body)}
    </>
  )
}

/**
 * Plan switcher: lets the user have multiple gradtrak plans
 * (e.g. "Plan A: CS major" vs "Plan B: CS + DS minor") and toggle between
 * them to compare. Click to expand → list of plans + new/duplicate/rename.
 */
function PlanSwitcher() {
  const plans = useGradtrakStore((s) => s.plans)
  const activeId = useGradtrakStore((s) => s.activePlanId)
  const setActive = useGradtrakStore((s) => s.setActivePlan)
  const createPlan = useGradtrakStore((s) => s.createPlan)
  const renamePlan = useGradtrakStore((s) => s.renamePlan)
  const deletePlan = useGradtrakStore((s) => s.deletePlan)
  const duplicatePlan = useGradtrakStore((s) => s.duplicatePlan)
  const [open, setOpen] = useState(false)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [tempName, setTempName] = useState('')
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [showDiff, setShowDiff] = useState(false)
  const [menuRect, setMenuRect] = useState<{ top: number; left: number; width: number } | null>(null)
  const active = plans.find((p) => p.id === activeId) || plans[0]
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const target = e.target as Node
      if (ref.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    if (!open || !buttonRef.current) return
    const update = () => {
      const r = buttonRef.current?.getBoundingClientRect()
      if (r) setMenuRect({ top: r.bottom + 4, left: r.left, width: r.width })
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open])

  return (
    <div ref={ref} className="relative mt-4">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-md border border-cal-gold/20 bg-cal-gold/[0.04] px-2.5 py-1.5 text-left text-[11px] transition-all hover:border-cal-gold/40 hover:bg-cal-gold/10"
      >
        <span className="flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cal-gold">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          <span className="font-medium text-text-primary">{active?.name || 'My Plan'}</span>
          <span className="text-text-muted">·</span>
          <span className="mono text-[9px] text-text-muted">{plans.length} plan{plans.length !== 1 ? 's' : ''}</span>
        </span>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && menuRect && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: menuRect.top, left: menuRect.left, width: menuRect.width, zIndex: 100 }}
          className="overflow-hidden rounded-md border border-border-strong bg-bg-elevated shadow-2xl shadow-black/60">
          <div className="max-h-64 overflow-y-auto">
            {plans.map((p) => (
              <div key={p.id} className={`group/plan flex items-center justify-between px-2.5 py-1.5 ${p.id === activeId ? 'bg-cal-gold/10' : 'hover:bg-bg-hover'}`}>
                {renaming === p.id ? (
                  <input
                    autoFocus
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && tempName.trim()) { renamePlan(p.id, tempName.trim()); setRenaming(null) }
                      if (e.key === 'Escape') { setRenaming(null) }
                    }}
                    onBlur={() => { if (tempName.trim()) renamePlan(p.id, tempName.trim()); setRenaming(null) }}
                    className="flex-1 rounded border border-cal-gold/40 bg-bg-input px-1.5 py-0.5 text-[11px] text-text-primary focus:outline-none"
                  />
                ) : (
                  <button
                    onClick={() => { setActive(p.id); setOpen(false) }}
                    className="flex flex-1 items-center gap-2 text-left"
                  >
                    {p.id === activeId && (
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-cal-gold">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    <span className={`text-[11px] ${p.id === activeId ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>{p.name}</span>
                    <span className="mono text-[9px] text-text-muted">{p.semesters.reduce((a, s) => a + s.courseCodes.length, 0)} cls · {p.selectedProgramIds.length} prog</span>
                  </button>
                )}
                <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/plan:opacity-100">
                  <button onClick={() => { setRenaming(p.id); setTempName(p.name) }} title="Rename" className="flex h-5 w-5 items-center justify-center rounded text-text-muted hover:bg-bg-hover hover:text-text-primary">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                  <button onClick={() => duplicatePlan(p.id)} title="Duplicate" className="flex h-5 w-5 items-center justify-center rounded text-text-muted hover:bg-bg-hover hover:text-text-primary">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                  </button>
                  {plans.length > 1 && (
                    <button onClick={() => { if (confirm(`Delete "${p.name}"?`)) deletePlan(p.id) }} title="Delete" className="flex h-5 w-5 items-center justify-center rounded text-text-muted hover:bg-wellman/15 hover:text-wellman">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" /></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {creating ? (
            <div className="flex items-center gap-1 border-t border-border bg-bg-card/40 px-2 py-1.5">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newName.trim()) { createPlan(newName.trim()); setCreating(false); setNewName(''); setOpen(false) }
                  if (e.key === 'Escape') { setCreating(false); setNewName('') }
                }}
                placeholder={`Plan ${plans.length + 1}`}
                className="flex-1 rounded border border-cal-gold/40 bg-bg-input px-1.5 py-0.5 text-[11px] text-text-primary placeholder-text-muted focus:outline-none"
              />
              <button
                onClick={() => { if (newName.trim()) { createPlan(newName.trim()); setCreating(false); setNewName(''); setOpen(false) } }}
                className="mono rounded bg-cal-gold px-2 py-0.5 text-[10px] font-bold text-bg-primary"
              >Create</button>
              <button
                onClick={() => { setCreating(false); setNewName('') }}
                className="mono rounded px-1.5 py-0.5 text-[10px] text-text-muted hover:text-text-primary"
              >Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => { setCreating(true); setNewName(`Plan ${plans.length + 1}`) }}
              className="flex w-full items-center justify-center gap-1.5 border-t border-border bg-bg-card/40 px-2.5 py-2 text-[11px] font-semibold text-cal-gold transition-colors hover:bg-cal-gold/10"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New plan
            </button>
          )}
          {plans.length > 1 && (
            <button
              onClick={() => { setShowDiff(true); setOpen(false) }}
              className="flex w-full items-center justify-center gap-1.5 border-t border-border bg-bg-card/40 px-2.5 py-2 text-[11px] font-semibold text-founders-rock transition-colors hover:bg-founders-rock/10"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="18" /><rect x="14" y="3" width="7" height="18" />
              </svg>
              Compare plans
            </button>
          )}
        </div>,
        document.body
      )}
      {showDiff && (
        <Suspense fallback={null}>
          <PlanDiff onClose={() => setShowDiff(false)} />
        </Suspense>
      )}
    </div>
  )
}

/**
 * Share + Export menu in the sidebar footer. Generates a shareable URL
 * (state encoded in #plan= hash) and lets the user download a CSV transcript.
 */
function ExportMenu() {
  const [copied, setCopied] = useState(false)
  const semesters = useGradtrakStore((s) => s.semesters)
  const selectedIds = useGradtrakStore((s) => s.selectedProgramIds)
  const programs = useGradtrakStore((s) => s.programs)
  const overrides = useGradtrakStore((s) => s.manualOverrides)
  const allCourses = useDataStore((s) => s.courses)
  const catalogCourses = useAllCoursesStore((s) => s.courses)

  const handleShare = async () => {
    const url = buildShareUrl({
      selectedProgramIds: selectedIds,
      semesters,
      manualOverrides: overrides,
    })
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      prompt('Copy this URL:', url)
    }
  }

  const handleCsv = () => {
    const selectedPrograms = programs.filter((p) => selectedIds.includes(p.id))
    const csv = exportCsv({ semesters, selectedPrograms, allCourses, catalogCourses })
    const date = new Date().toISOString().slice(0, 10)
    downloadCsv(`gradtrak-${date}.csv`, csv)
  }

  return (
    <div className="grid grid-cols-2 gap-1.5">
      <button
        onClick={handleShare}
        className="flex items-center justify-center gap-1.5 rounded-md border border-cal-gold/25 bg-cal-gold/5 px-2 py-2 text-[11px] font-medium text-cal-gold transition-all hover:border-cal-gold/50 hover:bg-cal-gold/10"
        title="Copy a sharable link to this plan"
      >
        {copied ? (
          <>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            Copied
          </>
        ) : (
          <>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share link
          </>
        )}
      </button>
      <button
        onClick={handleCsv}
        className="flex items-center justify-center gap-1.5 rounded-md border border-cal-gold/25 bg-cal-gold/5 px-2 py-2 text-[11px] font-medium text-cal-gold transition-all hover:border-cal-gold/50 hover:bg-cal-gold/10"
        title="Download a CSV transcript of your plan"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export CSV
      </button>
    </div>
  )
}

/**
 * Surfaces taken classes that aren't satisfying ANY requirement across all
 * selected programs. Common reasons: cross-listed alternates, courses
 * outside the audit, manual overrides that displaced an auto-match.
 */
function UnmatchedCoursesPanel() {
  const semesters = useGradtrakStore((s) => s.semesters)
  const programs = useGradtrakStore((s) => s.programs)
  const selectedProgramIds = useGradtrakStore((s) => s.selectedProgramIds)
  const allCourses = useDataStore((s) => s.courses)
  const catalogCourses = useAllCoursesStore((s) => s.courses)

  const unmatched = useMemo(() => {
    const selected = programs.filter((p) => selectedProgramIds.includes(p.id))
    if (selected.length === 0) return []
    const taken = semesters.flatMap((s) => s.courseCodes)
    return taken.filter((code) => {
      const reqs = requirementsCourseCouldSatisfy(code, selected, allCourses, catalogCourses)
      return reqs.length === 0
    })
  }, [semesters, programs, selectedProgramIds, allCourses, catalogCourses])

  if (unmatched.length === 0) return null

  const lookup = (code: string) => lookupCourse(code, allCourses, catalogCourses)

  return (
    <div className="mt-6 rounded-xl border border-wellman/25 bg-wellman/[0.04] p-4">
      <div className="mb-3 flex items-center gap-2.5">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-wellman">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <h3 className="text-[12px] font-semibold text-wellman">
            {unmatched.length} class{unmatched.length !== 1 ? 'es' : ''} not counting toward any requirement
          </h3>
          <p className="text-[10.5px] text-text-muted">
            These may be free electives, or could need a manual assignment to a cross-listed equivalent.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {unmatched.map((code) => {
          const info = lookup(code)
          return (
            <div key={code} className="flex items-baseline justify-between gap-2 rounded border border-wellman/15 bg-bg-input/30 px-2.5 py-1.5">
              <div className="min-w-0 flex-1">
                <span className="mono text-[11px] font-semibold text-text-primary">{code}</span>
                {info && <span className="ml-2 truncate text-[10.5px] text-text-muted">{info.title}</span>}
              </div>
              {info && info.units > 0 && (
                <span className="mono shrink-0 text-[9.5px] text-cal-gold/70">{info.units}u</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EmptySemesters() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-border-strong bg-bg-card/30 px-7 py-10 text-center">
      <div className="berkeley-dots pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-cal-gold/30 bg-cal-gold/5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cal-gold">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <p className="serif text-[16px] font-light text-text-primary">No semesters yet</p>
        <p className="mt-1 text-[12px] text-text-muted">Add your first term below to begin planning</p>
      </div>
    </div>
  )
}
