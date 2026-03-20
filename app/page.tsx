import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import Navbar from "@/components/navbar";
import IntroVideo from "@/components/IntroVideo";
import MainLogo from "@/components/navbar/MainLogo";
import HamburgerMenu from "@/components/navbar/HamburgerMenu";

import { getMarketing } from "@/actions/marketingAction";
import FeedLayout from "@/components/layouts/FeedLayout";
import { getQueryClient } from "@/lib/getQueryClient";
import { getPresetFilters } from "@/actions/commonActions";
import { getAllFilters, getFeedItems } from "@/actions/feedActions";
import MobileFeedLayout from "@/components/mobile/FeedLayout.mobile";
import MarketingSection from "@/components/marketing/MarketingSection";
import CurrentTempOfYourCity from "@/components/navbar/CurrentTempOfYourCity";
import HomePageClient from "@/components/HomePageClient";

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

type SearchParams = Record<string, string | string[] | undefined>;

function parseFeedFiltersSync(params: SearchParams): FiltersProps {
  const toArray = (value?: string | string[]) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value.split(",").filter(Boolean);
  };

  return {
    categoryIds: toArray(params.categoryIds),
    subCategoryIds: toArray(params.subCategoryIds),
    groupTypesIds: toArray(params.groupTypeIds),
    accessibilitiesIds: toArray(params.accessibilityIds),
    serviceTypes: toArray(params.serviceTypes),
  };
}

/* -------------------------------------------------------
   Marketing Section - Streams with Suspense
------------------------------------------------------- */

async function MarketingSectionWithData() {
  const marketing = await getMarketing();

  if (!marketing?.items?.length) {
    return null;
  }

  return <MarketingSection marketing={marketing} />;
}

/* -------------------------------------------------------
   Feed Section - Streams with Suspense
------------------------------------------------------- */

async function FeedSectionWithData({
  selectedFiltersIds,
  isAllClear,
}: {
  selectedFiltersIds: FiltersProps;
  isAllClear: boolean;
}) {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["preset-filters"],
      staleTime: Infinity,
      queryFn: getPresetFilters,
    }),
    queryClient.prefetchQuery({
      queryKey: ["filters", selectedFiltersIds],
      staleTime: Infinity,
      queryFn: () => getAllFilters(selectedFiltersIds),
    }),
    queryClient.prefetchQuery({
      queryKey: ["feeds"],
      staleTime: Infinity,
      queryFn: () => getFeedItems(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <section className="relative z-50 bg-white">
        <Navbar showFilterTab />
        <MobileFeedLayout
          isAllClear={isAllClear}
          selectedFiltersIds={selectedFiltersIds}
        />
        <FeedLayout selectedFiltersIds={selectedFiltersIds} />
      </section>
    </HydrationBoundary>
  );
}

function FeedSkeleton() {
  return (
    <section className="relative z-50 bg-white min-h-screen">
      <div className="animate-pulse">
        <div className="h-16 bg-gray-100" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-64" />
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------
   Page - Renders IMMEDIATELY, no blocking fetches
------------------------------------------------------- */

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const selectedFiltersIds = parseFeedFiltersSync(params);
  const isAllClear = params?.isAllClear === "true" || false;

  // NO blocking fetches - everything streams with Suspense
  return (
    <HomePageClient>
      {/* Hero Section - Renders IMMEDIATELY */}
      <section className="h-screen relative">
        <div className="z-20 fixed top-2.5 right-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-20">
          <div className="flex items-center gap-5">
            <HamburgerMenu openIcon="white-threeline" closeIcon="close-white" />
            <MainLogo />
          </div>
          <CurrentTempOfYourCity />
        </div>
        <IntroVideo />
      </section>

      {/* Marketing - Streams when ready */}
      <Suspense fallback={null}>
        <MarketingSectionWithData />
      </Suspense>

      {/* Feed - Streams when ready */}
      <Suspense fallback={<FeedSkeleton />}>
        <FeedSectionWithData
          selectedFiltersIds={selectedFiltersIds}
          isAllClear={isAllClear}
        />
      </Suspense>
    </HomePageClient>
  );
}
