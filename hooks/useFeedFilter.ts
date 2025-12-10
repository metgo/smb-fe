"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sanitizeInitialFilters } from "@/lib/helpers";
import { startLoading } from "@/components/wrappers/ProgressBar";
import useGeneralStore from "@/stores/generalStore";

let applyTimer: NodeJS.Timeout | null = null;

const getTotalAppliedFilters = (params: URLSearchParams) => {
  const keys = [
    "categoryIds",
    "subCategoryIds",
    "groupTypeIds",
    "accessibilityIds",
    "serviceTypes",
  ];

  return keys.reduce((total, key) => {
    const arr = params.get(key)?.split(",").filter(Boolean) ?? [];
    return total + arr.length;
  }, 0);
};

export default function useFeedFilter(
  filters: FiltersResponse,
  initialSelectedFiltersIds: PresetFilterItems,
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { aminitiesInfo } = useGeneralStore();

  const [appliedFilterCount, setAppliedFilterCount] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  const getCurrentParams = () => {
    if (typeof window === "undefined") {
      return new URLSearchParams(searchParams.toString());
    }
    return new URLSearchParams(window.location.search);
  };

  const [paramsState, setParamsState] = useState<URLSearchParams>(() =>
    getCurrentParams(),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldAnimate(false);
    }, 10000); // 2 seconds = animation duration

    return () => clearTimeout(timer);
  }, []);

  // ---- APPLY DEFAULT FILTERS ON FIRST LOAD ----
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const params = getCurrentParams();

      const filterKeys = [
        "categoryIds",
        "subCategoryIds",
        "groupTypeIds",
        "accessibilityIds",
        "serviceTypes",
      ];

      params.set("isFeed", "true");

      // Check if URL already has ANY filters
      const urlHasFilters = filterKeys.some((key) => {
        const val = params.get(key);
        return val && val.trim() !== "";
      });

      if (urlHasFilters) {
        const urlFilterCount = getTotalAppliedFilters(params);
        setAppliedFilterCount(urlFilterCount);
        setParamsState(new URLSearchParams(params));
        return;
      }

      // Apply initialSelectedFiltersIds normally
      const { sanitized, totalCount } = sanitizeInitialFilters(
        initialSelectedFiltersIds,
        filters,
        aminitiesInfo,
      );
      setAppliedFilterCount(totalCount);

      let shouldUpdate = false;

      Object.entries(sanitized).forEach(([key, values]) => {
        if (!Array.isArray(values) || values.length === 0) return;
        const existing = params.get(key);
        if (!existing || existing.trim() === "") {
          params.set(key, values.join(","));
          shouldUpdate = true;
        }
      });

      if (shouldUpdate) {
        const nextParams = new URLSearchParams(params);
        setParamsState(nextParams);
        router.replace(`?${nextParams.toString()}`, { scroll: false });
      }
    } catch (error) {
      console.error("Error applying default filters:", error);
    }
  }, []);

  useEffect(() => {
    const newParams = getCurrentParams();

    const hasServiceType = newParams.get("serviceTypes");
    const redirectType = newParams.get("redirect");

    if (hasServiceType && redirectType) {
      //  Clear ALL other filters when serviceTypes exists
      const keysToClear = [
        "categoryIds",
        "subCategoryIds",
        "groupTypeIds",
        "accessibilityIds",
        "redirect",
      ];
      newParams.set("isFeed", "true");

      let modified = false;

      keysToClear.forEach((key) => {
        if (newParams.has(key)) {
          newParams.delete(key);
          modified = true;
        }
      });

      if (modified) {
        setParamsState(new URLSearchParams(newParams));
        setAppliedFilterCount(getTotalAppliedFilters(newParams));
        router.replace(`?${newParams.toString()}`, { scroll: false });
        return; // stop further state overwrite
      }
    }

    // Sync normally when no serviceTypes override is needed
    setParamsState((prev) => {
      if (prev.toString() === newParams.toString()) return prev;
      return new URLSearchParams(newParams);
    });

    setAppliedFilterCount(getTotalAppliedFilters(newParams));
  }, [searchParams]);

  // Always read current URL params (live, never stale)

  const getSelected = (key: string) => {
    return paramsState.get(key)?.split(",").filter(Boolean) ?? [];
  };

  const isSelected = (key: string, value: string): boolean => {
    return getSelected(key).includes(value);
  };

  const toggleParam = (key: string, value: string) => {
    const params = new URLSearchParams(paramsState.toString());
    const current = params.get(key)?.split(",").filter(Boolean) ?? [];

    // Toggle logic
    const next = current.includes(value)
      ? current.filter((i) => i !== value)
      : [...current, value];

    // ⭐ SPECIAL RULE: Remove "business" if any other serviceType is selected
    if (key === "serviceTypes") {
      const BUSINESS_ID = "business"; // update with your real ID if needed

      const hasBusiness = next.includes(BUSINESS_ID);
      const hasOther = next.some((id) => id !== BUSINESS_ID);

      // If "business" + any another serviceType → remove "business"
      if (hasBusiness && hasOther) {
        const cleaned = next.filter((id) => id !== BUSINESS_ID);
        next.length = 0;
        next.push(...cleaned);
      }
    }

    // Apply next values to params
    if (next.length > 0) params.set(key, next.join(","));
    else params.delete(key);

    const nextParams = new URLSearchParams(params);
    nextParams.delete("isAllClear");

    // Auto-clean subcategories when categories change
    if (key === "categoryIds") {
      const selectedCats =
        nextParams.get("categoryIds")?.split(",")?.filter(Boolean) ?? [];

      const validSub =
        filters?.subCategories
          ?.filter((sub) => selectedCats?.includes(sub.categoryId))
          .map((sub) => sub._id) ?? [];

      const existingSub =
        nextParams.get("subCategoryIds")?.split(",").filter(Boolean) ?? [];

      const filteredSub = existingSub.filter((id) => validSub.includes(id));

      if (filteredSub.length > 0)
        nextParams.set("subCategoryIds", filteredSub.join(","));
      else nextParams.delete("subCategoryIds");

      if (selectedCats.length === 0) {
        nextParams.delete("groupTypeIds");
        nextParams.delete("accessibilityIds");
      }
    }

    // Update local state immediately
    setParamsState(nextParams);

    // Clear old debounce timer
    if (applyTimer) clearTimeout(applyTimer);

    // Debounced apply: wait 2 seconds after last click
    applyTimer = setTimeout(() => {
      const totalApplied = getTotalAppliedFilters(nextParams);
      setAppliedFilterCount(totalApplied);

      const isAllClear = totalApplied === 0;

      // Ensure isFeed=true is present exactly once
      nextParams.set("isFeed", "true");
      if (isAllClear) {
        // When all filters are cleared, go to clean state but keep isFeed
        router.push(`?isFeed=true&isAllClear=true`, { scroll: false });
      } else {
        // Remove isAllClear if present, and push current params + isFeed=true
        nextParams.delete("isAllClear");
        router.push(`?${nextParams.toString()}`, { scroll: false });
      }

      startLoading();
    }, 2000);
  };

  const clearParam = (key: string) => {
    const params = getCurrentParams();

    if (params.has(key)) {
      params.delete(key);
      const nextParams = new URLSearchParams(params);
      nextParams.delete("isAllClear");

      //  Remove groupTypes & accessibilities if categories cleared
      if (key === "categoryIds") {
        nextParams.delete("groupTypeIds");
        nextParams.delete("accessibilityIds");
      }

      setParamsState(nextParams);

      const totalApplied = getTotalAppliedFilters(nextParams);
      setAppliedFilterCount(totalApplied);

      if (totalApplied === 0) {
        router.push(`?isAllClear=true`, { scroll: false });
      } else {
        router.push(`?isAllClear=false&${nextParams.toString()}`, {
          scroll: false,
        });
      }

      startLoading();
    }
  };

  // Filtered subcategories based on selected main categories
  const selectedCategoryIds = getSelected("categoryIds");

  const filteredSubCategories = React.useMemo(() => {
    if (selectedCategoryIds?.length === 0) return [];
    return filters?.subCategories?.filter((sub) =>
      selectedCategoryIds?.includes(sub?.categoryId),
    );
  }, [selectedCategoryIds, filters?.subCategories]);

  function handleResetFilters() {
    const nextParams = new URLSearchParams();
    setParamsState(nextParams);
    setAppliedFilterCount(0);
    router.push(`?isAllClear=true`, { scroll: false });
    startLoading();
  }

  return {
    shouldAnimate,
    appliedFilterCount,
    filteredSubCategories,
    getSelected,
    isSelected,
    toggleParam,
    clearParam,
    handleResetFilters,
  };
}
