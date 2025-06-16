import { getBusinessList } from "@/lib/helpers"
import { BusinessCard } from "../cards"


const col1 = [0]
const col2 = [1, 2]
const col3 = [3, 4]

const EventDetailsImagesLayout = () => {
  const business = getBusinessList(5)
  return (
    <div className="flex items-center gap-2.5">
      <BusinessCard
        width={635}
        height={450}
        imageUrl={business[0].image}
      />
      <div className="space-y-2.5">
        <BusinessCard
          width={312}
          height={220}
          imageUrl={business[1].image}
        />
        <BusinessCard
          width={312}
          height={220}
          imageUrl={business[2].image}
        />
      </div>
      <div className="space-y-2.5">
        <BusinessCard
          width={312}
          height={220}
          imageUrl={business[3].image}
        />
        <BusinessCard
          width={312}
          height={220}
          imageUrl={business[4].image}
        />
      </div>
    </div>
  )
}

export default EventDetailsImagesLayout