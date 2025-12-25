import Navbar from "@/components/navbar";
import IntroVideo from "@/components/IntroVideo";
import MainLogo from "@/components/navbar/MainLogo";
import { ScrollSnapWrapper } from "@/components/wrappers";
import HamburgerMenu from "@/components/navbar/HamburgerMenu";
import CurrentTempOfYourCity from "@/components/navbar/CurrentTempOfYourCity";

import MarketingSection from "@/components/marketing/MarketingSection";
import { getMarketing } from "@/actions/marketingAction";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/getQueryClient";
import { getPresetFilters } from "@/actions/commonActions";
import { getAllFilters, getFeedItems } from "@/actions/feedActions";
import FeedLayout from "@/components/layouts/FeedLayout";
import { Suspense } from "react";
import MobileFeedLayout from "@/components/mobile/FeedLayout.mobile";

function parseFeedFilters(params: Record<string, any>): FiltersProps {
  const toArray = (value?: string) =>
    typeof value === "string" && value.length > 0
      ? value.split(",").filter(Boolean)
      : [];

  return {
    categoryIds: toArray(params.categoryIds),
    subCategoryIds: toArray(params.subCategoryIds),
    groupTypesIds: toArray(params.groupTypeIds),
    accessibilitiesIds: toArray(params.accessibilityIds),
    serviceTypes: toArray(params.serviceTypes),
  };
}

export default async function Page({ searchParams }: any) {
  const queryClient = getQueryClient();

  // Convert URLSearchParams to plain object if necessary
  const params =
    searchParams instanceof URLSearchParams
      ? Object.fromEntries(searchParams.entries())
      : searchParams;

  const selectedFiltersIds = parseFeedFilters(params);
  const marketing = await getMarketing();

  await queryClient.prefetchQuery({
    queryKey: ["preset-filters"],
    queryFn: getPresetFilters,
  });

  await queryClient.prefetchQuery({
    queryKey: ["filters", selectedFiltersIds],
    queryFn: () => getAllFilters(selectedFiltersIds),
  });

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["feeds", selectedFiltersIds],
    queryFn: ({ pageParam = 1 }) =>
      getFeedItems(pageParam, selectedFiltersIds, params.isAllClear === "true"),
    initialPageParam: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ScrollSnapWrapper hasMarketing={marketing?.items?.length > 0}>
        <section className="relative">
          <div className="z-20 fixed top-2.5 right-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-20 ">
            <div className="flex items-center gap-5">
              <HamburgerMenu
                openIcon="white-threeline"
                closeIcon="close-white"
              />
              <MainLogo />
            </div>
            <CurrentTempOfYourCity />
          </div>

          <IntroVideo />
        </section>

        <MarketingSection marketing={marketing} />

        <section className="relative z-50 bg-white">
          <Navbar showFilterTab />

          <Suspense>
            <MobileFeedLayout
              isAllClear={params.isAllClear === "true"}
              selectedFiltersIds={selectedFiltersIds}
            />
            <FeedLayout
              isAllClear={params.isAllClear === "true"}
              selectedFiltersIds={selectedFiltersIds}
            />
          </Suspense>
        </section>
      </ScrollSnapWrapper>
    </HydrationBoundary>
  );
}
