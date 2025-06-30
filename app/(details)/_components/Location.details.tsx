import { IconImage } from '@/components/ui'
import React from 'react'

const Location = ({ city, address }: { city: string, address: string }) => {
  return (
    <div className="flex gap-1.25 items-center">
      <IconImage icon='location-gray' />
      <div className="text-theme text-sm flex items-center gap-2">
        <span>{city}</span>
        <span className="w-0.5 h-3.5 bg-theme" />
        <span>{address}</span>
      </div>
    </div>
  )
}

export default Location