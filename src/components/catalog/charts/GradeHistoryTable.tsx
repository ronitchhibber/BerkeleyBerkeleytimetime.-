import { useState } from 'react'
import type { GradeRecord } from '@/types'

interface GradeHistoryTableProps {
  records: GradeRecord[]
}

type SortKey = 'semester' | 'instructor' | 'averageGPA' | 'totalEnrolled'

export default function GradeHistoryTable({ records }: GradeHistoryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('semester')
  const [sortAsc, setSortAsc] = useState(false)

  const sorted = [...records].sort((a, b) => {
    let cmp = 0
    switch (sortKey) {
      case 'semester': cmp = a.semester.localeCompare(b.semester); break
      case 'instructor': cmp = a.instructor.localeCompare(b.instructor); break
      case 'averageGPA': cmp = a.averageGPA - b.averageGPA; break
      case 'totalEnrolled': cmp = a.totalEnrolled - b.totalEnrolled; break
    }
    return sortAsc ? cmp : -cmp
  })

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(true) }
  }

  function pct(count: number, total: number) {
    return total > 0 ? `${Math.round((count / total) * 100)}%` : '—'
  }

  function gpaColor(gpa: number): string {
    if (gpa >= 3.7) return 'text-soybean'
    if (gpa >= 3.3) return 'text-cal-gold'
    if (gpa >= 2.7) return 'text-medalist'
    return 'text-wellman'
  }

  if (records.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-bg-card px-5 py-8 text-center">
        <p className="text-[13px] text-text-muted">No records match the selected filters</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border-strong bg-bg-card/60">
              <th onClick={() => handleSort('semester')}
                className="cursor-pointer px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-muted transition-colors hover:text-cal-gold">
                <span className="inline-flex items-center gap-1">
                  Semester {sortKey === 'semester' && <span className="text-cal-gold">{sortAsc ? '↑' : '↓'}</span>}
                </span>
              </th>
              <th onClick={() => handleSort('instructor')}
                className="cursor-pointer px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-text-muted transition-colors hover:text-cal-gold">
                <span className="inline-flex items-center gap-1">
                  Instructor {sortKey === 'instructor' && <span className="text-cal-gold">{sortAsc ? '↑' : '↓'}</span>}
                </span>
              </th>
              <th onClick={() => handleSort('averageGPA')}
                className="cursor-pointer px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-text-muted transition-colors hover:text-cal-gold">
                <span className="inline-flex items-center gap-1">
                  Avg GPA {sortKey === 'averageGPA' && <span className="text-cal-gold">{sortAsc ? '↑' : '↓'}</span>}
                </span>
              </th>
              {['A%', 'B%', 'C%', 'D%', 'F%', 'P%', 'NP%'].map((label) => (
                <th key={label} className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-text-muted">{label}</th>
              ))}
              <th onClick={() => handleSort('totalEnrolled')}
                className="cursor-pointer px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-text-muted transition-colors hover:text-cal-gold">
                <span className="inline-flex items-center gap-1">
                  Total {sortKey === 'totalEnrolled' && <span className="text-cal-gold">{sortAsc ? '↑' : '↓'}</span>}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((rec, i) => {
              const d = rec.distribution
              const aTotal = d.aPlus + d.a + d.aMinus
              const bTotal = d.bPlus + d.b + d.bMinus
              const cTotal = d.cPlus + d.c + d.cMinus
              const dTotal = d.dPlus + d.d + d.dMinus
              return (
                <tr key={i} className={`transition-colors hover:bg-bg-hover ${i !== sorted.length - 1 ? 'border-b border-border/60' : ''}`}>
                  <td className="px-3 py-2 font-medium text-text-primary">{rec.semester}</td>
                  <td className="px-3 py-2 text-text-secondary">{rec.instructor}</td>
                  <td className={`mono px-3 py-2 text-right font-bold ${gpaColor(rec.averageGPA)}`}>{rec.averageGPA.toFixed(2)}</td>
                  <td className="mono px-3 py-2 text-right text-text-secondary">{pct(aTotal, rec.totalEnrolled)}</td>
                  <td className="mono px-3 py-2 text-right text-text-secondary">{pct(bTotal, rec.totalEnrolled)}</td>
                  <td className="mono px-3 py-2 text-right text-text-secondary">{pct(cTotal, rec.totalEnrolled)}</td>
                  <td className="mono px-3 py-2 text-right text-text-secondary">{pct(dTotal, rec.totalEnrolled)}</td>
                  <td className="mono px-3 py-2 text-right text-text-secondary">{pct(d.f, rec.totalEnrolled)}</td>
                  <td className="mono px-3 py-2 text-right text-text-secondary">{pct(d.p, rec.totalEnrolled)}</td>
                  <td className="mono px-3 py-2 text-right text-text-secondary">{pct(d.np, rec.totalEnrolled)}</td>
                  <td className="mono px-3 py-2 text-right text-text-muted">{rec.totalEnrolled.toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
