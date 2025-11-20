"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { filterLabels, filterPanelLabels } from "@/constant/hebrew";
import { MotionDialogDiv } from "../ui";
import { startLoading } from "../wrappers/ProgressBar";

import {
  AiIcon,
  EventIcon,
  FundayIcon,
  PointOfInterestIcon,
  RouteIcon,
} from "../ui/svgIcons";
import { ICON_MAP, SERVICE_TYPE_MAP } from "@/lib/utils";
import clsx from "clsx";

interface FeedFilterDrawerProps {
  isOpen: boolean;
  itemCount: number;
  filters: FiltersResponse;
  paramsState: URLSearchParams;
  setParamsState: (v: URLSearchParams) => void;
  setIsOpen: (v: boolean) => void;
  appliedFilterCount: number;
  setAppliedFilterCount: (v: number) => void;
}

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

const FeedFilterDrawer: React.FC<FeedFilterDrawerProps> = ({
  isOpen,
  setIsOpen,
  itemCount,
  filters,
  paramsState,
  setParamsState,
  appliedFilterCount,
  setAppliedFilterCount,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryId = searchParams.get("categoryId");

  // Always read current URL params (live, never stale)
  const getCurrentParams = () => {
    if (typeof window === "undefined") {
      return new URLSearchParams(searchParams.toString());
    }
    return new URLSearchParams(window.location.search);
  };

  const getSelected = (key: string) => {
    return paramsState.get(key)?.split(",").filter(Boolean) ?? [];
  };

  const isSelected = (key: string, value: string): boolean => {
    return getSelected(key).includes(value);
  };

  const toggleParam = (key: string, value: string) => {
    const params = new URLSearchParams(paramsState.toString());
    const current = params.get(key)?.split(",").filter(Boolean) ?? [];

    const next = current.includes(value)
      ? current.filter((i) => i !== value)
      : [...current, value];

    if (next.length > 0) params.set(key, next.join(","));
    else params.delete(key);

    const nextParams = new URLSearchParams(params);

    // Remove old isAllClear always
    nextParams.delete("isAllClear");

    // 🔥 Auto-remove child subCategoryIds when categoryIds change
    if (key === "categoryIds") {
      const selectedCategoryIds =
        nextParams.get("categoryIds")?.split(",").filter(Boolean) ?? [];

      const validSubIds =
        filters.subCategories
          ?.filter((sub) => selectedCategoryIds.includes(sub.categoryId))
          .map((sub) => sub._id) ?? [];

      const existingSub =
        nextParams.get("subCategoryIds")?.split(",").filter(Boolean) ?? [];

      const filteredSub = existingSub.filter((id) => validSubIds.includes(id));

      if (filteredSub.length > 0) {
        nextParams.set("subCategoryIds", filteredSub.join(","));
      } else {
        nextParams.delete("subCategoryIds");
      }
    }

    setParamsState(nextParams);

    const totalApplied = getTotalAppliedFilters(nextParams);

    const isAllClear = totalApplied === 0;

    if (isAllClear) {
      router.push(`?isAllClear=true`, { scroll: false });
    } else {
      router.push(`?${nextParams.toString()}`, { scroll: false });
    }

    startLoading();
  };

  const clearParam = (key: string) => {
    const params = getCurrentParams();

    if (params.has(key)) {
      params.delete(key);
      const nextParams = new URLSearchParams(params);
      nextParams.delete("isAllClear");
      setParamsState(nextParams);

      const totalApplied = getTotalAppliedFilters(nextParams);

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

  useEffect(() => {
    if (paramsState) {
      const totalApplied = getTotalAppliedFilters(paramsState);
      setAppliedFilterCount(totalApplied);
    }
  }, [paramsState, setAppliedFilterCount]);

  // Reset serviceTypes when main category changes
  useEffect(() => {
    if (categoryId) {
      clearParam("serviceTypes");
    }
  }, [categoryId]);

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

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 bg-black/10 z-10 custom-cursor"
      />

      {/* DRAWER */}
      <MotionDialogDiv
        type="drawer-right"
        onClick={(e) => e.stopPropagation()}
        className="
        fixed inset-x-0 bottom-0 z-10
        w-full
        sm:max-w-[200px]
        md:max-w-[300px]
        lg:max-w-[400px]
        bg-white shadow-xl flex flex-col h-screen
      "
      >
        {/* HEADER */}
        <div className="flex justify-end items-center mt-24 px-5 pb-2 flex-shrink-0">
          <h2 className="text-lg font-bold">
            <span>{itemCount}</span> <span>{filterPanelLabels.results}</span>
          </h2>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto max-h-[90vh] px-5 pb-20">
          {/* MAIN CATEGORIES & SERVICE TYPES */}
          <div className="border-b border-primary py-3">
            <div className="font-bold text-theme">{filterPanelLabels.main}</div>
            <div className="grid grid-cols-12 gap-x-1 gap-y-2 mt-2">
              {/* Point of Interest */}
              <FilterButton
                active={isSelected("serviceTypes", SERVICE_TYPE_MAP.poi)}
                onClick={() =>
                  toggleParam("serviceTypes", SERVICE_TYPE_MAP.poi)
                }
                icon={<PointOfInterestIcon strokColor="#7c7c7c" />}
                activeIcon={<PointOfInterestIcon strokColor="#fff" />}
                label={filterPanelLabels.pointOfInterest}
              />

              {/* Main Categories */}
              {filters?.categories?.slice(0, 4).map((menu) => {
                const Icon = ICON_MAP[menu._id];
                return (
                  <FilterButton
                    key={menu._id}
                    active={isSelected("categoryIds", menu._id)}
                    onClick={() => toggleParam("categoryIds", menu._id)}
                    icon={Icon && <Icon strokColor="#7c7c7c" />}
                    activeIcon={Icon && <Icon strokColor="#fff" />}
                    label={menu.hebrewName}
                  />
                );
              })}

              {/* Funday */}
              <FilterButton
                active={isSelected("serviceTypes", SERVICE_TYPE_MAP.fun_day)}
                onClick={() =>
                  toggleParam("serviceTypes", SERVICE_TYPE_MAP.fun_day)
                }
                icon={<FundayIcon strokColor="#7c7c7c" />}
                activeIcon={<FundayIcon strokColor="#fff" />}
                label={filterPanelLabels.funDays}
              />

              {/* Events */}
              <FilterButton
                active={isSelected("serviceTypes", SERVICE_TYPE_MAP.event)}
                onClick={() =>
                  toggleParam("serviceTypes", SERVICE_TYPE_MAP.event)
                }
                icon={<EventIcon strokColor="#7c7c7c" />}
                activeIcon={<EventIcon strokColor="#fff" />}
                label={filterPanelLabels.events}
              />

              {/* Routes */}
              <FilterButton
                active={isSelected("serviceTypes", SERVICE_TYPE_MAP.route)}
                onClick={() =>
                  toggleParam("serviceTypes", SERVICE_TYPE_MAP.route)
                }
                icon={<RouteIcon strokColor="#7c7c7c" />}
                activeIcon={<RouteIcon strokColor="#fff" />}
                label={filterPanelLabels.routes}
              />
            </div>
          </div>

          {/* SUBCATEGORIES */}
          {filteredSubCategories && filteredSubCategories.length > 0 && (
            <div className="border-b border-primary py-3">
              <div className="font-bold text-theme">
                {filterPanelLabels.second}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {filteredSubCategories.map((item) => (
                  <FilterChip
                    key={item._id}
                    active={isSelected("subCategoryIds", item._id)}
                    onClick={() => toggleParam("subCategoryIds", item._id)}
                    label={item.hebrewName}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ACCESSIBILITY */}
          <div className="border-b border-primary py-3">
            <div className="font-bold text-theme">
              {filterPanelLabels.accessibility}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {filters?.accessibilities?.map((item) => (
                <FilterChip
                  key={item._id}
                  active={isSelected("accessibilityIds", item._id)}
                  onClick={() => toggleParam("accessibilityIds", item._id)}
                  label={item.hebrewName}
                />
              ))}
            </div>
          </div>

          {/* TARGET AUDIENCE (Group Types) */}
          <div className="border-b border-primary py-3">
            <div className="font-bold text-theme">
              {filterPanelLabels.targetAudiences}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {filters?.groupTypes?.map((item) => (
                <FilterChip
                  key={item._id}
                  active={isSelected("groupTypeIds", item._id)}
                  onClick={() => toggleParam("groupTypeIds", item._id)}
                  label={item.hebrewName}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CLOSE BUTTON */}
        <div className="px-5 pb-4 flex-shrink-0">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute bottom-14 right-4 custom-cursor"
          >
            {appliedFilterCount > 0 && (
              <div className="bg-green-500 absolute left-1 top-1 rounded-full h-[18px] w-[18px] text-[10px] flex items-center justify-center text-white aspect-square border border-white">
                {appliedFilterCount}
              </div>
            )}
            <AiIcon size={68} />
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            disabled={appliedFilterCount === 0}
            className={clsx(
              appliedFilterCount === 0
                ? "cursor-not-allowed text-black/30 "
                : "custom-cursor bg-black/80 w-full text-white font-bold hover:bg-black ",
              " border border-black/20 w-full items-center font-bold text-lightGray mt-4 rounded-xl py-2",
            )}
          >
            {filterLabels.clearEverything}
          </button>
        </div>
      </MotionDialogDiv>
    </>
  );
};

// Reusable Filter Button (for icons)
const FilterButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, activeIcon, label }) => (
  <div
    onClick={onClick}
    className={`md:col-span-6 sm:col-span-12 lg:col-span-4 custom-cursor flex items-center justify-start gap-2 border border-theme rounded-3xl ps-3 h-[42px] transition-all
      ${active ? "bg-black text-white" : "text-theme"}`}
  >
    {active ? activeIcon : icon}
    <span className="text-[12px] font-bold">{label}</span>
  </div>
);

// Reusable Filter Chip
const FilterChip: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
}> = ({ active, onClick, label }) => (
  <span
    onClick={onClick}
    className={`custom-cursor px-5 h-[42px] flex items-center justify-center rounded-3xl text-[12px] font-bold border border-theme transition-all
      ${active ? "bg-black text-white" : "text-theme"}`}
  >
    {label}
  </span>
);

export default FeedFilterDrawer;
