import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import Navbar from "@/components/navbar";
import IntroVideo from "@/components/IntroVideo";
import MainLogo from "@/components/navbar/MainLogo";
import { ScrollSnapWrapper } from "@/components/wrappers";
import HamburgerMenu from "@/components/navbar/HamburgerMenu";

import { getMarketing } from "@/actions/marketingAction";
import FeedLayout from "@/components/layouts/FeedLayout";
import { getQueryClient } from "@/lib/getQueryClient";
import { getPresetFilters } from "@/actions/commonActions";
import { getAllFilters, getFeedItemIds } from "@/actions/feedActions";
import MobileFeedLayout from "@/components/mobile/FeedLayout.mobile";
import MarketingSection from "@/components/marketing/MarketingSection";
import CurrentTempOfYourCity from "@/components/navbar/CurrentTempOfYourCity";

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

type SearchParams = Record<string, string | string[] | undefined>;

async function parseFeedFilters(
  searchParams: Promise<SearchParams>,
): Promise<FiltersProps> {
  const params = await searchParams;

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
   Page
------------------------------------------------------- */

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const queryClient = getQueryClient();

  const selectedFiltersIds = await parseFeedFilters(searchParams);
  const params = await searchParams;
  const isAllClear = params?.isAllClear === "true" || false;

  const marketing = await getMarketing();

  await queryClient.prefetchQuery({
    queryKey: ["preset-filters"],
    queryFn: getPresetFilters,
    staleTime: Infinity,
  });

  await queryClient.prefetchQuery({
    queryKey: ["filters", selectedFiltersIds],
    queryFn: () => getAllFilters(selectedFiltersIds),
    staleTime: Infinity,
  });

  await queryClient.prefetchQuery({
    queryKey: ["feedIds"],
    queryFn: () => getFeedItemIds(),
    staleTime: Infinity,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ScrollSnapWrapper hasMarketing={marketing?.items?.length > 0}>
        {/* ---------------- Hero Section ---------------- */}
        <section className="relative">
          <div className="z-20 fixed top-2.5 right-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-20">
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

        {/* ---------------\- Marketing ---------------- */}
        <MarketingSection marketing={marketing} />

        {/* ---------------- Feed ---------------- */}
        <section className="relative z-50 bg-white">
          <Navbar showFilterTab />

          {/* <Suspense> */}
          <MobileFeedLayout
            isAllClear={isAllClear}
            selectedFiltersIds={selectedFiltersIds}
          />

          <FeedLayout selectedFiltersIds={selectedFiltersIds} />
          {/* </Suspense> */}
        </section>
      </ScrollSnapWrapper>
    </HydrationBoundary>
  );
}
