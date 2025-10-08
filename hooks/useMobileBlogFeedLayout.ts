import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useHorizontalLoadMore } from "./useHorizontalLoadMore";
import { shuffleArray } from "@/lib/helpers";
import { startLoading } from "@/components/wrappers/ProgressBar";
import { navigationPaths } from "@/lib/utils";

// Constants
const SWIPE_THRESHOLD = 50;
const SWIPE_DETECTION_THRESHOLD = 10;
const ACTIVE_THUMBNAIL_SIZE = 100;
const DEFAULT_SCREEN_WIDTH = 430;

export const useMobileBlogFeedLayout = (blogs: BlogFeed[]) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State
  const [activeIndex, setActiveIndex] = useState(0);
  const [feedItems, setFeedItems] = useState<BlogFeed[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

  // Refs
  const isNavigating = useRef(false);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false);

  // Computed values
  const activeFeedItem = feedItems[activeIndex];

  const { containerRef, loading } = useHorizontalLoadMore(
    false,
    feedItems.length,
    activeIndex,
  );

  const urlParams = useMemo(() => {
    const params = Object.fromEntries(searchParams.entries());
    return {
      categoryId: params.categoryId || "",
      subCategoryId: params.subCategoryId || "",
      activeCategoryKey: params.categoryId,
    };
  }, [searchParams]);

  const images = activeFeedItem?.images ?? [];

  const computedValues = useMemo(() => {
    return {
      primaryCategoryId: "",
      currentImage: images?.[activeImageIndex],
      shouldShowSkeleton: !hasMounted,
    };
  }, [urlParams.activeCategoryKey, images, activeImageIndex, hasMounted]);

  const screenWidth =
    typeof window !== "undefined" ? window.innerWidth : DEFAULT_SCREEN_WIDTH;
  const sidePadding = (screenWidth - ACTIVE_THUMBNAIL_SIZE) / 2;

  // Effects
  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    if (blogs) {
      setActiveIndex(0);
      setFeedItems(shuffleArray(blogs));
    }
  }, [blogs]);

  useEffect(() => {
    centerActiveItem(activeIndex);
    setActiveImageIndex(0);
  }, [activeIndex]);

  // Handlers
  const centerActiveItem = (index: number) => {
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
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    const distance = Math.abs(touchEndX.current - touchStartX.current);

    if (distance > SWIPE_DETECTION_THRESHOLD) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = () => {
    if (isNavigating.current) {
      setTimeout(() => (isNavigating.current = false), 300);
      return;
    }

    if (!isSwiping.current) return;

    const distance = touchStartX.current - touchEndX.current;

    if (Math.abs(distance) > SWIPE_THRESHOLD) {
      if (distance > 0) {
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else {
        setActiveIndex((prev) => Math.min(prev + 1, feedItems.length - 1));
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
    isSwiping.current = false;
  };

  const handleActiveItem = (index: number) => {
    setActiveIndex(index);
  };

  const handleNavigation = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isSwiping.current) return;

    isNavigating.current = true;
    startLoading();
    router.push(`${navigationPaths[pathname]}/${activeFeedItem._id}`);
  };

  const setRefs = (el: HTMLDivElement | null) => {
    horizontalScrollRef.current = el;
    containerRef.current = el;
  };

  return {
    loading,
    computedValues,
    sidePadding,
    activeIndex,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,

    handleActiveItem,
    handleNavigation,
    setRefs,

    activeFeedItem,
    feedItems,
    itemRefs,
  };
};
