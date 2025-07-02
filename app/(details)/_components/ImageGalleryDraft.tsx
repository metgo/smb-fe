"use client";

import clsx from "clsx";
import Image from "next/image";

import { IconImage } from "@/components/ui";
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
  className = "",
}: {
  width: number;
  height: number;
  scale: number;
  className?: string;
}) => (
  <div
    style={{
      width: Math.round(width * scale),
      height: height > 450 ? 450 : height,
      overflow: "hidden",
    }}
    className={clsx("relative", className)}
  >
    <Image
      fill
      alt="thumbnail"
      src="/images/video-thumbnail.png"
      className="object-cover w-full h-full"
    />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <IconImage icon="play-button" width={40} height={40} />
    </div>
    {/* <video width="320" height="240" controls preload="none">
      <source src="/path/to/video.mp4" type="video/mp4" />
      <track
        src="/path/to/captions.vtt"
        kind="subtitles"
        srcLang="en"
        label="English"
      />
      Your browser does not support the video tag.
    </video> */}
  </div>
);

const ImageGalleryDraft = () => {
  const { scale } = useImageScale();
  const imageCount = 3;

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
