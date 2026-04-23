import MultiSelect from '@/components/ui/MultiSelect'
import { useCatalogStore } from '@/stores/catalogStore'
import type { ClassLevel } from '@/types'

const levels = ['Lower Division', 'Upper Division', 'Graduate']
const levelMap: Record<string, ClassLevel> = {
  'Lower Division': 'lower', 'Upper Division': 'upper', 'Graduate': 'graduate',
}
const reverseLevelMap: Record<string, string> = {
  lower: 'Lower Division', upper: 'Upper Division', graduate: 'Graduate',
}

export default function ClassLevelFilter() {
  const classLevels = useCatalogStore((s) => s.classLevels)
  const toggleClassLevel = useCatalogStore((s) => s.toggleClassLevel)

  const selectedLabels = new Set([...classLevels].map((l) => reverseLevelMap[l]).filter(Boolean))

  return (
    <MultiSelect
      label="Class level"
      options={levels}
      selected={selectedLabels}
      onToggle={(label) => { const level = levelMap[label]; if (level) toggleClassLevel(level) }}
      placeholder="Select class levels"
    />
  )
}
