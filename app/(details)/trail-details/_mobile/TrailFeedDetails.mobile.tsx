"use client";

import clsx from "clsx";
import Image from "next/image";
import { useEffect, useState } from "react";

import { categoryColors } from "@/lib/utils";
import { CardSkeleton } from "@/components/skeletons";
import { removeInlineStylesFromHTML } from "@/lib/helpers";
import { useImageCrop, useSwipeHooks, useTrailStations } from "@/hooks";
import MobileFeedScreenActionIcons from "@/components/mobile/FeedScreenActionIcons.mobile";
import useGeneralStore from "@/stores/generalStore";
import MobileTrailDetailsRouteMap from "./TrailDetailsRouteMap.mobile";
import MobileFeedsThumbnailCarousel from "@/components/mobile/FeedsThumbnailCarousel.mobile";

interface MobileTrailFeedDetailsProps {
  stations: TrailStationProps[];
  _id: string;
  locations: LocationListProps;
}

const MobileTrailFeedDetails = ({
  stations,
  _id,
  locations,
}: MobileTrailFeedDetailsProps) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isFackLoading, setIsFackLoading] = useState(true);

  const { visibleStations } = useTrailStations(_id, stations);

  const { handleTouchEnd, handleTouchMove, handleTouchStart } = useSwipeHooks(
    visibleStations.length,
    activeIndex,
    setActiveIndex,
  );

  const { activeFilterTabMobile } = useGeneralStore();

  const activeFeedItem = visibleStations[activeIndex];

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsFackLoading(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      {activeFilterTabMobile === "gallery" && (
        <div className="flex flex-col max-sm:block md:hidden relative">
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative flex-1 h-screen"
          >
            <GalleryView
              currentImage={activeFeedItem?.image}
              activeFeedItem={activeFeedItem}
              isFackLoading={isFackLoading}
            />
          </div>

          <div className="fixed bottom-0 right-0 w-full z-20 space-y-4">
            <MobileFeedsThumbnailCarousel
              isStation
              isInfinite={false}
              items={visibleStations?.map((item) => {
                return {
                  id: item?._id,
                  name: item?.name,
                  image: item?.image,
                  categoryId: item?.primaryCategoryId,
                };
              })}
              setActiveIndex={setActiveIndex}
              activeIndex={activeIndex}
              loading={isFackLoading}
              primaryBoderColor={
                categoryColors[activeFeedItem?.primaryCategoryId]
              }
            />
          </div>

          <div className="pb-safe-bottom bg-white rounded-b-2xl" />
        </div>
      )}

      {activeFilterTabMobile === "map" && (
        <MobileTrailDetailsRouteMap _id={_id} locations={locations} />
      )}

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
  currentImage: any;
  activeFeedItem: LocalstoreTrailStaionsProps;
  isFackLoading: boolean;
}

const GalleryView = ({
  currentImage,
  activeFeedItem,
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
          className="w-full h-screen absolute inset-0"
          primaryCategoryId={
            categoryColors[activeFeedItem?.primaryCategoryId] ||
            "6566e31ca77d2a477266d2d6"
          }
        />
      ) : (
        <div
          className={clsx(
            "custom-cursor block relative w-full h-full transition-opacity duration-300",
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
            geoLocation={activeFeedItem?.geoLocation}
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
            {/* {activeFeedItem?.address && (
              <div className="flex items-center gap-2 mt-4">
                <IconImage icon="location" width={30} height={30} />
                <span className="text-xl font-bold">
                  {getCityOrCenter(activeFeedItem?.address)}
                </span>
              </div>
            )} */}
          </div>
        </div>
      )}
    </>
  );
};

export default MobileTrailFeedDetails;
