import { useState } from 'react'
import type { Section } from '@/types'
import { formatSchedule } from '@/utils/timeUtils'

interface SectionsTabProps {
  sections: Section[]
}

type SortKey = 'sectionNumber' | 'time' | 'location' | 'instructor' | 'enrolled' | 'waitlist' | 'status'

export default function SectionsTab({ sections }: SectionsTabProps) {
  const [sortKey, setSortKey] = useState<SortKey>('sectionNumber')
  const [sortAsc, setSortAsc] = useState(true)

  const sorted = [...sections].sort((a, b) => {
    let cmp = 0
    switch (sortKey) {
      case 'sectionNumber': cmp = a.sectionNumber.localeCompare(b.sectionNumber); break
      case 'time': cmp = a.startTime.localeCompare(b.startTime); break
      case 'location': cmp = a.location.localeCompare(b.location); break
      case 'instructor': cmp = a.instructor.localeCompare(b.instructor); break
      case 'enrolled': cmp = (a.capacity > 0 ? a.enrolledCount / a.capacity : 0) - (b.capacity > 0 ? b.enrolledCount / b.capacity : 0); break
      case 'waitlist': cmp = a.waitlistCount - b.waitlistCount; break
      case 'status': cmp = a.status.localeCompare(b.status); break
    }
    return sortAsc ? cmp : -cmp
  })

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(true) }
  }

  const headers: { key: SortKey; label: string; align?: 'right' }[] = [
    { key: 'sectionNumber', label: 'Section' },
    { key: 'time', label: 'Time' },
    { key: 'location', label: 'Location' },
    { key: 'instructor', label: 'Instructor' },
    { key: 'enrolled', label: 'Enrolled', align: 'right' },
    { key: 'waitlist', label: 'WL', align: 'right' },
    { key: 'status', label: 'Status' },
  ]

  if (sections.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center px-8">
        <p className="text-[13px] text-text-muted">No additional sections</p>
      </div>
    )
  }

  return (
    <div className="px-7 py-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-[16px] font-semibold text-text-primary">Discussion &amp; Lab Sections</h3>
        <span className="text-[12px] text-text-muted">{sections.length} sections</span>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-border bg-bg-card">
              {headers.map((h) => (
                <th key={h.key} onClick={() => handleSort(h.key)}
                  className={`cursor-pointer px-3 py-2.5 text-[11px] font-semibold text-text-secondary transition-colors hover:text-text-primary ${h.align === 'right' ? 'text-right' : 'text-left'}`}>
                  <span className="inline-flex items-center gap-1">
                    {h.label}
                    {sortKey === h.key && <span className="text-accent-blue">{sortAsc ? '↑' : '↓'}</span>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((sec, i) => {
              const fillRate = sec.capacity > 0 ? sec.enrolledCount / sec.capacity : 0
              const enrollColor = fillRate > 0.8 ? 'text-accent-red' : fillRate > 0.5 ? 'text-accent-orange' : 'text-accent-green'
              const statusColor = sec.status === 'open' ? 'text-accent-green' : sec.status === 'waitlist' ? 'text-accent-orange' : 'text-accent-red'
              const hasSchedule = sec.days.length > 0 && sec.startTime !== '00:00'

              return (
                <tr key={sec.sectionNumber} className={`transition-colors hover:bg-bg-hover ${i !== sorted.length - 1 ? 'border-b border-border' : ''}`}>
                  <td className="px-3 py-2.5 font-semibold text-text-primary">{sec.sectionNumber}</td>
                  <td className="px-3 py-2.5 text-text-secondary">
                    {hasSchedule ? formatSchedule(sec.days, sec.startTime, sec.endTime) : <span className="text-text-muted">TBA</span>}
                  </td>
                  <td className="px-3 py-2.5 text-text-secondary">{sec.location || 'TBA'}</td>
                  <td className="px-3 py-2.5 text-text-secondary">{sec.instructor}</td>
                  <td className={`mono px-3 py-2.5 text-right font-semibold ${enrollColor}`}>{sec.enrolledCount}/{sec.capacity}</td>
                  <td className="mono px-3 py-2.5 text-right text-text-muted">{sec.waitlistCount}</td>
                  <td className={`px-3 py-2.5 font-semibold capitalize ${statusColor}`}>{sec.status}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
