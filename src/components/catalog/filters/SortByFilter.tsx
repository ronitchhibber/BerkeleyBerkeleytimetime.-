import Dropdown from '@/components/ui/Dropdown'
import { useCatalogStore } from '@/stores/catalogStore'
import type { SortOption } from '@/types'

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'grade', label: 'Average Grade' },
  { value: 'rmp', label: 'Professor Rating' },
  { value: 'enrolled', label: 'Enrolled Percentage' },
  { value: 'units', label: 'Units' },
  { value: 'number', label: 'Course Number' },
  { value: 'department', label: 'Department' },
]

export default function SortByFilter() {
  const sortBy = useCatalogStore((s) => s.sortBy)
  const sortDirection = useCatalogStore((s) => s.sortDirection)
  const setSortBy = useCatalogStore((s) => s.setSortBy)
  const toggleSortDirection = useCatalogStore((s) => s.toggleSortDirection)

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Dropdown label="Sort By" value={sortBy} options={sortOptions} onChange={(v) => setSortBy(v as SortOption)} />
      </div>
      <button
        onClick={toggleSortDirection}
        className="flex h-[42px] w-10 items-center justify-center rounded-md border border-border-input bg-bg-input text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
        title={sortDirection === 'desc' ? 'Descending' : 'Ascending'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {sortDirection === 'desc' ? (
            <><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></>
          ) : (
            <><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>
          )}
        </svg>
      </button>
    </div>
  )
}
