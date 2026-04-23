import MultiSelect from '@/components/ui/MultiSelect'
import { useCatalogStore } from '@/stores/catalogStore'

const options = ['Open Seats (Non-Reserved)', 'Open Seats', 'Open Wait List']

export default function EnrollmentStatusFilter() {
  const enrollmentStatuses = useCatalogStore((s) => s.enrollmentStatuses)
  const toggleEnrollmentStatus = useCatalogStore((s) => s.toggleEnrollmentStatus)

  return (
    <MultiSelect
      label="Enrollment Status"
      options={options}
      selected={enrollmentStatuses}
      onToggle={toggleEnrollmentStatus}
      placeholder="Select enrollment status"
    />
  )
}
