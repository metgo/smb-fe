"use client"

import Image from 'next/image'
import { useEffect, useState } from 'react';

import { tempCardInfo } from '@/constant/hebrew';
import useGeneralStore from '@/stores/generalStore';
import { categoryGradientClasses } from '@/lib/utils';
import { LocationPinIcon } from '../ui/icons';
import { handleCropImage } from '@/lib/helpers';

const BusinessCard = ({
  height,
  width,
  imageUrl,
}: BusinessCardProps) => {
  const { activeCategoryKey } = useGeneralStore()
  const aspectRatio = width / height;
  const aspectString = `${Math.round(width)}/${Math.round(height)}`

  const [isLoading, setIsLoading] = useState(false)
  const [croppedImageUrl, setCroppedImageUrl] = useState("")

  useEffect(() => {
    if (activeCategoryKey)
      handleCropImage(imageUrl, aspectRatio, setIsLoading, setCroppedImageUrl)
  }, [activeCategoryKey])



  return (
    <div
      style={{ width, height }}
      // className={`aspect-[${aspectRatio}] w-full`}
    >
      {(isLoading || croppedImageUrl === "") ?
        <div className={` rounded-2xl skeleton w-full h-full ${categoryGradientClasses[activeCategoryKey]}`} /> :
        <div className="w-full h-full relative">
          <Image
            alt='abc'
            fill
            unoptimized
            priority
            quality={100}
            src={croppedImageUrl}
            className="object-cover h-full w-full rounded-xl"
          />
          <div className="absolute bottom-0 right-0 ps-4 pb-4 text-white font-bold">
            <h3 className="">{tempCardInfo.title}</h3>
            <div className="flex items-center gap-2">
              <LocationPinIcon />
              <span className="text-[0.9rem]">{tempCardInfo.location}</span>
            </div>
          </div>
        </div>
      }
    </div>
  )
}

export default BusinessCard