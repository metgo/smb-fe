import { useCallback, useEffect, useState, useRef } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import useGeneralStore from "@/stores/generalStore";
import { clearBusinessContext } from "@/actions/businessActions";

export const useLoadMore = (hasNextPage: boolean = false) => {
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

  const [prevCategoryId, setPrevCategoryId] = useState(categoryId);
  const [prevSubCategoryId, setPrevSubCategoryId] = useState(subCategoryId);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Delay enabling infinite scroll to prevent immediate triggering
    const timer = setTimeout(() => {
      setInitialLoadDone(true);
      setCanLoadMore(true);
    }, 100); // 500ms delay to ensure content is rendered

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
      setCanLoadMore(false); // Disable loading during category change
      setPrevCategoryId(categoryId);
      setPrevSubCategoryId(subCategoryId);

      // Re-enable loading after category change
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

      router.replace(`?${params.toString()}`, { scroll: false });
      setPageCount(nextPage);
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
  ]);

  const [sentryRef] = useInfiniteScroll({
    loading,
    hasNextPage: initialLoadDone && canLoadMore && hasNextPage,
    onLoadMore: loadMore,
    // Adjust rootMargin to trigger when user scrolls to 50% of the viewport height
    // This means it will trigger when the sentry is 50% of viewport height away from the bottom
    rootMargin: "0px 0px 80% 0px",
    disabled: !initialLoadDone || !canLoadMore,
  });

  return {
    sentryRef,
    loading,
    initialLoadDone,
    canLoadMore,
    containerRef,
  };
};
