"use client"

import { useParams } from 'next/navigation'
import useGeneralStore from '@/stores/generalStore'
import OnlyBusinessCardsLayout from './OnlyBusinessCardsLayout'
import MapBusinessIntegratedLayout from './MapBusinessIntegratedLayout'
import OnlyBusinessMapLayout from './OnlyBusinessMapLayout'

const FilterBusinessLayout = () => {
  const { activeFilterTab } = useGeneralStore()
  const params = useParams();
  const imageCount = Number(params.imageCount);


  const renderLayout = () => {
    switch (activeFilterTab) {
      case "gallery":
        return <OnlyBusinessCardsLayout imageCount={imageCount} />
      case "integrated":
        return <MapBusinessIntegratedLayout imageCount={imageCount} />
      case "map":
        return <OnlyBusinessMapLayout />
      default:
        return <div>No layout</div>
    }
  }
  return renderLayout()
}

export default FilterBusinessLayout