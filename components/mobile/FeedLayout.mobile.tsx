"use client";

import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";
import { BiSolidNavigation } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import MobileNavbar from "./Navbar.mobile";
import { pathNames } from "@/lib/endpoints";
import { staticImages } from "@/constant/staticImages";
import { categoryColors, navigationPaths } from "@/lib/utils";
import { IconImage, NextImage } from "../ui";
import { useCommonHook, useHorizontalLoadMore } from "@/hooks";
import {
  getPrimaryCategoryId,
  removeInlineStylesFromHTML,
  shuffleArray,
} from "@/lib/helpers";
import MobileCategoryPanel from "./CategoryPanel.mobile";
import useGeneralStore from "@/stores/generalStore";
import BusinessPinMap from "../maps/BusinessPinMap";
import { startLoading } from "../wrappers/ProgressBar";

interface MobileFeedLayoutProps {
  businesses: BusinessesProps;
}

const MobileFeedLayout = ({ businesses }: MobileFeedLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNavigating = useRef(false);

  const { isCurrentPage, calculateDistanceTo, deviceHeight } = useCommonHook();
  const {
    hideFirstTwoSection,
    activeFilterTab,
    setClickedBusinessId,
    userLiveLocation,
  } = useGeneralStore();

  // const feedItems = shuffleArray(businesses.data);

  const [activeIndex, setActiveIndex] = useState(0);
  const [feedItems, setFeedItems] = useState<BusinessProps[]>([]);
  const activeFeedItem = feedItems[activeIndex];

  const { containerRef, loading } = useHorizontalLoadMore(
    businesses?.meta?.hasNextPage,
    feedItems.length,
    activeIndex,
  );

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    if (hideFirstTwoSection) {
      setActiveIndex(0);
      setFeedItems(shuffleArray(businesses.data));
    }
  }, [hideFirstTwoSection]);

  const pageTypes = useMemo(
    () => ({
      isEventPage: isCurrentPage(pathNames.events),
      isTrailPage: isCurrentPage(pathNames.trails),
    }),
    [isCurrentPage],
  );

  const urlParams = useMemo(() => {
    const params = Object.fromEntries(searchParams.entries());
    return {
      categoryId: params.categoryId || "",
      subCategoryId: params.subCategoryId || "",
      activeCategoryKey: params.categoryId,
    };
  }, [searchParams]);

  const images = pageTypes.isEventPage
    ? [activeFeedItem?.cover]
    : (activeFeedItem?.images ?? []);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const computedValues = useMemo(() => {
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";

    return {
      primaryCategoryId: getPrimaryCategoryId(
        pathname,
        urlParams.activeCategoryKey || "",
        activeFeedItem?.primaryCategoryId ?? "",
      ),
      currentImage: images?.[activeImageIndex],
      shouldShowSkeleton: !hasMounted,
    };
  }, [
    urlParams.activeCategoryKey,
    activeFeedItem?.primaryCategoryId,
    activeFeedItem?.address?.location,
    images,
    activeImageIndex,
    hasMounted,
  ]);

  // Horizontal scroll and swipe handling
  const itemRefs = useRef<(HTMLDivElement | null | any)[]>([]);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);

  // --- SWIPE HANDLING ---
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false); // 👈 New flag

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;

    // If movement exceeds small threshold, consider it a swipe
    const distance = Math.abs(touchEndX.current - touchStartX.current);
    if (distance > 10) {
      // 👈 threshold to differentiate tap vs swipe
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = () => {
    // If navigation was triggered, skip
    if (isNavigating.current) {
      setTimeout(() => (isNavigating.current = false), 300);
      return;
    }

    // If it's a tap (not swipe), do nothing here
    if (!isSwiping.current) return;

    const swipeThreshold = 50;
    const distance = touchStartX.current - touchEndX.current;

    if (Math.abs(distance) > swipeThreshold) {
      if (distance > 0) {
        // Swiped left
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else {
        // Swiped right
        setActiveIndex((prev) => Math.min(prev + 1, feedItems.length - 1));
      }
    }

    // Reset
    touchStartX.current = 0;
    touchEndX.current = 0;
    isSwiping.current = false;
  };

  // Scroll center logic
  const centerActiveItem = (index: number) => {
    const scrollContainer = horizontalScrollRef.current;
    const activeElement = itemRefs.current[index];

    if (scrollContainer && activeElement) {
      const containerWidth = scrollContainer.offsetWidth;
      const elementLeft = activeElement.offsetLeft;
      const elementWidth = activeElement.offsetWidth;
      const scrollLeft = elementLeft - containerWidth / 2 + elementWidth / 2;

      scrollContainer.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  };

  useEffect(() => {
    centerActiveItem(activeIndex);
    setActiveImageIndex(0);
  }, [activeIndex]);

  const ACTIVE_SIZE = 100;
  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 430;
  const sidePadding = (screenWidth - ACTIVE_SIZE) / 2;

  const setRefs = (el: HTMLDivElement | null) => {
    horizontalScrollRef.current = el;
    containerRef.current = el;
  };

  function handleActiveItem(index: number, id: string) {
    setActiveIndex(index);
    if (activeFilterTab === "map") setClickedBusinessId(id);
  }
  function handleNavigation(e: any) {
    e.stopPropagation();

    // If user was swiping, skip navigation
    if (isSwiping.current) return;

    isNavigating.current = true;
    startLoading();
    router.push(`${navigationPaths[pathname]}/${activeFeedItem.slug}`);
  }

  const apiLat = activeFeedItem?.geoLocation?.lat;
  const apiLng = activeFeedItem?.geoLocation?.long;

  return (
    <div
      className="flex flex-col max-sm:block md:hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {(hideFirstTwoSection || pathname !== pathNames.home) && (
        <MobileNavbar showFilterTab />
      )}

      <div
        className="relative flex-1"
        style={{ height: `calc(${deviceHeight}px - 100px)` }}
      >
        {/* Gallery */}
        {activeFilterTab === "gallery" && (
          <div
            className="custom-cursor block relative w-full h-full"
            onClick={handleNavigation}
          >
            <Image
              unoptimized
              fill
              src={
                computedValues.currentImage?.image || staticImages.placeholder
              }
              alt={computedValues.currentImage?.alt || ""}
              className="object-cover ultra-sharp"
            />

            {/* Top Right */}
            <div className="w-[88%] absolute top-30 right-5 flex justify-between text-white z-20">
              <BsThreeDotsVertical size={30} />
              <div className="flex items-center flex-col">
                <Link
                  target="_blank"
                  data-no-swipe
                  rel="noopener noreferrer"
                  href={`https://www.google.com/maps/search/?api=1&query=${apiLat + "," + apiLng}`}
                  className="flex flex-col items-center gap-1.25 ps-2.5 pe-4 py-1 custom-cursor"
                  onClick={(e) => e.stopPropagation()}
                >
                  <BiSolidNavigation size={28} />
                  {userLiveLocation && (
                    <span className="font-bold">
                      ק״מ {calculateDistanceTo(Number(apiLat), Number(apiLng))}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tl from-black/70 via-black/30 to-transparent z-10" />

            {/* Foreground Text */}
            <div className="absolute top-60 right-10 left-10 z-20 text-white">
              <h1 className="text-6xl font-bold line-clamp-2">
                {activeFeedItem?.name}
              </h1>
              <div
                dangerouslySetInnerHTML={{
                  __html: removeInlineStylesFromHTML(
                    activeFeedItem?.description,
                  ),
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
        )}

        {/* Map */}
        {activeFilterTab === "map" && (
          <BusinessPinMap mapHeight={`calc(${deviceHeight}px - 100px)`} />
        )}

        {/* Horizontal Thumbnails */}
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

              return (
                <div
                  key={item._id}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  style={{ border: `3px solid ${borderColor}` }}
                  onClick={() => handleActiveItem(idx, item._id)}
                  className={clsx(
                    "flex-shrink-0 cursor-pointer transition-all duration-300 rounded-lg overflow-hidden",
                    isActive ? "w-[100px] h-[100px]" : "w-[60px] h-[60px]",
                  )}
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
      </div>

      <MobileCategoryPanel />
    </div>
  );
};

export default MobileFeedLayout;

{
  /* Image carousel */
}
{
  /* {!pageTypes.isEventPage && images.length > 1 && (
              <div
                className="absolute bottom-40 left-0 right-0 px-4 z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <ImageCarouselControls
                  iconSize={60}
                  totalImages={images.length}
                  activeIndex={activeImageIndex}
                  setActiveImageIndex={setActiveImageIndex}
                />
              </div>
            )} */
}
