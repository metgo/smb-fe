"use client";

import Image from "next/image";
import clsx from "clsx";
import { useImageScale } from "@/hooks/useImageScale";

// Layout definitions (image sizes)
const layouts = {
  layout1: [{ width: 1280, height: 450 }],
  layout2: [
    { width: 603, height: 450 },
    { width: 603, height: 450 },
  ],
  layout3: [
    { width: 603, height: 450 },
    { width: 312.5, height: 450 },
    { width: 312.5, height: 450 },
  ],
  layout4: [
    { width: 603, height: 450 },
    { width: 312.5, height: 450 },
    { width: 312.5, height: 220 },
    { width: 312.5, height: 220 },
  ],
  layout5: [
    { width: 635, height: 450 },
    { width: 312.5, height: 220 },
    { width: 312.5, height: 220 },
    { width: 312.5, height: 220 },
    { width: 312.5, height: 220 },
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

// Single image card
const ImageCard = ({
  width,
  height,
  scale,
  className = "",
}: {
  width: number;
  height: number;
  scale: number;
  className?: string;
}) => (
  <Image
    src="/images/video-thumbnail.png"
    alt="thumbnail"
    width={Math.round(width * scale)}
    height={height}
    className={clsx("object-cover", className)}
  />
);

const ImageGallery = () => {
  const { scale } = useImageScale();
  const imageCount = 5;

  const layout = layouts[`layout${imageCount}` as keyof typeof layouts];
  const columns = rowsLayout[`row${imageCount}` as keyof typeof rowsLayout];

  return (
    <div className="flex gap-2.5">
      {columns.map((column, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-2.5">
          {column.map((imgIdx, innerIdx) => {
            const { width, height } = layout[imgIdx];
            const isFirst = innerIdx === 0;
            const isLast = innerIdx === column.length - 1;

            return (
              <ImageCard
                key={imgIdx}
                width={width}
                height={height}
                scale={scale}
                className={clsx({
                  "rounded-t-[10px]": isFirst,
                  "rounded-b-[10px]": isLast,
                })}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;
