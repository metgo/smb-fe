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
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const totalBusiness = businesses?.totalData;
  const metaData = businesses?.meta


  const [prevCategoryId, setPrevCategoryId] = useState(categoryId);
  const [prevSubCategoryId, setPrevSubCategoryId] = useState(subCategoryId);


  useEffect(() => {
    // Set after initial render
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
    hasNextPage: businesses.meta.hasNextPage,
    onLoadMore: loadMore,
    rootMargin: '0px 0px 600px 0px',
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
      {/* <div className='text-2xl mb-8 font-black fixed right-0 top-20 z-50'>{totalBusiness}</div> */}
      {renderLayout()}
      {initialLoadDone && (businesses.meta.hasNextPage || loading) && (
        <div ref={sentryRef} />
      )}

    </div>
  )
}

export default FilterBusinessLayout