"use client"

import { useGoogleMap } from "@/hooks/useGoogleMap"

const BusinessPinMap = ({ className = "w-full" }: { className?: string }) => {
  const { mapRef } = useGoogleMap()
  return (
    <div className={`${className} h-[90vh]`}>
      <div ref={mapRef} className="w-full h-full rounded-md" />
    </div>
  )
}

export default BusinessPinMap