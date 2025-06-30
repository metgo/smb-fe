"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { REFERENCE_SCREEN_WIDTH } from "@/constant/collageLayouts"

const col1 = [0]
const col2 = [1, 2]
const col3 = [3, 4]


const layout = [
  { width: 635, height: 450 },
  { width: 312.5, height: 220 },
  { width: 312.5, height: 220 },
  { width: 312.5, height: 220 },
  { width: 312.5, height: 220 },
]


const ImageCard = ({ width = 312.5, height = 220, scale, className = "" }: { width?: number, height?: number, scale: number; className?: string }) => (
  <div>
    <Image
      src={"/images/video-thumbnail.png"}
      alt="abc"
      width={Math.round(width * scale)}
      height={Math.round(height * scale)}
      className={className}
    />
  </div>
)
const ImageGallery = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const currentWidth = window.innerWidth;
      const newScale = currentWidth / REFERENCE_SCREEN_WIDTH;
      setScale(newScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div>

      <div className="flex items-center gap-2.5">
        <ImageCard
          width={635}
          height={450}
          scale={scale}
          className=" rounded-tr-[10px] rounded-br-[10px]"
        />
        <div className="space-y-2.5">
          <ImageCard scale={scale} />
          <ImageCard scale={scale} />
        </div>
        <div className="space-y-2.5">
          <ImageCard scale={scale} className=" rounded-tl-[10px]" />
          <ImageCard scale={scale} className=" rounded-bl-[10px]" />
        </div>
      </div>
    </div>
  )
}

export default ImageGallery