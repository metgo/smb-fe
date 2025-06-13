"use client"

import Image from 'next/image'
import { useEffect, useState } from 'react';

const BusinessCard = ({
  height,
  width,
  imageUrl,
}: BusinessCardProps) => {

  const [croppedImageUrl, setCroppedImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
    handleCropAll()
  }, [])

  return (
    <div
      style={{ height, width }}
      className={` rounded-2xl`}
    >
      {(isLoading || croppedImageUrl === "") ?
        <div className="skeleton w-full h-full" /> :
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
      }
    </div>
  )
}

export default BusinessCard