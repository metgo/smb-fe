"use client";

import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";
import { BiSolidNavigation } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";

import MobileNavbar from "./Navbar.mobile";
import { staticImages } from "@/constant/staticImages";
import { categoryColors } from "@/lib/utils";
import { IconImage, NextImage } from "../ui";
import { useMobileFeedLayout } from "@/hooks";
import { removeInlineStylesFromHTML } from "@/lib/helpers";
import MobileCategoryPanel from "./CategoryPanel.mobile";
import BusinessPinMap from "../maps/BusinessPinMap";

interface MobileFeedLayoutProps {
  businesses: BusinessesProps;
}

const ACTIVE_THUMBNAIL_SIZE = 100;
const INACTIVE_THUMBNAIL_SIZE = 60;

const MobileFeedLayout = ({ businesses }: MobileFeedLayoutProps) => {
  const {
    calculateDistanceTo,
    userLiveLocation,
    loading,
    computedValues,
    geoLocation,
    sidePadding,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,

    handleActiveItem,
    handleNavigation,
    setRefs,

    shouldShowNavbar,
    containerHeight,
    activeFilterTab,
    activeFeedItem,
    feedItems,
    itemRefs,
    activeIndex,
  } = useMobileFeedLayout(businesses);

  return (
    <>
      <div
        className="flex flex-col max-sm:block md:hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {shouldShowNavbar && <MobileNavbar showFilterTab />}

        <div className="relative flex-1" style={{ height: containerHeight }}>
          {/* Gallery View */}
          {activeFilterTab === "gallery" && (
            <GalleryView
              currentImage={computedValues.currentImage}
              activeFeedItem={activeFeedItem}
              geoLocation={geoLocation}
              userLiveLocation={userLiveLocation}
              calculateDistanceTo={calculateDistanceTo}
              onNavigate={handleNavigation}
            />
          )}

          {/* Map View */}
          {activeFilterTab === "map" && (
            <BusinessPinMap mapHeight={containerHeight} />
          )}

          {/* Thumbnail Carousel */}
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

        <MobileCategoryPanel />
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
  currentImage: any;
  activeFeedItem: BusinessProps;
  geoLocation: { lat: number; lng: number };
  userLiveLocation: any;
  calculateDistanceTo: (lat: number, lng: number) => number | null;
  onNavigate: (e: React.MouseEvent) => void;
}

const GalleryView = ({
  currentImage,
  activeFeedItem,
  geoLocation,
  userLiveLocation,
  calculateDistanceTo,
  onNavigate,
}: GalleryViewProps) => (
  <div
    className="custom-cursor block relative w-full h-full"
    onClick={onNavigate}
  >
    <Image
      unoptimized
      fill
      src={currentImage?.image || staticImages.placeholder}
      alt={currentImage?.alt || ""}
      className="object-cover ultra-sharp"
    />

    {/* Top Right Controls */}
    <div className="w-[88%] absolute top-30 right-5 flex justify-between text-white z-20">
      <BsThreeDotsVertical size={30} />
      <div className="flex items-center flex-col">
        <Link
          target="_blank"
          data-no-swipe
          rel="noopener noreferrer"
          href={`https://www.google.com/maps/search/?api=1&query=${geoLocation.lat},${geoLocation.lng}`}
          className="flex flex-col items-center gap-1.25 ps-2.5 pe-4 py-1 custom-cursor"
          onClick={(e) => e.stopPropagation()}
        >
          <BiSolidNavigation size={28} />
          {userLiveLocation && (
            <span className="font-bold">
              ק״מ{" "}
              {calculateDistanceTo(
                Number(geoLocation.lat),
                Number(geoLocation.lng),
              )}
            </span>
          )}
        </Link>
      </div>
    </div>

    {/* Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-tl from-black/70 via-black/30 to-transparent z-10" />

    {/* Content */}
    <div className="absolute top-60 right-10 left-10 z-20 text-white">
      <h1 className="text-6xl font-bold line-clamp-2">
        {activeFeedItem?.name}
      </h1>
      <div
        dangerouslySetInnerHTML={{
          __html: removeInlineStylesFromHTML(activeFeedItem?.description),
        }}
        className="line-clamp-3 font-bold text-2xl mt-1"
      />
      {activeFeedItem?.serviceType !== "point_of_interest" &&
        activeFeedItem?.address?.city && (
          <div className="flex items-center gap-2 mt-4">
            <IconImage icon="location" width={30} height={30} />
            <span className="text-xl font-bold">
              {activeFeedItem?.address?.city}
            </span>
          </div>
        )}
    </div>
  </div>
);

interface ThumbnailCarouselProps {
  feedItems: BusinessProps[];
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
    <section className="absolute bottom-4 w-full z-20">
      <div
        ref={setRefs}
        className="flex flex-row items-center gap-3 overflow-x-auto scrollbar-hide"
        style={{ paddingLeft: sidePadding, paddingRight: sidePadding }}
      >
        {feedItems.map((item, idx) => {
          const isActive = activeIndex === idx;
          const borderColor = isActive
            ? categoryColors[item.primaryCategoryId]
            : "#fff";
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
                alt={item.name}
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

export default MobileFeedLayout;
