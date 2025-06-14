"use client"

import useGeneralStore from '@/stores/generalStore'
import OnlyBusinessCardsLayout from './OnlyBusinessCardsLayout'
import MapBusinessIntegratedLayout from './MapBusinessIntegratedLayout'
import OnlyBusinessMapLayout from './OnlyBusinessMapLayout'

const FilterBusinessLayout = () => {
  const { activeFilterTab } = useGeneralStore()

  const renderLayout = () => {
    switch (activeFilterTab) {
      case "gallery":
        return <OnlyBusinessCardsLayout />
      case "integrated":
        return <MapBusinessIntegratedLayout />
      case "map":
        return <OnlyBusinessMapLayout />
      default:
        return <div>No layout</div>
    }
  }
  return renderLayout()
}

export default FilterBusinessLayout