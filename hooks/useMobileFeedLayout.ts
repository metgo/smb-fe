"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCommonHook } from "./useCommonHooks";
import useGeneralStore from "@/stores/generalStore";
import { useHorizontalLoadMore } from "./useHorizontalLoadMore";
import { pathNames } from "@/lib/endpoints";
import { getPrimaryCategoryId } from "@/lib/helpers";
import { startLoading } from "@/components/wrappers/ProgressBar";
import { navigationPaths } from "@/lib/utils";
import useCategoryStore from "@/stores/categoriesStore";
import { useCtgSubctg } from "./useCtgSubctg";

// Constants
const SWIPE_THRESHOLD = 50;
const SWIPE_DETECTION_THRESHOLD = 10;
const ACTIVE_THUMBNAIL_SIZE = 100;
const INACTIVE_THUMBNAIL_SIZE = 60;
const DEFAULT_SCREEN_WIDTH = 430;

export const useMobileFeedLayout = (businesses: BusinessesProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { isCurrentPage, calculateDistanceTo, deviceHeight } = useCommonHook();
  const {
    hideFirstTwoSection,
    activeFilterTabMobile,
    setClickedBusinessId,
    userLiveLocation,
  } = useGeneralStore();
  const { categories } = useCategoryStore();
  const { activeCategoryKey } = useCtgSubctg();

  // --- State ---
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [feedItems, setFeedItems] = useState<BusinessProps[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  const touchStartYRef = useRef<number | null>(null);
  const [isFackLoading, setIsFackLoading] = useState(true);

  // --- Refs ---
  const isNavigating = useRef(false);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false);

  // --- Computed values ---
  const activeFeedItem = feedItems[activeIndex];

  const { containerRef, loading } = useHorizontalLoadMore(
    businesses?.meta?.hasNextPage,
    feedItems.length,
    activeIndex ?? 0,
  );

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

  const images = useMemo(
    () =>
      pageTypes.isEventPage
        ? [activeFeedItem?.cover]
        : (activeFeedItem?.images ?? []),
    [pageTypes.isEventPage, activeFeedItem],
  );

  const computedValues = useMemo(() => {
    const currentPathname =
      typeof window !== "undefined" ? window.location.pathname : "";

    return {
      primaryCategoryId: getPrimaryCategoryId(
        currentPathname,
        urlParams.activeCategoryKey || "",
        activeFeedItem?.primaryCategoryId ?? "",
      ),
      currentImage: images?.[activeImageIndex],
      shouldShowSkeleton: !hasMounted,
    };
  }, [
    urlParams.activeCategoryKey,
    activeFeedItem?.primaryCategoryId,
    images,
    activeImageIndex,
    hasMounted,
  ]);

  const geoLocation = useMemo(
    () => ({
      lat: Number(activeFeedItem?.geoLocation?.lat) || 0,
      lng: Number(activeFeedItem?.geoLocation?.long) || 0,
    }),
    [activeFeedItem?.geoLocation],
  );

  const screenWidth =
    typeof window !== "undefined" ? window.innerWidth : DEFAULT_SCREEN_WIDTH;
  const sidePadding = (screenWidth - ACTIVE_THUMBNAIL_SIZE) / 2;

  // --- Effects ---
  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    if (businesses.data.length > 0) {
      setFeedItems(businesses?.data);
    }
  }, [businesses]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsFackLoading(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (activeIndex !== null) {
      centerActiveItem(activeIndex);
      setActiveImageIndex(0);
    }
  }, [activeIndex]);

  // --- Handlers ---
  const centerActiveItem = (index: number | null) => {
    if (index === null) return;

    const scrollContainer = horizontalScrollRef.current;
    const activeElement = itemRefs.current[index];

    if (!scrollContainer || !activeElement) return;

    const containerWidth = scrollContainer.offsetWidth;
    const elementLeft = activeElement.offsetLeft;
    const elementWidth = activeElement.offsetWidth;
    const scrollLeft = elementLeft - containerWidth / 2 + elementWidth / 2;

    scrollContainer.scrollTo({ left: scrollLeft, behavior: "smooth" });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    isSwiping.current = false;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    const distance = Math.abs(touchEndX.current - touchStartX.current);

    if (distance > SWIPE_DETECTION_THRESHOLD) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isNavigating.current) {
      setTimeout(() => (isNavigating.current = false), 300);
      return;
    }

    if (!isSwiping.current || activeIndex === null) return;

    const distance = touchStartX.current - touchEndX.current;

    if (Math.abs(distance) > SWIPE_THRESHOLD) {
      setActiveIndex((prev) => {
        if (prev === null) return 0;
        if (distance > 0) {
          return Math.max(prev - 1, 0);
        } else {
          return Math.min(prev + 1, feedItems.length - 1);
        }
      });
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
    isSwiping.current = false;

    if (touchStartYRef.current === null) return;

    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - touchStartYRef.current;

    // Swipe down
    if (deltaY > 30) {
      setIsPanelVisible(false);
    }

    // Swipe up
    if (deltaY < -30) {
      setIsPanelVisible(true);
    }

    touchStartYRef.current = null;
  };

  const handleActiveItem = (index: number, id: string) => {
    setActiveIndex(index);
    setClickedBusinessId(id);
  };

  const handleNavigation = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isSwiping.current || activeFeedItem === null) return;

    isNavigating.current = true;
    startLoading();
    router.push(`${navigationPaths[pathname]}/${activeFeedItem.slug}`);
  };

  const setRefs = (el: HTMLDivElement | null) => {
    horizontalScrollRef.current = el;
    containerRef.current = el;
  };

  const shouldShowNavbar = hideFirstTwoSection || pathname !== pathNames.home;
  const containerHeight = `calc(${deviceHeight}px - 100px)`;

  return {
    INACTIVE_THUMBNAIL_SIZE,
    calculateDistanceTo,
    userLiveLocation,
    loading,
    computedValues,
    geoLocation,
    sidePadding,
    activeIndex,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleActiveItem,
    handleNavigation,
    setRefs,
    shouldShowNavbar,
    containerHeight,
    activeFilterTabMobile,
    activeFeedItem,
    feedItems,
    itemRefs,
    isPanelVisible,
    categories,
    activeCategoryKey,
    isFackLoading,
  };
};
