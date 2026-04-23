import { useState, useMemo } from 'react'
import type { GradeRecord } from '@/types'
import Dropdown from '@/components/ui/Dropdown'
import GradeDistributionChart from '@/components/catalog/charts/GradeDistributionChart'
import GradeHistoryTable from '@/components/catalog/charts/GradeHistoryTable'

interface GradesTabProps {
  gradeHistory: GradeRecord[]
}

export default function GradesTab({ gradeHistory }: GradesTabProps) {
  const [selectedInstructor, setSelectedInstructor] = useState('all')
  const [selectedSemester, setSelectedSemester] = useState('all')

  const instructors = useMemo(() => {
    const set = new Set(gradeHistory.map((r) => r.instructor))
    return [{ value: 'all', label: 'All Instructors' }, ...[...set].map((i) => ({ value: i, label: i }))]
  }, [gradeHistory])

  const semesters = useMemo(() => {
    const set = new Set(gradeHistory.map((r) => r.semester))
    return [{ value: 'all', label: 'All Semesters' }, ...[...set].map((s) => ({ value: s, label: s }))]
  }, [gradeHistory])

  const filteredRecords = useMemo(() => {
    return gradeHistory.filter((r) => {
      if (selectedInstructor !== 'all' && r.instructor !== selectedInstructor) return false
      if (selectedSemester !== 'all' && r.semester !== selectedSemester) return false
      return true
    })
  }, [gradeHistory, selectedInstructor, selectedSemester])

  const aggregatedDistribution = useMemo(() => {
    if (filteredRecords.length === 0) return null
    const totals = { aPlus: 0, a: 0, aMinus: 0, bPlus: 0, b: 0, bMinus: 0, cPlus: 0, c: 0, cMinus: 0, dPlus: 0, d: 0, dMinus: 0, f: 0, p: 0, np: 0 }
    let totalEnrolled = 0
    for (const rec of filteredRecords) {
      for (const key of Object.keys(totals) as (keyof typeof totals)[]) {
        totals[key] += rec.distribution[key]
      }
      totalEnrolled += rec.totalEnrolled
    }
    return { distribution: totals, totalEnrolled }
  }, [filteredRecords])

  if (gradeHistory.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center px-8">
        <p className="text-[13px] text-text-muted">No grade data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-7 py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-[16px] font-semibold text-text-primary">Grade Distribution</h3>
          <p className="mt-1 text-[12.5px] text-text-secondary">
            {selectedInstructor === 'all' ? 'All instructors' : selectedInstructor}
            {' · '}
            {selectedSemester === 'all' ? 'All semesters' : selectedSemester}
            {' · '}
            <span className="text-text-primary">{aggregatedDistribution?.totalEnrolled.toLocaleString()} students</span>
          </p>
        </div>

        <div className="flex gap-3">
          <div className="w-44">
            <Dropdown label="Instructor" value={selectedInstructor} options={instructors} onChange={setSelectedInstructor} />
          </div>
          <div className="w-44">
            <Dropdown label="Semester" value={selectedSemester} options={semesters} onChange={setSelectedSemester} />
          </div>
        </div>
      </div>

      {aggregatedDistribution && (
        <div className="rounded-lg border border-border bg-bg-card p-4">
          <GradeDistributionChart
            distribution={aggregatedDistribution.distribution}
            totalEnrolled={aggregatedDistribution.totalEnrolled}
          />
        </div>
      )}

      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-[16px] font-semibold text-text-primary">Historical Records</h3>
          <span className="text-[12px] text-text-muted">{filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}</span>
        </div>
        <GradeHistoryTable records={filteredRecords} />
      </div>
    </div>
  )
}
