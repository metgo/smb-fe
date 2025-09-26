"use client";

import clsx from "clsx";
import Image from "next/image";
import { BiSolidNavigation } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import MobileNavbar from "./Navbar.mobile";
import { pathNames } from "@/lib/endpoints";
import { categoryColors, navigationPaths } from "@/lib/utils";
import { staticImages } from "@/constant/staticImages";
import { useCommonHook, useHorizontalLoadMore } from "@/hooks";
import { IconImage, ImageCarouselControls, NextImage } from "../ui";
import {
  getPrimaryCategoryId,
  removeInlineStylesFromHTML,
} from "@/lib/helpers";
import MobileCategoryPanel from "./CategoryPanel.mobile";
import useGeneralStore from "@/stores/generalStore";
import BusinessPinMap from "../maps/BusinessPinMap";
import Link from "next/link";

interface MobileFeedLayoutProps {
  businesses: BusinessesProps;
}

const MobileFeedLayout = ({ businesses }: MobileFeedLayoutProps) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { isCurrentPage } = useCommonHook();
  const { hideFirstTwoSection, activeFilterTab, setClickedBusinessId } =
    useGeneralStore();
  const feedItems = businesses.data;

  // Active index
  const [activeIndex, setActiveIndex] = useState(0);
  const activeFeedItem = feedItems[activeIndex];

  // Updated hook call with required parameters
  const { containerRef, loading } = useHorizontalLoadMore(
    businesses?.meta?.hasNextPage,
    feedItems.length,
    activeIndex,
  );

  // Mounted check for SSR safety
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => setHasMounted(true), []);

  // Page type flags
  const pageTypes = useMemo(
    () => ({
      isEventPage: isCurrentPage(pathNames.events),
      isTrailPage: isCurrentPage(pathNames.trails),
    }),
    [isCurrentPage],
  );

  // URL params
  const urlParams = useMemo(() => {
    const params = Object.fromEntries(searchParams.entries());
    return {
      categoryId: params.categoryId || "",
      subCategoryId: params.subCategoryId || "",
      activeCategoryKey: params.categoryId,
    };
  }, [searchParams]);

  // Select images depending on page type
  const images = pageTypes.isEventPage
    ? [activeFeedItem?.cover]
    : (activeFeedItem?.images ?? []);

  // Derived values
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

  // Scroll handling - refs for horizontal list items
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);

  // Function to handle centering the active item
  const centerActiveItem = (index: number) => {
    const scrollContainer = horizontalScrollRef.current;
    const activeElement = itemRefs.current[index];

    if (scrollContainer && activeElement) {
      const containerWidth = scrollContainer.offsetWidth;
      const elementLeft = activeElement.offsetLeft;
      const elementWidth = activeElement.offsetWidth;

      // Calculate the scroll position to center the element
      const scrollLeft = elementLeft - containerWidth / 2 + elementWidth / 2;

      scrollContainer.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  };

  // Center active item when activeIndex changes
  useEffect(() => {
    centerActiveItem(activeIndex);
    setActiveImageIndex(0);
  }, [activeIndex]);

  // Calculate side padding for centering
  const ACTIVE_SIZE = 100;
  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 430;
  const sidePadding = (screenWidth - ACTIVE_SIZE) / 2;

  // Merge refs into one function
  const setRefs = (el: HTMLDivElement | null) => {
    horizontalScrollRef.current = el;
    containerRef.current = el;
  };

  function handleActiveItem(index: number, id: string) {
    setActiveIndex(index);
    if (activeFilterTab === "map") setClickedBusinessId(id);
  }

  return (
    <div className="flex flex-col h-screen mobile">
      {(hideFirstTwoSection || pathname !== pathNames.home) && (
        <MobileNavbar showFilterTab />
      )}

      <div className="relative flex-1" style={{ height: "calc(100vh - 80px)" }}>
        {/* Background Image */}
        {activeFilterTab === "gallery" && (
          <Link
            className="custom-cursor block relative w-full h-full"
            href={`${navigationPaths[pathname]}/${activeFeedItem.slug}`}
          >
            {/* Background Image */}
            <Image
              unoptimized
              fill
              src={
                computedValues.currentImage?.image || staticImages.placeholder
              }
              alt={computedValues.currentImage?.alt || ""}
              className={clsx("object-cover ultra-sharp")}
            />

            {/* Top right actions */}
            <div className="w-[88%] absolute top-30 right-5 flex justify-between text-white z-20">
              <BsThreeDotsVertical size={30} />
              <div className="flex items-center flex-col">
                <BiSolidNavigation size={28} />
                <span className="font-bold">31 ק״מ</span>
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
              {activeFeedItem?.address?.city && (
                <div className="flex items-center gap-2 mt-4">
                  <IconImage icon="location" width={30} height={30} />
                  <span className="text-xl font-bold">
                    {activeFeedItem?.address?.city}
                  </span>
                </div>
              )}
            </div>

            {/* Image carousel controls */}
            {!pageTypes.isEventPage && images.length > 1 && (
              <div className="absolute bottom-40 left-0 right-0 px-4 z-20">
                <ImageCarouselControls
                  iconSize={60}
                  totalImages={images.length}
                  activeIndex={activeImageIndex}
                  setActiveImageIndex={setActiveImageIndex}
                />
              </div>
            )}
          </Link>
        )}

        {/* Map */}
        {activeFilterTab === "map" && <BusinessPinMap mapHeight="90vh" />}

        {/* Horizontal Image List */}
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
