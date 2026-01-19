/// @typescript-eslint/no-unused-vars

"use client";
import { useEffect, useMemo, useState } from "react";
import useGeneralStore from "@/stores/generalStore";
import { sanitizeInitialFilters } from "@/lib/helpers";

type FilterKey =
  | "categoryIds"
  | "subCategoryIds"
  | "groupTypeIds"
  | "accessibilityIds"
  | "serviceTypes";

type FilterState = Record<FilterKey, string[]>;

const emptyFilters: FilterState = {
  categoryIds: [],
  subCategoryIds: [],
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
      const { sanitized, totalCount } = sanitizeInitialFilters(
        initialSelectedFiltersIds,
        filters,
        aminitiesInfo,
      );

      setFilterState((prev) => ({
        ...prev,
        ...sanitized,
      }));

      setAppliedFilterCount(totalCount);
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

      let updated: FilterState = {
        ...prev,
        [key]: next,
      };

      // Auto-clean subcategories when categories change
      if (key === "categoryIds") {
        const validSubIds =
          filters?.subCategories
            ?.filter((sub) => next.includes(sub.categoryId))
            .map((sub) => sub._id) ?? [];

        updated.subCategoryIds = updated.subCategoryIds.filter((id) =>
          validSubIds.includes(id),
        );

        if (next.length === 0) {
          updated.groupTypeIds = [];
          updated.accessibilityIds = [];
        }
      }

      const total = getTotalAppliedFilters(updated);
      setAppliedFilterCount(total);
      window.scrollTo({ behavior: "smooth", top: 0 });

      return updated;
    });
  };

  const clearParam = (key: FilterKey) => {
    setFilterState((prev) => {
      const updated = {
        ...prev,
        [key]: [],
      };

      if (key === "categoryIds") {
        updated.groupTypeIds = [];
        updated.accessibilityIds = [];
        updated.subCategoryIds = [];
      }

      const total = getTotalAppliedFilters(updated);
      setAppliedFilterCount(total);
      window.scrollTo({ behavior: "smooth", top: 0 });
      return updated;
    });
  };

  const handleResetFilters = () => {
    setFilterState(emptyFilters);
    setAppliedFilterCount(0);
    window.scrollTo({ behavior: "smooth", top: 0 });
  };

  // Filtered subcategories based on selected categories
  const filteredSubCategories = useMemo(() => {
    if (filterState.categoryIds.length === 0) return [];
    return filters?.subCategories?.filter((sub) =>
      filterState.categoryIds.includes(sub.categoryId),
    );
  }, [filterState.categoryIds, filters?.subCategories]);

  return {
    shouldAnimate,
    appliedFilterCount,
    filterState,
    filteredSubCategories,
    getSelected,
    isSelected,
    toggleParam,
    clearParam,
    handleResetFilters,
  };
}
