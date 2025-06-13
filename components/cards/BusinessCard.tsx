"use client"

import { tempCardInfo } from '@/constant/hebrew';
import { categoryGradientClasses } from '@/lib/utils';
import useGeneralStore from '@/stores/generalStore';
import Image from 'next/image'
import { useEffect, useState } from 'react';
import { LocationPinIcon } from '../ui/icons';

const BusinessCard = ({
  height,
  width,
  imageUrl,
}: BusinessCardProps) => {
  const { activeCategoryKey } = useGeneralStore()

  const [isLoading, setIsLoading] = useState(false)
  const [croppedImageUrl, setCroppedImageUrl] = useState("")

  const handleCropAll = async () => {
    const encodedImageUrl = encodeURIComponent(imageUrl);
    // const xMax = 0.765625;
    // const xMin = 0.58984375;
    // const yMax = 0.5234375;
    // const yMin = 0.203125;

    const xMin = 0.44285714285714284
    const yMin = 0.41630901287553645
    const xMax = 0.76
    const yMax = 0.7140557939914163

    const query = `url=${encodedImageUrl}&xMin=${xMin}&yMin=${yMin}&xMax=${xMax}&yMax=${yMax}&aspect=${width / height}`;
    setIsLoading(true)
    try {
      const res = await fetch(`/api/crop-image?${query}`);
      if (!res.ok) throw new Error("Failed to crop image");

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setCroppedImageUrl(objectUrl);
    } catch (error) {
      console.error(`Error cropping image`, error);
    } finally {
      setIsLoading(false)
    }

  };

  useEffect(() => {
    if (activeCategoryKey)
      handleCropAll()
  }, [activeCategoryKey])




  return (
    <div style={{ height, width }}>
      {(isLoading || croppedImageUrl === "") ?
        <div className={` rounded-2xl skeleton w-full h-full ${categoryGradientClasses[activeCategoryKey]}`} /> :
        <div className="w-full h-full relative">
          <Image
            alt='abc'
            width={"100"}
            height={"100"}
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