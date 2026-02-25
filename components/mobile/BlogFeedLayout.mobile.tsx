"use client";

import clsx from "clsx";
import Image from "next/image";

import { NextImage } from "../ui";
import MobileNavbar from "./Navbar.mobile";
import { staticImages } from "@/constant/staticImages";
import { useMobileBlogFeedLayout } from "@/hooks";
import { removeInlineStylesFromHTML } from "@/lib/helpers";
import { blogLabels } from "@/constant/hebrew";

const ACTIVE_THUMBNAIL_SIZE = 100;
const INACTIVE_THUMBNAIL_SIZE = 60;

const MobileBlogFeedLayout = ({ blogs }: { blogs: BlogFeed[] }) => {
  const {
    loading,
    sidePadding,
    computedValues,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,

    handleActiveItem,
    handleNavigation,
    setRefs,

    activeFeedItem,
    feedItems,
    itemRefs,
    activeIndex,
  } = useMobileBlogFeedLayout(blogs);

  return (
    <div
      className="flex flex-col max-sm:block md:hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <MobileNavbar />

      <div className="relative flex-1 h-screen">
        <GalleryView
          currentImage={computedValues.currentImage}
          activeFeedItem={activeFeedItem}
          onNavigate={handleNavigation}
        />
        <ThumbnailCarousel
          feedItems={feedItems}
          activeIndex={activeIndex}
          loading={loading}
          sidePadding={sidePadding}
          itemRefs={itemRefs}
          setRefs={setRefs}
          onItemClick={handleActiveItem}
        />
      </div>
    </div>
  );
};

// Sub-components
interface GalleryViewProps {
  currentImage: any;
  activeFeedItem: BlogFeed;
  onNavigate: (e: React.MouseEvent) => void;
}

const GalleryView = ({
  currentImage,
  activeFeedItem,
  onNavigate,
}: GalleryViewProps) => (
  <div
    onClick={onNavigate}
    className="custom-cursor block relative w-full h-full"
  >
    <Image
      unoptimized
      fill
      src={currentImage?.image || staticImages.placeholder}
      alt={currentImage?.alt || ""}
      className="object-cover ultra-sharp"
    />

    {/* Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-tl from-black/70 via-black/30 to-transparent z-10" />
    <div className="flex items-center justify-center flex-col pt-10 absolute left-0 top-30 z-10 text-white w-full">
      <h1 className="font-bold text-2xl">{blogLabels.theFlourishingBlog}</h1>
      <p className="font-normal">{blogLabels.desc}</p>
    </div>
    {/* Content */}
    <div className="absolute top-80 right-10 left-10 z-20 text-white">
      <h1 className="text-6xl font-bold line-clamp-2">
        {activeFeedItem?.title}
      </h1>
      <div
        dangerouslySetInnerHTML={{
          __html: removeInlineStylesFromHTML(activeFeedItem?.subTitle) || "",
        }}
        className="line-clamp-3 font-bold text-2xl mt-1"
      />
    </div>
  </div>
);

interface ThumbnailCarouselProps {
  feedItems: BlogFeed[];
  activeIndex: number;
  loading: boolean;
  sidePadding: number;
  itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  setRefs: (el: HTMLDivElement | null) => void;
  onItemClick: (index: number, id: string) => void;
}

const ThumbnailCarousel = ({
  feedItems,
  activeIndex,
  loading,
  sidePadding,
  itemRefs,
  setRefs,
  onItemClick,
}: ThumbnailCarouselProps) => {
  return (
    <section
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      className="absolute bottom-12 w-full z-20"
    >
      <div
        ref={setRefs}
        className="flex flex-row items-center gap-3 overflow-x-auto scrollbar-hide"
        style={{ paddingLeft: sidePadding, paddingRight: sidePadding }}
      >
        {feedItems.map((item, idx) => {
          const isActive = activeIndex === idx;
          const borderColor = isActive ? "#8ED4D5" : "#fff";
          const size = isActive
            ? ACTIVE_THUMBNAIL_SIZE
            : INACTIVE_THUMBNAIL_SIZE;

          return (
            <div
              key={item._id}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              onClick={() => onItemClick(idx, item._id)}
              className={clsx(
                "flex-shrink-0 cursor-pointer transition-all duration-300 rounded-lg overflow-hidden",
              )}
              style={{
                width: size,
                height: size,
                border: `3px solid ${borderColor}`,
              }}
            >
              <NextImage
                alt={item.title}
                imgSrc={item?.images?.[0]?.image}
                width={200}
                height={200}
                className="object-cover w-full h-full rounded"
              />
            </div>
          );
        })}

        {loading && (
          <div className="flex-shrink-0 w-[60px] h-[60px] flex items-center justify-center text-white border-2 border-white rounded-md">
            <div className="text-xs">Loading...</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MobileBlogFeedLayout;
