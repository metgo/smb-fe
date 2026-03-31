"use client";

import clsx from "clsx";
import { useState } from "react";
import { IconImage } from "../ui";
import { filterPanelLabels, searchText } from "@/constant/hebrew";
import { motion } from "motion/react";

import {
  EventIcon,
  FundayIcon,
  PointOfInterestIcon,
  RouteIcon,
} from "../ui/svgIcons";
import { SERVICE_TYPE_MAP } from "@/lib/utils";
import useGeneralStore, { FeedFilterKey } from "@/stores/generalStore";
import { sendGAEvent, triggerName } from "@/lib/googleEventsConfig";
import { Building, ChevronDown, RotateCcw } from "lucide-react";
import { CATEGORY_COLORS } from "@/components/layouts/FeedCategoryButtons";


interface FeedFilterDrawerProps {
  filters: FiltersResponse;
  visibleFeedItems?: any;
  isInline?: boolean;
}

const FeedFilterDrawer: React.FC<FeedFilterDrawerProps> = ({
  filters,
  visibleFeedItems,
  isInline = false,
}) => {
  const {
    aminitiesInfo,
    presetFeedFilters,
    feedFilterState,
    toggleFeedFilter,
    toggleSiteCategory,
    selectedSiteCategories,
    feedSearchKeyword,
    setFeedSearchKeyword,
    resetFeedFilters,
    clearSiteCategories,
  } = useGeneralStore();
  const [advancedFilter, setAdvancedFilter] = useState(false);
  const [inputValue, setInputValue] = useState(feedSearchKeyword);

  const isSelected = (key: FeedFilterKey, value: string) =>
    feedFilterState[key]?.includes(value) ?? false;

  const toggleParam = (key: FeedFilterKey, value: string) =>
    toggleFeedFilter(key, value);

  const handleResetFilters = () => {
    resetFeedFilters();
    clearSiteCategories();
    setFeedSearchKeyword("");
  };

  const hasActiveFilters =
    //  Check other arrays (exclude serviceTypes)
    Object.entries(feedFilterState).some(([key, arr]) => {
      return key !== "serviceTypes" && Array.isArray(arr) && arr.length > 0;
    }) ||
    //  Check serviceTypes only if it has values OUTSIDE the default 3
    (Array.isArray(feedFilterState.serviceTypes) &&
      feedFilterState.serviceTypes.length > 0 &&
      feedFilterState.serviceTypes.some(
        (type) => !["event", "business", "funday"].includes(type),
      )) ||
    feedSearchKeyword.length > 0 ||
    selectedSiteCategories.length > 0;


  return (
    <motion.div
      key="inline-filter"
      initial={{ opacity: 0, x: 40, width: 0 }}
      animate={{ opacity: 1, x: 0, width: 500 }}
      exit={{ opacity: 0, x: 40, width: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="sticky top-24 self-start shrink-0"
      style={{ width: 320 }}
    >
      <div className={clsx("bg-white rounded-2xl shadow-xl flex flex-col max-h-[88vh] overflow-hidden w-[450px]", !isInline && "fixed bottom-4 right-2")}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
              <span className="font-bold text-3xl text-black">
                {filterPanelLabels.searchText}
              </span>
              <div className="flex justify-center items-center gap-3">
                <span className="text-sm text-gray-500">
                  {visibleFeedItems?.length} {filterPanelLabels.results}
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className={clsx(
                      "custom-cursor hover:bg-cyan-600",
                      "bg-cyan-500 text-white font-bold rounded-lg px-4 py-1.5 text-sm flex items-center gap-1.5 transition-colors",
                    )}
                  >
                    <span className="text-base">
                      <RotateCcw className="h-4 w-4" />
                    </span>
                    {filterPanelLabels.clearAll}
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable filter body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div className="flex items-start justify-center py-2">
                {/* Search Button */}
                <div className="w-7xl rounded-xl border border-gray-100 flex items-center gap-2 px-4 py-2">
                  <IconImage
                    icon="search"
                    onClick={() => setFeedSearchKeyword(inputValue)}
                  />
                  <input
                    type="text"
                    value={inputValue}
                    placeholder={searchText.search}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && setFeedSearchKeyword(inputValue)
                    }
                    className="w-full outline-none border-none focus:ring-0"
                  />
                  {inputValue && (
                    <IconImage
                      height={18}
                      width={18}
                      icon="circular-close-white"
                      onClick={() => {
                        setInputValue("");
                        setFeedSearchKeyword("");
                      }}
                    />
                  )}
                </div>
              </div>
              {/* MAIN CATEGORIES & SERVICE TYPES */}
              <div>
                <div className="font-bold text-gray-800 mb-2">
                  {filterPanelLabels.main}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {aminitiesInfo?.business && (
                    <FilterButton
                      active={isSelected(
                        "serviceTypes",
                        SERVICE_TYPE_MAP.business,
                      )}
                      onClick={() => {
                        toggleParam("serviceTypes", SERVICE_TYPE_MAP.business);
                        sendGAEvent(triggerName.clickToServiceType, {
                          service_types: filterPanelLabels.business,
                        });
                      }}
                      icon={<Building />}
                      activeIcon={<Building color="white" />}
                      label={filterPanelLabels.business}
                      colorIndex={0}
                    />
                  )}
                  {aminitiesInfo?.poi && (
                    <FilterButton
                      active={isSelected("serviceTypes", SERVICE_TYPE_MAP.poi)}
                      onClick={() => {
                        toggleParam("serviceTypes", SERVICE_TYPE_MAP.poi);
                        sendGAEvent(triggerName.clickToServiceType, {
                          service_types: filterPanelLabels.pointOfInterest,
                        });
                      }}
                      icon={<PointOfInterestIcon strokColor="#7c7c7c" />}
                      activeIcon={<PointOfInterestIcon strokColor="#fff" />}
                      label={filterPanelLabels.pointOfInterest}
                      colorIndex={0}
                    />
                  )}
                  {aminitiesInfo?.funday && (
                    <FilterButton
                      active={isSelected(
                        "serviceTypes",
                        SERVICE_TYPE_MAP.fun_day,
                      )}
                      onClick={() => {
                        toggleParam("serviceTypes", SERVICE_TYPE_MAP.fun_day);
                        sendGAEvent(triggerName.clickToServiceType, {
                          service_types: filterPanelLabels.funDays,
                        });
                      }}
                      icon={<FundayIcon strokColor="#7c7c7c" />}
                      activeIcon={<FundayIcon strokColor="#fff" />}
                      label={filterPanelLabels.funDays}
                      colorIndex={1}
                    />
                  )}
                  {aminitiesInfo?.event && (
                    <FilterButton
                      active={isSelected(
                        "serviceTypes",
                        SERVICE_TYPE_MAP.event,
                      )}
                      onClick={() => {
                        toggleParam("serviceTypes", SERVICE_TYPE_MAP.event);
                        sendGAEvent(triggerName.clickToServiceType, {
                          service_types: filterPanelLabels.events,
                        });
                      }}
                      icon={<EventIcon strokColor="#7c7c7c" />}
                      activeIcon={<EventIcon strokColor="#fff" />}
                      label={filterPanelLabels.events}
                      colorIndex={2}
                    />
                  )}
                  {aminitiesInfo?.trip && (
                    <FilterButton
                      active={isSelected(
                        "serviceTypes",
                        SERVICE_TYPE_MAP.route,
                      )}
                      onClick={() => {
                        toggleParam("serviceTypes", SERVICE_TYPE_MAP.route);
                        sendGAEvent(triggerName.clickToServiceType, {
                          service_types: filterPanelLabels.routes,
                        });
                      }}
                      icon={<RouteIcon strokColor="#7c7c7c" />}
                      activeIcon={<RouteIcon strokColor="#fff" />}
                      label={filterPanelLabels.routes}
                      colorIndex={3}
                    />
                  )}
                </div>
              </div>
              {presetFeedFilters?.siteTopics?.map((topic: any) => (
                <div key={topic.title} className="mb-4">
                  <h3 className="text-sm font-bold text-gray-800  tracking-wide mb-2 px-1">
                    {topic.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {topic.siteCategories.map((cat: any, index: number) => {
                      const isSelected = selectedSiteCategories.some(
                        (c) => c.title === cat.title,
                      );
                      const gradient =
                        CATEGORY_COLORS[index % CATEGORY_COLORS.length];
                      return (
                        <button
                          key={index}
                          onClick={() => toggleSiteCategory(cat)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm custom-cursor transition-colors whitespace-nowrap ${
                            isSelected
                              ? `bg-gradient-to-r ${gradient} text-white shadow-md`
                              : "bg-gray-100 px-2 py-3 rounded-xl text-gray-800"
                          }`}
                        >
                          {cat.icon && (
                            <IconImage icon={cat.icon} width={18} height={18} />
                          )}
                          <span className="font-bold">
                            {cat.titleHe ?? cat.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {/* Advanced Search Toggle Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setAdvancedFilter(!advancedFilter)}
                className={`mb-8 px-4 py-2.5 rounded-lg transition-all flex items-center gap-3 text-sm font-medium mr-auto ${"bg-white text-teal-600 hover:bg-gray-50 border-2 border-gray-200 shadow-sm"}`}
              >
                <span>חיפוש מתקדם</span>
                <motion.div
                  animate={{ rotate: advancedFilter ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </motion.button>
              {advancedFilter && (
                <>
                  {/* ACCESSIBILITY */}
                  {filters?.accessibilities?.length > 0 && (
                    <div>
                      <div className="font-bold text-gray-800 mb-2">
                        {filterPanelLabels.accessibility}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {filters.accessibilities.map((item, index) => (
                          <FilterChip
                            key={item._id}
                            active={isSelected("accessibilityIds", item._id)}
                            onClick={() => {
                              toggleParam("accessibilityIds", item._id);
                              sendGAEvent(triggerName.clickToAccessibility, {
                                accessibility_id: item._id,
                                accessibility_name: item.hebrewName,
                              });
                            }}
                            label={item.hebrewName}
                            colorIndex={index}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TARGET AUDIENCE (Group Types) */}
                  {filters?.groupTypes?.length > 0 && (
                    <div>
                      <div className="font-bold text-gray-800 mb-2">
                        {filterPanelLabels.targetAudiences}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {filters.groupTypes.map((item, index) => (
                          <FilterChip
                            key={item._id}
                            active={isSelected("groupTypeIds", item._id)}
                            onClick={() => {
                              toggleParam("groupTypeIds", item._id);
                              sendGAEvent(triggerName.clickToGroupType, {
                                group_type_id: item._id,
                                group_type_name: item.hebrewName,
                              });
                            }}
                            label={item.hebrewName}
                            colorIndex={index}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
      </div>
    </motion.div>
  );
};

// Reusable Filter Button (for icons)
const FilterButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  label: string;
  colorIndex?: number;
}> = ({ active, onClick, icon, activeIcon, label, colorIndex = 0 }) => {
  const gradient = CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length];
  return (
    <div
      onClick={onClick}
      className={`custom-cursor flex items-center justify-start gap-2 bg-gray-100 rounded-xl ps-3 h-[42px] transition-all
        ${active ? `bg-gradient-to-r ${gradient} text-white shadow-md border-transparent` : "text-gray-800"}`}
    >
      {active ? activeIcon : icon}
      <span className="text-[12px] font-bold ">{label}</span>
    </div>
  );
};

// Reusable Filter Chip
const FilterChip: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
  colorIndex?: number;
}> = ({ active, onClick, label, colorIndex = 0 }) => {
  const gradient = CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length];
  return (
    <span
      onClick={onClick}
      className={`custom-cursor px-4 h-[42px] flex items-center justify-center rounded-xl text-[12px] font-bold bg-gray-100 transition-all
        ${active ? `bg-gradient-to-r ${gradient} text-white shadow-md border-transparent` : " text-gray-800"}`}
    >
      {label}
    </span>
  );
};

export default FeedFilterDrawer;
