"use client"

import Image from 'next/image'
import { useEffect, useState } from 'react';

import { handleCropImage } from '@/lib/helpers';
import { tempCardInfo } from '@/constant/hebrew';
import useGeneralStore from '@/stores/generalStore';
import { categoryGradientClasses } from '@/lib/utils';
import { LocationPinIcon } from '@/components/ui/icons';

const BusinessCard = ({
  height,
  width,
  business,
}: BusinessCardProps) => {
  const { activeCategoryKey } = useGeneralStore()
  const aspectRatio = width / height;

  const [isLoading, setIsLoading] = useState(false)
  const [croppedImageUrl, setCroppedImageUrl] = useState("")

  useEffect(() => {
    if (activeCategoryKey)
      handleCropImage(business?.images[0], aspectRatio, setIsLoading, setCroppedImageUrl)
  }, [activeCategoryKey])



  return (
    <div style={{ width, height }}>
      {(isLoading) ?
        <div className={` rounded-2xl skeleton w-full h-full ${categoryGradientClasses[activeCategoryKey]}`} /> :
        <div className="w-full h-full relative">
          <Image
            fill
            priority
            unoptimized
            quality={100}
            alt={business?.images[0]?.alt || "Business Image"}
            src={croppedImageUrl || "/images/image-placeholder.jpg"}
            className="object-cover h-full w-full rounded-xl"
          />
          <div className="absolute bottom-0 right-0 ps-4 pb-4 text-white font-bold">
            <h3 className=" lg:text-[1rem] xl:tetx-[1.5rem]">{business?.name}</h3>
            <div className="flex items-center gap-2">
              <LocationPinIcon />
              <span className="md:text-sm">{tempCardInfo.location}</span>
            </div>
            <div className=" z-50 h-40 w-full absolute bottom-0 right-0"  />
          </div>
        </div>
      }
    </div>
  )
}

export default BusinessCard