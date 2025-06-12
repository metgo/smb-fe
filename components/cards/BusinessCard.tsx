"use client"

import Image from 'next/image'
import { useEffect, useState } from 'react';

const BusinessCard = ({
  height,
  width,
  imageUrl,
}: BusinessCardProps) => {

  const [croppedImageUrl, setCroppedImageUrl] = useState("")

  const handleCropAll = async () => {
    const encodedImageUrl = encodeURIComponent(imageUrl);
    const xMax = 0.765625;
    const xMin = 0.58984375;
    const yMax = 0.5234375;
    const yMin = 0.203125;

    const query = `url=${encodedImageUrl}&xMin=${xMin}&yMin=${yMin}&xMax=${xMax}&yMax=${yMax}&aspect=${width / height}`;

    try {
      const res = await fetch(`/api/crop-image?${query}`);
      if (!res.ok) throw new Error("Failed to crop image");

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setCroppedImageUrl(objectUrl);
    } catch (error) {
      console.error(`Error cropping image`, error);
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
      <Image
        alt='abc'
        width={"100"}
        height={"100"}
        unoptimized
        priority
        quality={100}
        src={croppedImageUrl || ""}
        className="object-cover h-full w-full rounded-xl"
      />
    </div>
  )
}

export default BusinessCard