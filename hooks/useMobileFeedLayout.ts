"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { pathNames } from "@/lib/endpoints";
import { useCtgSubctg } from "./useCtgSubctg";
import { useCommonHook } from "./useCommonHooks";
import useGeneralStore from "@/stores/generalStore";
import { getPrimaryCategoryId } from "@/lib/helpers";
import useCategoryStore from "@/stores/categoriesStore";

export const useMobileFeedLayout = () => {
  const searchParams = useSearchParams();

  const { isCurrentPage, deviceHeight } = useCommonHook();
  const { activeFilterTabMobile } = useGeneralStore();
  const { categories } = useCategoryStore();
  const { activeCategoryKey } = useCtgSubctg();

  // --- State ---
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [feedItems] = useState<BusinessProps[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  const [isFackLoading, setIsFackLoading] = useState(true);

  // --- Refs ---
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);

  // --- Computed values ---
  const activeFeedItem = feedItems[activeIndex];

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
      long: Number(activeFeedItem?.geoLocation?.long) || 0,
    }),
    [activeFeedItem?.geoLocation],
  );

  // --- Effects ---
  useEffect(() => setHasMounted(true), []);

  // useEffect(() => {
  //   if (businesses.data.length > 0) {
  //     setFeedItems(businesses?.data);
  //   }
  // }, [businesses]);

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

  const containerHeight = `calc(${deviceHeight}px - 100px)`;

  return {
    itemRefs,
    computedValues,
    geoLocation,
    activeFilterTabMobile,
    activeFeedItem,
    feedItems,
    activeIndex,
    setActiveIndex,

    categories,
    activeCategoryKey,
    isFackLoading,
    containerHeight,
  };
};
