import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDataStore } from '@/stores/dataStore'
import { useCatalogStore } from '@/stores/catalogStore'
import ThreeColumnLayout from '@/components/layout/ThreeColumnLayout'
import FilterSidebar from '@/components/catalog/FilterSidebar'
import ClassList from '@/components/catalog/ClassList'
import ClassDetailPanel from '@/components/catalog/ClassDetailPanel'

export default function CatalogPage() {
  const { courseId } = useParams()
  const loadData = useDataStore((s) => s.loadData)
  const isLoading = useDataStore((s) => s.isLoading)
  const error = useDataStore((s) => s.error)
  const selectCourse = useCatalogStore((s) => s.selectCourse)

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => { if (courseId) selectCourse(courseId) }, [courseId, selectCourse])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[13px] text-text-muted">Loading courses…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[13px] text-accent-red">{error}</p>
      </div>
    )
  }

  return (
    <ThreeColumnLayout
      left={<FilterSidebar />}
      center={<ClassList />}
      right={<ClassDetailPanel />}
    />
  )
}
