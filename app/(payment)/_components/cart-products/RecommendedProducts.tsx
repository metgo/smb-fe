import { useEffect, useRef, useState } from "react";

import { urls } from "@/lib/endpoints";
import useCartStore from "@/stores/cartStore";
import { CODE } from "@/constant/envConstants";
import { ProductCard } from "@/components/cards";
import { cartLabels } from "@/constant/hebrew";

const RecommendedProducts = () => {
  const loadingRef = useRef(null);
  const initialCheckDone = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { getUniqueParentIds } = useCartStore();

  const businessIds = getUniqueParentIds();
  const businessIdsString = JSON.stringify(businessIds);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useRef(true);
  const totalItems = useRef(0);
  const isFetching = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchMore = () => {
    if (isFetching.current || isLoading || !hasMore) return;
    fetchProductsInternal();
  };

  const fetchProductsInternal = async () => {
    try {
      isFetching.current = true;
      setIsLoading(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await fetch(
        `${urls.productsList}?businessId=${businessIds[0]}&limit=5&page=${page}&campCode=${CODE}`,
        {
          signal: controller.signal,
        },
      );

      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();

      if (!isMounted.current) return;

      totalItems.current = data.totalData || 0;
      const newProducts: Product[] = data.data || [];

      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p._id));
        const uniqueNewProducts = newProducts.filter(
          (p) => !existingIds.has(p._id),
        );
        return [...prev, ...uniqueNewProducts];
      });

      setHasMore(() => {
        const receivedFullPage = newProducts.length >= 5;
        const underTotalLimit =
          products.length + newProducts.length < totalItems.current;
        return receivedFullPage && underTotalLimit;
      });

      setPage((prev) => prev + 1);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error fetching products:", error);
      }
    } finally {
      isFetching.current = false;
      if (isMounted.current) {
        setIsLoading(false);
      }
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    isMounted.current = true;

    setProducts([]);
    setPage(1);
    setHasMore(true);
    totalItems.current = 0;

    if (businessIds.length > 0) {
      fetchProductsInternal();
    }

    return () => {
      isMounted.current = false;
      abortControllerRef.current?.abort();
    };
  }, [businessIdsString]);

  useEffect(() => {
    if (!loadingRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchMore();
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: "0px 300px 0px 300px", // Extend detection area horizontally
        threshold: 0.1, // Trigger when 10% visible
      },
    );

    observer.observe(loadingRef.current);

    return () => {
      observer.disconnect();
    };
  }, [fetchMore, hasMore, isLoading]);

  useEffect(() => {
    if (
      !scrollContainerRef.current ||
      isLoading ||
      !hasMore ||
      products.length === 0 ||
      initialCheckDone.current
    )
      return;
    const timer = setTimeout(() => {
      const { scrollWidth, clientWidth } = scrollContainerRef.current!;

      if (scrollWidth <= clientWidth) {
        fetchMore();
      }
      initialCheckDone.current = true;
    }, 200);

    return () => clearTimeout(timer);
  }, [products.length, fetchMore, hasMore, isLoading]);

  if (products.length === 0) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-center mt-20 mb-4">
        {cartLabels.youMayAlsoLike}
      </h1>

      <section
        ref={scrollContainerRef}
        className="flex gap-4 mt-4 ms-4 overflow-x-auto max-sm:scroll-smooth max-sm:snap-x max-sm:snap-mandatory scrollbar-hide"
      >
        {products?.map((product) => (
          <div
            key={product._id}
            className="flex-shrink-0 snap-start md:w-[250px] max-sm:w-[220px] sm:w-auto relative"
          >
            <ProductCard
              // isCartPage
              product={product}
              primaryCategoryId={""}
            />
          </div>
        ))}
      </section>
    </div>
  );
};

export default RecommendedProducts;
