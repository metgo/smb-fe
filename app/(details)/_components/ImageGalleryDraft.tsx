"use client";

import clsx from "clsx";

import { useEffect, useState } from "react";
import { NextImage } from "@/components/ui";
import { handleCropImage } from "@/lib/helpers";
import { CardSkeleton } from "@/components/skeletons";
import { useImageScale } from "@/hooks/useImageScale";

// Layout definitions (image sizes)
const layouts = {
  layout1: [{ width: 1268, height: 450 }],
  layout2: [
    { width: 630, height: 450 },
    { width: 630, height: 450 },
  ],
  layout3: [
    { width: 630, height: 450 },
    { width: 310.5, height: 450 },
    { width: 310.5, height: 450 },
  ],
  layout4: [
    { width: 630, height: 450 },
    { width: 310.5, height: 450 },
    { width: 310.5, height: 220 },
    { width: 310.5, height: 220 },
  ],
  layout5: [
    { width: 630, height: 450 },
    { width: 310.5, height: 220 },
    { width: 310.5, height: 220 },
    { width: 310.5, height: 220 },
    { width: 310.5, height: 220 },
  ],
};

// Row layout represents images grouped **by column**
const rowsLayout = {
  row1: [[0]],
  row2: [[0], [1]],
  row3: [[0], [1], [2]],
  row4: [[0], [1], [2, 3]],
  row5: [[0], [1, 2], [3, 4]],
};

// Helper to compute border radius classes
function getRoundedClass(layout: string, index: number) {
  switch (layout) {
    case "layout1":
      return "rounded-[10px]";
    case "layout2":
      if (index === 0) return "rounded-tr-[10px] rounded-br-[10px]";
      if (index === 1) return "rounded-tl-[10px] rounded-bl-[10px]";
      break;
    case "layout3":
      if (index === 0) return "rounded-tr-[10px] rounded-br-[10px]";
      if (index === 2) return "rounded-tl-[10px] rounded-bl-[10px]";
      break;
    case "layout4":
      if (index === 0) return "rounded-tr-[10px] rounded-br-[10px]";
      if (index === 2) return "rounded-tl-[10px]";
      if (index === 3) return "rounded-bl-[10px]";
      break;
    case "layout5":
      if (index === 0) return "rounded-tr-[10px] rounded-br-[10px]";
      if (index === 3) return "rounded-tl-[10px]";
      if (index === 4) return "rounded-bl-[10px]";
      break;
    default:
      return "";
  }
}

// ImageCard component
const ImageCard = ({
  width,
  height,
  scale,
  imageItem,
  className = "",
  primaryCategoryId,
}: {
  width: number;
  height: number;
  scale: number;
  primaryCategoryId: string;
  imageItem: ImageItem;
  className?: string;
}) => {
  const aspectRatio = width / height;
  const [isLoading, setIsLoading] = useState(false);
  const [updatedImage, setUpdatedImage] = useState({
    imageUrl: "",
    alt: "placeholder",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (imageItem?.subCoordinates) {
        handleCropImage(imageItem, aspectRatio, setIsLoading, setUpdatedImage);
      } else {
        setUpdatedImage({
          imageUrl: imageItem?.image,
          alt: imageItem?.alt,
        });
        setIsLoading(false);
      }
    }, 3000);
    setIsLoading(true);
    return () => clearTimeout(timer);
  }, [imageItem]);

  return (
    <div
      style={{
        width: Math.round(width * scale),
        height: height > 450 ? 450 : height,
        overflow: "hidden",
      }}
      className={clsx("relative", className)}
    >
      {isLoading ? (
        <CardSkeleton primaryCategoryId={primaryCategoryId} />
      ) : (
        <NextImage
          isFill
          alt={updatedImage.alt}
          imgSrc={updatedImage.imageUrl}
          className="object-cover w-full h-full"
        />
      )}
    </div>
  );
};

const ImageGalleryDraft = ({
  images,
  primaryCategoryId,
}: {
  images: ImageItem[];
  primaryCategoryId: string;
}) => {
  const { scale } = useImageScale();
  const imageCount = images?.length;

  const layoutName = `layout${imageCount}`;
  const layout = layouts[layoutName as keyof typeof layouts];
  const columns = rowsLayout[`row${imageCount}` as keyof typeof rowsLayout];

  return (
    <div style={{ height: 450 }} className="flex gap-2.5 overflow-hidden">
      {columns.map((column, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-2.5">
          {column.map((imgIdx) => {
            const { width, height } = layout[imgIdx];
            const rounded = getRoundedClass(layoutName, imgIdx);

            return (
              <ImageCard
                key={imgIdx}
                width={width}
                height={height}
                scale={scale}
                primaryCategoryId={primaryCategoryId}
                imageItem={images[imgIdx]}
                className={rounded}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default ImageGalleryDraft;
