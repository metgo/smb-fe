/// @typescript-eslint/no-unused-vars

"use client";
import { useEffect, useState } from "react";
import useGeneralStore from "@/stores/generalStore";
import { sanitizeInitialFilters } from "@/lib/helpers";

type FilterKey =
  | "groupTypeIds"
  | "accessibilityIds"
  | "serviceTypes";

type FilterState = Record<FilterKey, string[]>;

const emptyFilters: FilterState = {
  groupTypeIds: [],
  accessibilityIds: [],
  serviceTypes: [],
};

const getTotalAppliedFilters = (filters: FilterState) =>
  Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);

export default function useFeedFilter(
  filters: FiltersResponse,
  initialSelectedFiltersIds: PresetFilterItems,
) {
  const { aminitiesInfo } = useGeneralStore();

  const [filterState, setFilterState] = useState<FilterState>(emptyFilters);

  const [appliedFilterCount, setAppliedFilterCount] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShouldAnimate(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  // ---- APPLY DEFAULT FILTERS ON FIRST LOAD ----
  useEffect(() => {
    try {
      const { sanitized } = sanitizeInitialFilters(
        initialSelectedFiltersIds,
        filters,
        aminitiesInfo,
      );

      setFilterState((prev) => ({
        ...prev,
        ...sanitized,
      }));

      setAppliedFilterCount(0);
    } catch (error) {
      console.error("Error applying default filters:", error);
    }
  }, []);

  const getSelected = (key: FilterKey) => filterState[key] ?? [];

  const isSelected = (key: FilterKey, value: string) =>
    filterState[key]?.includes(value);

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
  };
}
