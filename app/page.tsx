import { Suspense } from "react";
import { headers } from "next/headers";
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
import ScrollSnapWrapper from "@/components/wrappers/ScrollSnapWrapper";
import LazyFeedSection from "@/components/LazyFeedSection";

// Enable ISR - revalidate every 60 seconds
export const revalidate = 60;

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

type SearchParams = Record<string, string | string[] | undefined>;

function isMobileDevice(userAgent: string): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent,
  );
}

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
   Feed Section - Async component for streaming
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
   Video Section Component
------------------------------------------------------- */

function VideoSection({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="relative h-full">
      <div className="z-20 fixed top-2.5 right-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-20">
        <div className="flex items-center gap-5">
          <HamburgerMenu openIcon="white-threeline" closeIcon="close-white" />
          <MainLogo />
        </div>
        <CurrentTempOfYourCity />
      </div>
      <IntroVideo isMobile={isMobile} />
    </div>
  );
}

/* -------------------------------------------------------
   Page - Marketing check is cached, feed streams
------------------------------------------------------- */

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const selectedFiltersIds = parseFeedFiltersSync(params);
  const isAllClear = params?.isAllClear === "true" || false;

  // If the URL already carries filter state, skip the intro sections and go straight to the feed
  const hasUrlFilters = Boolean(
    params.serviceTypes ||
      params.accessibilityIds ||
      params.groupTypeIds ||
      params.search ||
      params.categories,
  );

  // Detect device from User-Agent header
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  const isMobile = isMobileDevice(userAgent);

  // Check marketing (cached - fast after first load)
  const marketing = await getMarketing();
  const hasMarketing = Boolean(marketing?.items?.length);

  return (
    <ScrollSnapWrapper hasMarketing={hasMarketing} skipToFeed={hasUrlFilters}>
      {[
        // Section 1: Video - renders immediately with correct device video
        <VideoSection key="video" isMobile={isMobile} />,

        // Section 2: Marketing - only if exists
        hasMarketing ? (
          <MarketingSection key="marketing" marketing={marketing!} />
        ) : null,

        // Section 3: Feed - lazy loads when user scrolls to it
        <LazyFeedSection
          key="feed"
          fallback={<FeedSkeleton />}
          loadImmediately={hasUrlFilters}
        >
          <Suspense fallback={<FeedSkeleton />}>
            <FeedSectionWithData
              selectedFiltersIds={selectedFiltersIds}
              isAllClear={isAllClear}
            />
          </Suspense>
        </LazyFeedSection>,
      ]}
    </ScrollSnapWrapper>
  );
}
