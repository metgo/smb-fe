import { useCallback, useEffect, useState } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { useSearchParams, useRouter } from "next/navigation";

export const useLoadMore = (hasNextPage: boolean = false) => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const { categoryId = "", subCategoryId = "" } = Object.fromEntries(
    searchParams.entries(),
  );

  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [canLoadMore, setCanLoadMore] = useState(false);

  const [prevCategoryId, setPrevCategoryId] = useState(categoryId);
  const [prevSubCategoryId, setPrevSubCategoryId] = useState(subCategoryId);

  useEffect(() => {
    // Delay enabling infinite scroll to prevent immediate triggering
    const timer = setTimeout(() => {
      setInitialLoadDone(true);
      setCanLoadMore(true);
    }, 500); // 500ms delay to ensure content is rendered

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (categoryId !== prevCategoryId || subCategoryId !== prevSubCategoryId) {
      setPageCount(1);
      setCanLoadMore(false); // Disable loading during category change
      setPrevCategoryId(categoryId);
      setPrevSubCategoryId(subCategoryId);

      // Re-enable loading after category change
      setTimeout(() => {
        setCanLoadMore(true);
      }, 500);
    }
  }, [categoryId, subCategoryId, prevCategoryId, prevSubCategoryId]);

  const loadMore = useCallback(async () => {
    if (!initialLoadDone || !canLoadMore || loading || !hasNextPage) {
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
  ]);

  const [sentryRef] = useInfiniteScroll({
    loading,
    hasNextPage: initialLoadDone && canLoadMore && hasNextPage,
    onLoadMore: loadMore,
    rootMargin: "0px 0px 200px 0px", // Reduced from 800px to 200px
    disabled: !initialLoadDone || !canLoadMore, // Explicitly disable when not ready
  });

  return {
    sentryRef,
    loading,
    initialLoadDone,
    canLoadMore,
  };
};
