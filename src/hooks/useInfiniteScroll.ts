import { useEffect } from "react";

interface UseInfiniteScrollProps {
  ref: React.RefObject<HTMLElement | null>;
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
  threshold?: number; // optional
}

export function useInfiniteScroll({
  ref,
  hasMore = false, //if more data is available
  isLoading = false, //api data
  onLoadMore, //increment page count
  threshold = 50,
}: UseInfiniteScrollProps) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !onLoadMore || !hasMore) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;

      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        if (!isLoading && hasMore) {
          onLoadMore();
        }
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [ref, hasMore, isLoading, onLoadMore, threshold]);
}
