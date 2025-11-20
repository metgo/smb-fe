"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import useGeneralStore from "@/stores/generalStore";
import { clearBusinessContext } from "@/actions/businessActions";

export const useHorizontalLoadMore = (
  hasNextPage: boolean = false,
  totalItems: number = 0,
  activeIndex: number = 0,
) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { categoryId = "", subCategoryId = "" } = Object.fromEntries(
    searchParams.entries(),
  );
  const { activeFilterTab } = useGeneralStore();

  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [canLoadMore, setCanLoadMore] = useState(false);
  const [lastLoadedIndex, setLastLoadedIndex] = useState(-1);

  const [prevCategoryId, setPrevCategoryId] = useState(categoryId);
  const [prevSubCategoryId, setPrevSubCategoryId] = useState(subCategoryId);

  const containerRef = useRef<HTMLDivElement>(null);

  // Threshold for triggering load more (20 items from the end)
  const LOAD_MORE_THRESHOLD = 20;

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoadDone(true);
      setCanLoadMore(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    return () => {
      clearBusinessContext(pathname);
    };
  }, [pathname]);

  useEffect(() => {
    if (
      categoryId !== prevCategoryId ||
      subCategoryId !== prevSubCategoryId ||
      pathname
    ) {
      setPageCount(1);
      setCanLoadMore(false);
      setLastLoadedIndex(-1);
      setPrevCategoryId(categoryId);
      setPrevSubCategoryId(subCategoryId);

      setTimeout(() => {
        setCanLoadMore(true);
      }, 100);
    }
  }, [categoryId, subCategoryId, prevCategoryId, prevSubCategoryId, pathname]);

  const loadMore = useCallback(async () => {
    if (
      !initialLoadDone ||
      !canLoadMore ||
      loading ||
      !hasNextPage ||
      activeFilterTab === "map"
    ) {
      return;
    }

    setLoading(true);
    try {
      const nextPage = pageCount + 1;
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", nextPage.toString());

      router?.replace(`?${params.toString()}`, { scroll: false });
      setPageCount(nextPage);
      setLastLoadedIndex(activeIndex);
    } catch (error) {
      console.error("Error loading more data:", error);
    } finally {
      setLoading(false);
    }
  }, [
    initialLoadDone,
    canLoadMore,
    loading,
    hasNextPage,
    pageCount,
    searchParams,
    router,
    activeFilterTab,
    activeIndex,
  ]);

  // Check if we need to load more based on active index
  useEffect(() => {
    if (!initialLoadDone || !canLoadMore || loading || !hasNextPage) {
      return;
    }

    const remainingItems = totalItems - activeIndex - 1;
    const shouldLoadMore =
      remainingItems <= LOAD_MORE_THRESHOLD && activeIndex > lastLoadedIndex;

    if (shouldLoadMore) {
      loadMore();
    }
  }, [
    activeIndex,
    totalItems,
    initialLoadDone,
    canLoadMore,
    loading,
    hasNextPage,
    lastLoadedIndex,
    loadMore,
  ]);

  // Horizontal scroll listener (keeping original as fallback)
  useEffect(() => {
    const scrollContainer = containerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollLeft, clientWidth, scrollWidth } = scrollContainer;

      // Trigger when user is within 200px of the end (fallback method)
      if (scrollLeft + clientWidth >= scrollWidth - 200) {
        loadMore();
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  return {
    containerRef,
    loading,
    pageCount,
  };
};
