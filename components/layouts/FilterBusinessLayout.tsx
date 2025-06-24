"use client"

import useGeneralStore from '@/stores/generalStore'
import useInfiniteScroll from "react-infinite-scroll-hook";

import NoBusinessLayout from './NoBusinessLayout'
import OnlyBusinessMapLayout from './OnlyBusinessMapLayout'
import OnlyBusinessCardsLayout from './OnlyBusinessCardsLayout'
import MapBusinessIntegratedLayout from './MapBusinessIntegratedLayout'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation';


const FilterBusinessLayout = (businesses: BusinessesProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeFilterTab } = useGeneralStore()
  const { categoryId = '', subCategoryId = '' } = Object.fromEntries(searchParams.entries());

  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(1);

  const totalBusiness = businesses?.totalData;
  const metaData = businesses?.meta

  const [prevCategoryId, setPrevCategoryId] = useState(categoryId);
  const [prevSubCategoryId, setPrevSubCategoryId] = useState(subCategoryId);

  useEffect(() => {
    if (categoryId !== prevCategoryId || subCategoryId !== prevSubCategoryId) {
      setPageCount(1);
      setPrevCategoryId(categoryId);
      setPrevSubCategoryId(subCategoryId);
    }
  }, [categoryId, subCategoryId, prevCategoryId, prevSubCategoryId]);

  // Fetch data when pageCount changes
  const loadMore = useCallback(async () => {
    if (loading || !metaData.hasNextPage) return;

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
  }, [loading, metaData, pageCount, searchParams, router]);

  const [sentryRef] = useInfiniteScroll({
    loading,
    hasNextPage: businesses.meta.hasNextPage,
    onLoadMore: loadMore,
    rootMargin: '0px 0px 200px 0px',
  });

  if (totalBusiness === 0) {
    return <NoBusinessLayout />
  }

  const renderLayout = () => {
    switch (activeFilterTab) {
      case "gallery":
        return <OnlyBusinessCardsLayout
          data={businesses.data}
          meta={businesses.meta}
          totalData={businesses.totalData}
        />
      case "integrated":
        return <MapBusinessIntegratedLayout
          data={businesses.data}
          meta={businesses.meta}
        />
      case "map":
        return <OnlyBusinessMapLayout />
      default:
        return <NoBusinessLayout />
    }
  }
  return (
    <div>
      {renderLayout()}
      {(businesses.meta.hasNextPage || loading) && (
        <div ref={sentryRef} style={{ textAlign: 'center', padding: '1rem' }}>
          {loading ? 'Loading more...' : 'Scroll to load more'}
        </div>
      )}
    </div>
  )
}

export default FilterBusinessLayout