import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { IoIosArrowForward } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";

import { IconImage } from "@/components/ui";
import { scaleLayout, shuffleArray } from "@/lib/helpers";
import GalleryImageCard from "@/components/cards/GalleryImageCard";
import { onlyCardsColumns, onlyCardsLayouts } from "@/constant/collageLayouts";
import { staticImages } from "@/constant/staticImages";

interface PreviewImageGallaryModalProps {
  images: ImageItem[];
  primaryCategoryId: string;
  setIsOpen: (isOpen: boolean) => void;
}

const scale = 1;

const PreviewImageGallaryModal = ({
  images,
  setIsOpen,
  primaryCategoryId,
}: PreviewImageGallaryModalProps) => {
  const feedItemCount = images.length;
  const [direction, setDirection] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleNext = () => {
    if (activeIndex === null) return;
    setDirection(1);
    setActiveIndex((prev) => (prev! - 1 + feedItemCount) % feedItemCount);
  };

  const handlePrev = () => {
    if (activeIndex === null) return;
    setDirection(-1);
    setActiveIndex((prev) => (prev! + 1) % feedItemCount);
  };

  const handleCloseFullView = () => {
    setActiveIndex(null);
  };

  const renderCards = (
    indexes: number[],
    layout: LayoutItem[],
    offset: number,
  ) => (
    <div className="space-y-5">
      {indexes.map((i) => {
        const feedItem = images[i + offset];
        const cardLayout = layout[i];
        return (
          <GalleryImageCard
            key={i}
            feedItem={feedItem}
            width={cardLayout.width}
            height={cardLayout.height}
            onClick={() => setActiveIndex(i)}
            primaryCategoryId={primaryCategoryId}
          />
        );
      })}
    </div>
  );

  const renderHorizontalCards = (
    indexes: number[],
    layout: LayoutItem[],
    offset: number,
  ) => (
    <div className="flex gap-5 pt-5">
      {indexes.map((i) => {
        const feedItem = images[i + offset];
        const cardLayout = layout[i];
        return (
          <GalleryImageCard
            key={i}
            feedItem={feedItem}
            width={cardLayout.width}
            height={cardLayout.height}
            onClick={() => setActiveIndex(i)}
            primaryCategoryId={primaryCategoryId}
          />
        );
      })}
    </div>
  );

  const renderLayoutSection = (
    layoutData: LayoutItem[],
    columnLayoutData: Record<string, number[]> | null,
    offset: number,
    index: number,
  ) => {
    if (!columnLayoutData) {
      return (
        <div className="space-y-5" key={index}>
          {layoutData.map((item, i) => (
            <GalleryImageCard
              key={i}
              width={item.width}
              height={item.height}
              feedItem={images[i + offset]}
              onClick={() => setActiveIndex(i)}
              primaryCategoryId={primaryCategoryId}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="flex gap-5" key={index}>
        {Object.keys(columnLayoutData)
          .filter((key) => !key.startsWith("sub"))
          .map((colKey, idx) => {
            const subKey = `sub${colKey[0].toUpperCase()}${colKey.slice(1)}`;
            const mainIndexes = columnLayoutData[colKey];
            const subIndexes = columnLayoutData[subKey];

            return (
              <div key={`${colKey}-${idx}`} className="flex flex-col">
                {renderCards(mainIndexes, layoutData, offset)}
                {subIndexes &&
                  renderHorizontalCards(subIndexes, layoutData, offset)}
              </div>
            );
          })}
      </div>
    );
  };

  const renderExtraCards = (extraBusinesses: any[]) => {
    if (extraBusinesses.length === 0) return null;

    const layout16 = scaleLayout(onlyCardsLayouts["layout16"], scale);
    const columnCount = 5;
    const shuffledLayouts = shuffleArray(layout16);

    const columns: any[][] = Array.from({ length: columnCount }, () => []);
    extraBusinesses.forEach((biz, i) => {
      const columnIndex = i % columnCount;
      columns[columnIndex].push(biz);
    });

    return (
      <div className="flex w-full gap-5">
        {columns.map((column, colIdx) => (
          <div key={`column-${colIdx}`} className="flex flex-col gap-5">
            {column.map((biz, bizIdx) => {
              const layoutIndex =
                (colIdx + bizIdx * columnCount) % shuffledLayouts.length;
              const layout = shuffledLayouts[layoutIndex];
              return (
                <GalleryImageCard
                  feedItem={biz}
                  key={biz._id + bizIdx}
                  width={layout.width}
                  height={layout.height}
                  onClick={() => setActiveIndex(bizIdx + 16)}
                  primaryCategoryId={primaryCategoryId}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderFullLayout = () => {
    if (feedItemCount <= 16) {
      const layoutKey = `layout${feedItemCount}`;
      const layout = scaleLayout(onlyCardsLayouts[layoutKey], scale);
      const columnLayout = onlyCardsColumns[layoutKey] ?? null;

      return renderLayoutSection(layout, columnLayout, 0, 0);
    }

    const layout16 = scaleLayout(onlyCardsLayouts["layout16"], scale);
    const column16 = onlyCardsColumns["layout16"];
    const extraBusinesses = images?.slice(16);

    return (
      <>
        {renderLayoutSection(layout16, column16 ?? null, 0, 0)}
        {renderExtraCards(extraBusinesses)}
      </>
    );
  };

  function handleClose() {
    if (activeIndex !== null) {
      handleCloseFullView();
    } else {
      setIsOpen(false);
    }
  }

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black/50 backdrop-blur-sm sm:flex items-start justify-center max-sm:p-0 p-4 z-[999]">
      <div
        className={clsx(
          "bg-white relative rounded-xl z-[999] w-[1350] h-[94%] mt-10",
        )}
      >
        <div
          onClick={handleClose}
          className="absolute custom-cursor -top-12  right-0 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white sm:shadow-lg"
        >
          {activeIndex ? (
            <IoIosArrowForward size={30} />
          ) : (
            <IoCloseSharp size={30} />
          )}
        </div>
        <div className="w-full h-full relative overflow-hidden p-8">
          <AnimatePresence>
            {activeIndex === null ? (
              <motion.div
                key="grid-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-5 items-start justify-start overflow-y-auto h-full"
              >
                {renderFullLayout()}
              </motion.div>
            ) : (
              <motion.div
                key="full-view"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute inset-0 bg-black flex flex-col items-center justify-center rounded-xl"
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={activeIndex}
                      custom={direction}
                      initial={{ x: direction > 0 ? 150 : -150, opacity: 0.5 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: direction > 0 ? -150 : 150, opacity: 0.5 }}
                      transition={{ duration: 0.45, ease: "easeInOut" }}
                      className="absolute w-full h-full flex items-center justify-center"
                    >
                      <Image
                        unoptimized
                        width={800}
                        height={600}
                        alt="Preview"
                        src={
                          images[activeIndex].image || staticImages.placeholder
                        }
                        className="w-full h-full object-contain rounded-xl"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation buttons */}
                  <button
                    onClick={handlePrev}
                    className="absolute left-4 bg-white/30 hover:bg-white/60 p-2 rounded-full z-10"
                  >
                    <IconImage icon="prev" width={30} height={30} />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 bg-white/30 hover:bg-white/60 p-2 rounded-full z-10"
                  >
                    <IconImage icon="next" width={30} height={30} />
                  </button>
                </div>

                {/* Dot Indicators */}
                <div className="flex gap-2 absolute bottom-6">
                  {images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-3 h-3 rounded-full transition-all ${
                        idx === activeIndex
                          ? "bg-white scale-125"
                          : "bg-gray-400 opacity-60"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PreviewImageGallaryModal;
