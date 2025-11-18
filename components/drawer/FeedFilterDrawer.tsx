"use client";

import { createPortal } from "react-dom";
import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { filterPanelLabels } from "@/constant/hebrew";
import useGeneralStore from "@/stores/generalStore";
import { MotionDialogDiv } from "../ui";
import { startLoading } from "../wrappers/ProgressBar";

import {
  AiIcon,
  AttractionIcon,
  CultureIcon,
  EventIcon,
  FoodIcon,
  FundayIcon,
  GroupUserIcon,
  PointOfInterestIcon,
  RouteIcon,
  SleepIcon,
} from "../ui/svgIcons";

// ---------------- ICON MAP -----------------
const ICON_MAP: Record<string, React.FC<{ strokColor?: string }>> = {
  "6566e31ca77d2a477266d2d6": AttractionIcon,
  "6566e3aaa77d2a477266d314": FoodIcon,
  "6566fd7fa77d2a477266d3ca": CultureIcon,
  "6566fcd4a77d2a477266d3b9": SleepIcon,
};

// ---------------- SERVICE TYPE MAPPING -----------------
const SERVICE_TYPE_MAP = {
  poi: "point_of_interest",
  group_user: "group_user",
  fun_day: "funday",
  event: "event",
  route: "trip",
} as const;

// ---------------- MAIN COMPONENT -----------------
interface FeedFilterDrawerProps {
  isOpen: boolean;
  itemCount: number;
  setIsOpen: (v: boolean) => void;
}

