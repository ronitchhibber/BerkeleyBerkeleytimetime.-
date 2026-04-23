import type { ReactNode } from 'react'
import { useState } from 'react'
import { useCatalogStore } from '@/stores/catalogStore'

interface ThreeColumnLayoutProps {
  left: ReactNode
  center: ReactNode
  right: ReactNode
}

export default function ThreeColumnLayout({ left, center, right }: ThreeColumnLayoutProps) {
  const [showFilters, setShowFilters] = useState(false)
  const selectedCourseId = useCatalogStore((s) => s.selectedCourseId)
  const selectCourse = useCatalogStore((s) => s.selectCourse)
  const showDetail = !!selectedCourseId

  return (
    <div className="flex h-full overflow-hidden bg-bg-primary">
      {/* Left: filters — drawer on mobile, fixed column on lg+ */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex h-full w-[300px] flex-col overflow-y-auto overflow-x-hidden border-r border-border bg-bg-primary px-6 py-6 transition-transform lg:static lg:z-auto lg:w-[280px] ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {left}
      </aside>
      {showFilters && (
        <button
          aria-label="Close filters"
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}

      {/* Center: list — full width on mobile until detail open, fixed on lg */}
      <div className={`flex h-full w-full shrink-0 flex-col overflow-y-auto overflow-x-hidden border-r border-border lg:w-[400px] ${showDetail ? 'hidden md:flex' : 'flex'}`}>
        {/* Mobile filters toggle */}
        <button
          onClick={() => setShowFilters(true)}
          className="lg:hidden mono mx-4 mt-4 flex items-center justify-center gap-2 rounded-md border border-cal-gold/30 bg-cal-gold/5 px-3 py-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-cal-gold transition-colors hover:bg-cal-gold/10"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          Filters
        </button>
        {center}
      </div>

      {/* Right: detail — full width on mobile when selected, flex-1 on lg */}
      <div className={`relative h-full min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden ${showDetail ? 'flex' : 'hidden md:flex'}`}>
        {showDetail && (
          <button
            onClick={() => selectCourse(null)}
            className="md:hidden mono absolute left-3 top-3 z-10 flex items-center gap-1 rounded-md border border-border-strong bg-bg-card/90 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary backdrop-blur-sm hover:text-cal-gold"
            aria-label="Back to list"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
        )}
        {right}
      </div>
    </div>
  )
}
