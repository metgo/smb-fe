// page.tsx (or FeedSection.tsx)
import React from "react";
import Navbar from "@/components/navbar";
import FeedLayout from "./FeedLayout";
import MobileFeedLayout from "../mobile/FeedLayout.mobile";
import { getPresetFilters } from "@/actions/commonActions";
import { getAllFilters, getAllFeeds } from "@/actions/feedActions";

export function getSearchParamsObject(
  searchParams: Record<string, string | undefined>,
) {
  const getArray = (key: string) =>
    searchParams?.[key]?.split(",").filter(Boolean) || [];

  return {
    categoryIds: getArray("categoryIds"),
    subCategoryIds: getArray("subCategoryIds"),
    accessibilityIds: getArray("accessibilityIds"),
    groupTypeIds: getArray("groupTypeIds"),
    serviceTypes: getArray("serviceTypes"),
    page: Number(searchParams?.page ?? 1),
    isAllClear: searchParams?.isAllClear ?? "false",
  };
}

export default async function FeedSection({
  searchParams,
}: {
  searchParams: any;
}) {
  // Convert searchParams to object if it's URLSearchParams
  const searchParamsObj =
    searchParams instanceof URLSearchParams
      ? Object.fromEntries(searchParams.entries())
      : searchParams;

  const params = getSearchParamsObject(searchParamsObj);

  const selectedFiltersIds = {
    categoryIds: params.categoryIds,
    subCategoryIds: params.subCategoryIds,
    groupTypesIds: params.groupTypeIds,
    accessibilitiesIds: params.accessibilityIds,
    serviceTypes: params.serviceTypes,
  };

  const [initialSelectedFiltersIds, filters, businesses] = await Promise.all([
    getPresetFilters(),
    getAllFilters(selectedFiltersIds),
    getAllFeeds(params.page, selectedFiltersIds, params.isAllClear === "true"),
  ]);

  return (
    <section className="relative z-50 bg-white">
      <Navbar showFilterTab />

      <MobileFeedLayout
        businesses={businesses}
        filters={filters}
        initialSelectedFiltersIds={initialSelectedFiltersIds}
      />

      <FeedLayout
        businesses={businesses}
        filters={filters}
        initialSelectedFiltersIds={initialSelectedFiltersIds}
      />
    </section>
  );
}
