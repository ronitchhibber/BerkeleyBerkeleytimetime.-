import Dropdown from '@/components/ui/Dropdown'
import { useDataStore, type TermId } from '@/stores/dataStore'
import { useCatalogStore } from '@/stores/catalogStore'

const semesters: { value: TermId; label: string }[] = [
  { value: 'fall-2026', label: 'Fall 2026' },
  { value: 'summer-2026', label: 'Summer 2026' },
]

export default function SemesterFilter() {
  const term = useDataStore((s) => s.term)
  const setTerm = useDataStore((s) => s.setTerm)
  const selectCourse = useCatalogStore((s) => s.selectCourse)

  return (
    <Dropdown
      label="Semester"
      value={term}
      options={semesters}
      onChange={(v) => {
        // Drop any selected course before swapping datasets — its id may not
        // exist in the new term's catalog, leading to a stale empty detail panel.
        selectCourse(null)
        void setTerm(v as TermId)
      }}
    />
  )
}
