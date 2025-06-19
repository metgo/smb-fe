"use client"

import useGeneralStore from '@/stores/generalStore'

import NoBusinessLayout from './NoBusinessLayout'
import OnlyBusinessMapLayout from './OnlyBusinessMapLayout'
import OnlyBusinessCardsLayout from './OnlyBusinessCardsLayout'
import MapBusinessIntegratedLayout from './MapBusinessIntegratedLayout'


const FilterBusinessLayout = (businesses: BusinessesProps) => {
  const { activeFilterTab } = useGeneralStore()

  const totalBusiness = businesses?.totalData;


  if (totalBusiness === 0) {
    return <NoBusinessLayout />
  }

  const renderLayout = () => {
    switch (activeFilterTab) {
      case "gallery":
        return <OnlyBusinessCardsLayout
          data={businesses.data}
          meta={businesses.meta}
          totalData={businesses.totalData}
        />
      case "integrated":
        return <MapBusinessIntegratedLayout
          data={businesses.data}
          meta={businesses.meta}
        />
      case "map":
        return <OnlyBusinessMapLayout />
      default:
        return <NoBusinessLayout />
    }
  }
  return renderLayout()
}

export default FilterBusinessLayout