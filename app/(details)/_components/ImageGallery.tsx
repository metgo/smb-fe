"use client";

import clsx from "clsx";

import { NextImage } from "@/components/ui";
import { CardSkeleton } from "@/components/skeletons";
import { useImageScale } from "@/hooks/useImageScale";
import { useImagePresent } from "@/hooks/useImagePresent";
import { staticImages } from "@/constant/staticImages";

// Layout definitions (image sizes)
const layouts = {
  layout1: [{ width: 1240, height: 450 }],
  layout2: [
    { width: 620, height: 450 },
    { width: 620, height: 450 },
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
  primaryCategoryId: string;
  imageItem: ImageItem;
  scale: number;
  className?: string;
}) => {
  const aspectRatio = (width * scale) / 450;

  const { isLoading, updatedImage, isImageLoaded } = useImagePresent(
    aspectRatio,
    imageItem,
    [imageItem],
  );

  return (
    <div
      style={{
        width: Math.round(width * scale),
        height: height > 450 ? 450 : height,
        overflow: "hidden",
      }}
      className={clsx("relative flex-initial", className)}
    >
      {isLoading || !isImageLoaded ? (
        <CardSkeleton
          className={"w-full h-full"}
          primaryCategoryId={primaryCategoryId}
        />
      ) : (
        <NextImage
          width={width}
          height={height}
          alt={updatedImage.alt}
          imgSrc={updatedImage.imageUrl || staticImages.placeholder}
          className="object-cover w-full h-full"
        />
      )}
    </div>
  );
};

const ImageGallery = ({
  images,
  primaryCategoryId = "",
}: {
  images: ImageItem[];
  primaryCategoryId?: string;
}) => {
  const { scale } = useImageScale();
  const imageCount = images?.length;

  const layoutName = `layout${imageCount}`;
  const layout = layouts[layoutName as keyof typeof layouts];
  const columns = rowsLayout[`row${imageCount}` as keyof typeof rowsLayout];

  return (
    <div style={{ height: 450 }} className="flex gap-2.5">
      {columns?.map((column, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-2.5 w-full">
          {column?.map((imgIdx) => {
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

export default ImageGallery;
