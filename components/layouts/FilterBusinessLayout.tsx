"use client";

import Image from "next/image";
import useGeneralStore from "@/stores/generalStore";
import { useCallback, useEffect, useRef, useState } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { useSearchParams, useRouter } from "next/navigation";

import NoBusinessLayout from "./NoBusinessLayout";
import OnlyBusinessMapLayout from "./OnlyBusinessMapLayout";
import OnlyBusinessCardsLayout from "./OnlyBusinessCardsLayout";
import MapBusinessIntegratedLayout from "./MapBusinessIntegratedLayout";

interface Props {
  businesses: BusinessesProps;
}

const FilterBusinessLayout = ({ businesses }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeFilterTab } = useGeneralStore();
  const { categoryId = "", subCategoryId = "" } = Object.fromEntries(
    searchParams.entries(),
  );

  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const totalBusiness = businesses?.totalData;
  const metaData = businesses?.meta;

  const [prevCategoryId, setPrevCategoryId] = useState(categoryId);
  const [prevSubCategoryId, setPrevSubCategoryId] = useState(subCategoryId);

  const triggerRef = useRef(null);

  useEffect(() => {
    setInitialLoadDone(true);
  }, []);

  useEffect(() => {
    if (categoryId !== prevCategoryId || subCategoryId !== prevSubCategoryId) {
      setPageCount(1);
      setPrevCategoryId(categoryId);
      setPrevSubCategoryId(subCategoryId);
    }
  }, [categoryId, subCategoryId, prevCategoryId, prevSubCategoryId]);

  const loadMore = useCallback(async () => {
    if (!initialLoadDone || loading || !metaData.hasNextPage) return;

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
  }, [initialLoadDone, loading, metaData, pageCount, searchParams, router]);

  const [sentryRef] = useInfiniteScroll({
    loading,
    hasNextPage: businesses?.meta?.hasNextPage,
    onLoadMore: loadMore,
    rootMargin: "0px 0px 800px 0px",
  });

  const renderLayout = () => {
    switch (activeFilterTab) {
      case "gallery":
        return <OnlyBusinessCardsLayout data={businesses.data} />;
      case "integrated":
        return <MapBusinessIntegratedLayout data={businesses.data} />;
      case "map":
        return <OnlyBusinessMapLayout />;
      default:
        return <NoBusinessLayout />;
    }
  };
  return (
    <div>
      {totalBusiness ? (
        <div className="bg-primary">
          {renderLayout()}
          <div style={{ height: "10px", position: "relative" }}>
            <div
              ref={triggerRef}
              style={{ position: "absolute", top: 0, height: 1 }}
            />
          </div>

          {initialLoadDone && businesses?.meta?.hasNextPage && (
            <div ref={sentryRef}></div>
          )}
        </div>
      ) : (
        <NoBusinessLayout />
      )}

      {activeFilterTab === "gallery" && (
        <Image
          width={300}
          height={300}
          alt="Yellow image"
          src="/images/yellow.png"
          className="fixed -bottom-12 -left-30 rotate-[40deg] z-50"
        />
      )}
    </div>
  );
};

export default FilterBusinessLayout;
