import MultiSelect from '@/components/ui/MultiSelect'
import { useCatalogStore } from '@/stores/catalogStore'

const options = ['Letter Graded', 'Pass/Not Pass', 'Satisfactory/Unsatisfactory']

export default function GradingOptionFilter() {
  const gradingOptions = useCatalogStore((s) => s.gradingOptions)
  const toggleGradingOption = useCatalogStore((s) => s.toggleGradingOption)

  return (
    <MultiSelect
      label="Grading Option"
      options={options}
      selected={gradingOptions}
      onToggle={toggleGradingOption}
      placeholder="Filter by grading options"
    />
  )
}
