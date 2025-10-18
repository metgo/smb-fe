"use client";

import clsx from "clsx";
import Image from "next/image";
import { useEffect, useState } from "react";

import { CardSkeleton } from "@/components/skeletons";
import MobileNavbar from "@/components/mobile/Navbar.mobile";
import { removeInlineStylesFromHTML } from "@/lib/helpers";
import { useImageCrop, useSwipeHooks } from "@/hooks";
import MobileFeedsThumbnailCarousel from "@/components/mobile/FeedsThumbnailCarousel.mobile";
import MobileFeedScreenActionIcons from "@/components/mobile/FeedScreenActionIcons.mobile";

const MobileTrailFeedLayout = ({ data }: TrailsFeedProps) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [feedItems, setFeedItems] = useState<TrailFeedList>([]);
  const [isFackLoading, setIsFackLoading] = useState(true);

  const activeFeedItem = feedItems[activeIndex];

  const {
    handleTouchEnd,
    handleTouchMove,
    handleTouchStart,
    handleNavigation,
  } = useSwipeHooks(
    feedItems.length,
    activeIndex,
    setActiveIndex,
    activeFeedItem?.slug,
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsFackLoading(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      setFeedItems(data);
    }
  }, [data]);

  return (
    <>
      <div className="flex flex-col max-sm:block md:hidden relative">
        <MobileNavbar />

        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative flex-1 h-screen"
        >
          <GalleryView
            stationCount={1}
            currentImage={activeFeedItem?.images[0]}
            activeFeedItem={activeFeedItem}
            onNavigate={handleNavigation}
            isFackLoading={isFackLoading}
          />
        </div>

        <div className="fixed bottom-0 right-0 w-full z-20 space-y-4">
          <MobileFeedsThumbnailCarousel
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            loading={isFackLoading}
            items={feedItems.map((item) => {
              return {
                id: item?._id,
                name: item?.name,
                image: item?.images?.[0]?.image,
              };
            })}
          />
        </div>

        <div className="pb-safe-bottom bg-white rounded-b-2xl" />
      </div>

      <style jsx>{`
        .pb-safe-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  );
};

// Sub-components
interface GalleryViewProps {
  stationCount: number;
  currentImage: any;
  activeFeedItem: TrailFeed | null;
  isFackLoading: boolean;
  onNavigate: (e: React.MouseEvent) => void;
}

const GalleryView = ({
  // stationCount,
  currentImage,
  activeFeedItem,
  onNavigate,
  isFackLoading,
}: GalleryViewProps) => {
  const {
    finalImageSrc,
    handleImageLoad,
    handleImageError,
    isImageTransitionComplete,
    shouldShowSkeleton,
  } = useImageCrop(currentImage, 390 / 840);

  return (
    <>
      {shouldShowSkeleton || isFackLoading ? (
        <CardSkeleton
          className="w-full h-[100dvh] absolute inset-0"
          primaryCategoryId={"6566e31ca77d2a477266d2d6"}
        />
      ) : (
        <div
          onClick={onNavigate}
          className={clsx(
            "custom-cursor block relative w-full h-[100dvh] transition-opacity duration-300",
            isImageTransitionComplete ? "opacity-100" : "opacity-80",
          )}
        >
          <Image
            unoptimized
            fill
            src={finalImageSrc}
            alt={currentImage?.alt || "Feed active image"}
            className="object-cover ultra-sharp"
            onLoad={handleImageLoad}
            onError={handleImageError}
            priority
          />

          <MobileFeedScreenActionIcons
            hideThreedotIcon
            posTop="top-30"
            trailInfo={`?trailId=${activeFeedItem?._id}&slug=${activeFeedItem?.slug}`}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/30 to-black/10 z-10" />

          {/* Content */}
          <div className="absolute top-60 right-10 left-10 z-20 text-white">
            <h1 className="text-6xl font-bold line-clamp-2">
              {activeFeedItem?.name}
            </h1>
            <div
              dangerouslySetInnerHTML={{
                __html: removeInlineStylesFromHTML(
                  activeFeedItem?.description || "",
                ),
              }}
              className="line-clamp-3 font-bold text-2xl mt-1"
            />
            {/* <div className="mt-4 flex items-center font-bold">
              <IconImage icon="location" width={30} height={30} />
              <span className="text-xl">{stationCount} תחנות</span>
            </div> */}
          </div>
        </div>
      )}
    </>
  );
};

export default MobileTrailFeedLayout;
