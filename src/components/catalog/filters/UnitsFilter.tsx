import RangeSlider from '@/components/ui/RangeSlider'
import { useCatalogStore } from '@/stores/catalogStore'

export default function UnitsFilter() {
  const unitsRange = useCatalogStore((s) => s.unitsRange)
  const setUnitsRange = useCatalogStore((s) => s.setUnitsRange)

  return (
    <RangeSlider
      label="Units"
      min={0} max={5}
      value={unitsRange}
      onChange={setUnitsRange}
      labels={['0', '1', '2', '3', '4', '5+']}
    />
  )
}
