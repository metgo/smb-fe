import React from "react";
import Navbar from "@/components/navbar";

import FeedLayout from "./FeedLayout";
import { getPresetFilters } from "@/actions/commonActions";
import MobileFeedLayout from "../mobile/FeedLayout.mobile";
import { getAllFilters, getAllFeeds } from "@/actions/feedActions";

interface Props {
  searchParams: {
    page?: string;
    categoryIds?: string;
    subCategoryIds?: string;
    accessibilityIds?: string;
    groupTypeIds?: string;
    serviceTypes?: string;
    isAllClear?: string;
  };
}
// src/utils/getSearchParamsObject.ts
export function getSearchParamsObject(searchParams: any) {
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

export default async function FeedSection({ searchParams }: Props) {
  // Parse search params quickly on server into arrays/numbers
  const params = await getSearchParamsObject(searchParams);
  const selectedFiltersIds = {
    categoryIds: params.categoryIds,
    subCategoryIds: params.subCategoryIds,
    groupTypesIds: params.groupTypeIds,
    accessibilitiesIds: params.accessibilityIds,
    serviceTypes: params.serviceTypes,
  };

  // Fetch preset filters, filters and first page of feeds in parallel
  const [initialSelectedFiltersIds, filters, businesses] = await Promise.all([
    getPresetFilters(),
    getAllFilters(selectedFiltersIds),
    getAllFeeds(params.page, selectedFiltersIds, params.isAllClear === "true"),
  ]);

  // Render navbar + client feed components (they receive prepared server data as props)
  return (
    <section className="relative z-50 bg-white">
      <Navbar showFilterTab />

      {/* Mobile version */}
      <MobileFeedLayout
        businesses={businesses}
        filters={filters}
        initialSelectedFiltersIds={initialSelectedFiltersIds}
      />

      {/* Desktop version */}
      <FeedLayout
        businesses={businesses}
        filters={filters}
        initialSelectedFiltersIds={initialSelectedFiltersIds}
      />
    </section>
  );
}
