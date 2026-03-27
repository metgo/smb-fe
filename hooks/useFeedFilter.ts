/// @typescript-eslint/no-unused-vars

"use client";
import { useEffect, useState } from "react";

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

export default function useFeedFilter() {
  const [filterState, setFilterState] = useState<FilterState>(emptyFilters);

  const [appliedFilterCount, setAppliedFilterCount] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(true);

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
  };
}
