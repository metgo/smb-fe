"use client"

import { useGoogleMap } from "@/hooks/useGoogleMap"

const BusinessPinMap = () => {
  const { mapRef } = useGoogleMap()
  return (
    <div className=" w-full h-[90vh]">
      <div ref={mapRef} className="w-full h-full rounded-md" />
    </div>
  )
}

export default BusinessPinMap