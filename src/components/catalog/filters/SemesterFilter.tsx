import Dropdown from '@/components/ui/Dropdown'

const semesters = [
  { value: '2268', label: 'Fall 2026' },
]

export default function SemesterFilter() {
  return <Dropdown label="Semester" value="2268" options={semesters} onChange={() => {}} />
}
