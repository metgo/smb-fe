/// @typescript-eslint/no-unused-vars

"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import useGeneralStore from "@/stores/generalStore";
import useFavoriteFeedItemStore from "@/stores/favoriteFeedItemStore";
import { getAllFilters, getFeedItems } from "@/actions/feedActions";

type FilterKey = "groupTypeIds" | "accessibilityIds" | "serviceTypes";

type FilterState = Record<FilterKey, string[]>;

const emptyFilters: FilterState = {
  groupTypeIds: [],
  accessibilityIds: [],
  serviceTypes: [],
};

const getTotalAppliedFilters = (filters: FilterState) => {
  return Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);
};

export default function useFeedFilter(selectedFiltersIds: FiltersProps) {
  const [filterState, setFilterState] = useState<FilterState>(emptyFilters);

  const [appliedFilterCount, setAppliedFilterCount] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  const {
    activeFilterTab,
    hideFirstTwoSection,
    setIsFilterDrawerOpen,
    isFilterDrawerOpen,
    showFavoriteFeedItems,
    setShowFavoriteFeedItems,
    selectedSiteCategories,
    feedFilterState,
    feedSearchKeyword,
    resetFeedFilters,
    setHideFirstTwoSection,
  } = useGeneralStore();

  const { favoriteFeedItemIds, handleFilterTooltipShown } =
    useFavoriteFeedItemStore();

  const { data: filters } = useQuery({
    queryKey: ["filters", selectedFiltersIds],
    queryFn: () => getAllFilters(selectedFiltersIds),
  });

  const { data: infiniteData } = useQuery({
    queryKey: ["feeds"],
    queryFn: () => getFeedItems(),
  });

  const businesses = infiniteData?.data || [];

  const totalBusiness = businesses?.length;

  const visibleFeedItems = useMemo(() => {
    if (businesses?.length === 0) return [];

    let items = businesses;

    if (selectedSiteCategories.length > 0) {
      const allowedIds = new Set(
        selectedSiteCategories.flatMap((cat) => cat.businessIds),
      );
      const allowedProdIds = new Set(
        selectedSiteCategories.flatMap((cat) => cat.productIds),
      );
      items = items.filter(
        (item) =>
          allowedIds.has(item.businessId) || allowedProdIds.has(item.productId),
      );
    }

    if (feedFilterState.serviceTypes.length > 0) {
      items = items.filter((item) =>
        feedFilterState.serviceTypes.includes(item.serviceType),
      );
    }

    if (feedFilterState.accessibilityIds.length > 0) {
      items = items.filter((item) =>
        feedFilterState.accessibilityIds.some((id) =>
          (item as any).accessibilitiesId?.some(
            (a: any) => (a._id ?? a) === id,
          ),
        ),
      );
    }

    if (feedFilterState.groupTypeIds.length > 0) {
      items = items.filter((item) =>
        feedFilterState.groupTypeIds.some((id) =>
          (item as any).groupTypesId?.some((g: any) => (g._id ?? g) === id),
        ),
      );
    }

    if (feedSearchKeyword.trim()) {
      const keyword = feedSearchKeyword.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.name?.toLowerCase().includes(keyword) ||
          item.description?.toLowerCase().includes(keyword) ||
          item.address?.city?.toLowerCase().includes(keyword) ||
          item.address?.address?.toLowerCase().includes(keyword),
      );
    }

    if (showFavoriteFeedItems && favoriteFeedItemIds?.length > 0) {
      return items.filter((item) => favoriteFeedItemIds.includes(item._id));
    }

    return items;
  }, [
    businesses,
    showFavoriteFeedItems,
    favoriteFeedItemIds,
    selectedSiteCategories,
    feedFilterState,
    feedSearchKeyword,
  ]);

  // -----
  useEffect(() => {
    const timer = setTimeout(() => setShouldAnimate(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  const getSelected = (key: FilterKey) => filterState[key] ?? [];

  const isSelected = (key: FilterKey, value: string) => {
    return filterState[key]?.includes(value);
  };

  const toggleParam = (key: FilterKey, value: string) => {
    setFilterState((prev) => {
      const current = prev[key] ?? [];

      let next = current.includes(value)
        ? current.filter((i) => i !== value)
        : [...current, value];

      // SPECIAL RULE: serviceTypes
      if (key === "serviceTypes") {
        const BUSINESS_ID = "business";
        const hasBusiness = next.includes(BUSINESS_ID);
        const hasOther = next.some((id) => id !== BUSINESS_ID);

        if (hasBusiness && hasOther) {
          next = next.filter((id) => id !== BUSINESS_ID);
        }
      }

      const updated: FilterState = {
        ...prev,
        [key]: next,
      };

      const total = getTotalAppliedFilters(updated);
      setAppliedFilterCount(total);
      // window.scrollTo({ behavior: "smooth", top: 0 });

      return updated;
    });
  };

  const initFiltersFromURL = () => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const keys: FilterKey[] = [
      "groupTypeIds",
      "accessibilityIds",
      "serviceTypes",
    ];

    const hasAnyParam = keys.some((key) => params.has(key));
    console.log("🚀 ~ initFiltersFromURL ~ hasAnyParam:", hasAnyParam);
    if (!hasAnyParam) return; // ← no URL params, keep state as is

    setFilterState((prev) => {
      const updated = { ...prev };

      keys.forEach((key) => {
        const values = params.getAll(key);
        if (values.length === 0) return;

        // Apply same serviceTypes special rule
        if (key === "serviceTypes") {
          const BUSINESS_ID = "business";
          const hasBusiness = values.includes(BUSINESS_ID);
          const hasOther = values.some((id) => id !== BUSINESS_ID);

          updated[key] =
            hasBusiness && hasOther
              ? values.filter((id) => id !== BUSINESS_ID)
              : values;
        } else {
          updated[key] = values;
        }
      });

      const total = getTotalAppliedFilters(updated);
      setAppliedFilterCount(total);

      return updated;
    });
  };

  const clearParam = (key: FilterKey) => {
    setFilterState((prev) => {
      const updated = {
        ...prev,
        [key]: [],
      };

      window.scrollTo({ behavior: "smooth", top: 0 });
      const total = getTotalAppliedFilters(updated);
      setAppliedFilterCount(total);
      return updated;
    });
  };

  const handleResetFilters = () => {
    window.scrollTo({ behavior: "smooth", top: 0 });
    setFilterState(emptyFilters);
    setAppliedFilterCount(0);
  };

  return {
    shouldAnimate,
    appliedFilterCount,
    filterState,
    getSelected,
    isSelected,
    toggleParam,
    clearParam,
    handleResetFilters,
    initFiltersFromURL,

    activeFilterTab,
    hideFirstTwoSection,
    setIsFilterDrawerOpen,
    isFilterDrawerOpen,
    showFavoriteFeedItems,
    setShowFavoriteFeedItems,
    selectedSiteCategories,
    feedFilterState,
    feedSearchKeyword,
    resetFeedFilters,

    filters,
    totalBusiness,
    visibleFeedItems,
    infiniteData,
    handleFilterTooltipShown,
    setHideFirstTwoSection,
  };
}