const FeedFilterDrawer: React.FC<FeedFilterDrawerProps> = ({
  isOpen,
  setIsOpen,
  itemCount,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filterItems } = useGeneralStore();

  const categoryId = searchParams.get("categoryId");

  // Always read current URL params (live, never stale)
  const getCurrentParams = () => {
    if (typeof window === "undefined") {
      return new URLSearchParams(searchParams.toString());
    }
    return new URLSearchParams(window.location.search);
  };

  const [paramsState, setParamsState] = React.useState(() =>
    getCurrentParams(),
  );

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

    // update local state immediately
    setParamsState(new URLSearchParams(params));

    startLoading();
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const clearParam = (key: string) => {
    const params = getCurrentParams();
    if (params.has(key)) {
      params.delete(key);
      startLoading();
      router.push(`?${params.toString()}`, { scroll: false });
    }
  };

  // Reset serviceTypes when main category changes
  useEffect(() => {
    if (categoryId) {
      clearParam("serviceTypes");
    }
  }, [categoryId]);

  // Filtered subcategories based on selected main categories
  const selectedCategoryIds = getSelected("categoryIds");
  const filteredSubCategories = React.useMemo(() => {
    if (selectedCategoryIds.length === 0) return [];
    return filterItems.subCategories.filter((sub) =>
      selectedCategoryIds.includes(sub.categoryId),
    );
  }, [selectedCategoryIds, filterItems.subCategories]);

  if (!isOpen) return null;

  return createPortal(
    <MotionDialogDiv
      type="drawer-bottom"
      className="fixed inset-0 z-[9999] w-[405px] bg-white s`hadow-xl flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* HEADER */}
      <div className="flex justify-end items-center px-5 pt-7.5 pb-4 flex-shrink-0">
        <h2 className="text-lg font-bold">
          <span>{itemCount}</span> <span>{filterPanelLabels.results}</span>
        </h2>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto dialog-scrollbar px-5 pb-20">
        {/* MAIN CATEGORIES & SERVICE TYPES */}
        <div className="border-b border-primary py-3">
          <div className="font-bold text-theme">{filterPanelLabels.main}</div>
          <div className="grid grid-cols-12 gap-x-1 gap-y-2 mt-2">
            {/* Point of Interest */}
            {filterItems.displayPOI && (
              <FilterButton
                active={isSelected("serviceTypes", SERVICE_TYPE_MAP.poi)}
                onClick={() =>
                  toggleParam("serviceTypes", SERVICE_TYPE_MAP.poi)
                }
                icon={<PointOfInterestIcon strokColor="#7c7c7c" />}
                activeIcon={<PointOfInterestIcon strokColor="#fff" />}
                label={filterPanelLabels.pointOfInterest}
              />
            )}

            {/* Main Categories */}
            {filterItems?.categories?.slice(0, 4).map((menu) => {
              const Icon = ICON_MAP[menu._id];
              return (
                <FilterButton
                  key={menu._id}
                  active={isSelected("categoryIds", menu._id)}
                  onClick={() => toggleParam("categoryIds", menu._id)}
                  icon={Icon && <Icon strokColor="#7c7c7c" />}
                  activeIcon={Icon && <Icon strokColor="#fff" />}
                  label={menu.name}
                />
              );
            })}

            {/* Businesses */}
            {filterItems.displayBusinesses && (
              <FilterButton
                active={isSelected("serviceTypes", SERVICE_TYPE_MAP.group_user)}
                onClick={() =>
                  toggleParam("serviceTypes", SERVICE_TYPE_MAP.group_user)
                }
                icon={<GroupUserIcon strokColor="#7c7c7c" />}
                activeIcon={<GroupUserIcon strokColor="#fff" />}
                label={filterPanelLabels.groups}
              />
            )}

            {/* Funday */}
            {filterItems.displayFunday && (
              <FilterButton
                active={isSelected("serviceTypes", SERVICE_TYPE_MAP.fun_day)}
                onClick={() =>
                  toggleParam("serviceTypes", SERVICE_TYPE_MAP.fun_day)
                }
                icon={<FundayIcon strokColor="#7c7c7c" />}
                activeIcon={<FundayIcon strokColor="#fff" />}
                label={filterPanelLabels.funDays}
              />
            )}

            {/* Events */}
            {filterItems.displayEvents && (
              <FilterButton
                active={isSelected("serviceTypes", SERVICE_TYPE_MAP.event)}
                onClick={() =>
                  toggleParam("serviceTypes", SERVICE_TYPE_MAP.event)
                }
                icon={<EventIcon strokColor="#7c7c7c" />}
                activeIcon={<EventIcon strokColor="#fff" />}
                label={filterPanelLabels.events}
              />
            )}

            {/* Routes */}
            {filterItems.displayTrips && (
              <FilterButton
                active={isSelected("serviceTypes", SERVICE_TYPE_MAP.route)}
                onClick={() =>
                  toggleParam("serviceTypes", SERVICE_TYPE_MAP.route)
                }
                icon={<RouteIcon strokColor="#7c7c7c" />}
                activeIcon={<RouteIcon strokColor="#fff" />}
                label={filterPanelLabels.routes}
              />
            )}
          </div>
        </div>

        {/* SUBCATEGORIES */}
        {filteredSubCategories.length > 0 && (
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
                  label={item.name}
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
            {filterItems?.accessibilities?.map((item) => (
              <FilterChip
                key={item._id}
                active={isSelected("accessibilitiesIds", item._id)}
                onClick={() => toggleParam("accessibilitiesIds", item._id)}
                label={item.name}
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
            {filterItems?.groupTypes?.map((item) => (
              <FilterChip
                key={item._id}
                active={isSelected("groupTypesIds", item._id)}
                onClick={() => toggleParam("groupTypesIds", item._id)}
                label={item.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CLOSE BUTTON */}
      <div className="px-5 pb-4 flex-shrink-0">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute bottom-4 right-4"
        >
          <AiIcon size={50} />
        </button>
      </div>
    </MotionDialogDiv>,
    document.body,
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
    className={`col-span-4 custom-cursor flex items-center justify-start gap-2 border border-theme rounded-3xl ps-3 h-[42px] transition-all
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
      ${active ? "bg-black text-white" : "text-black"}`}
  >
    {label}
  </span>
);

export default FeedFilterDrawer;
