"use client";

import clsx from "clsx";
import { useState } from "react";
import { IconImage, MotionDialogDiv } from "../ui";
import { filterPanelLabels, searchText } from "@/constant/hebrew";
import { motion, AnimatePresence } from "framer-motion";
import {
  EventIcon,
  FundayIcon,
  PointOfInterestIcon,
  RouteIcon,
} from "../ui/svgIcons";
import { SERVICE_TYPE_MAP } from "@/lib/utils";
import useGeneralStore from "@/stores/generalStore";
import { sendGAEvent, triggerName } from "@/lib/googleEventsConfig";
import useFavoriteFeedItemStore from "@/stores/favoriteFeedItemStore";
import { SearchButton } from "../filter-icon/SearchButton";
import { ChevronDown, RotateCcw } from "lucide-react";
import { CATEGORY_COLORS } from "@/components/layouts/FeedCategoryButtons";

interface MobileFeedFilterDrawerProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  itemCount: number;
  filters: FiltersResponse;
  appliedFilterCount: number;
  isSelected: (key: any, value: string) => boolean;
  toggleParam: (key: any, value: string) => void;
  handleResetFilters: () => void;
  filteredSubCategories: SubCategory[];
  initFiltersFromURL: any;
  filterState: any;
  visibleFeedItems: any;
}

const MobileFeedFilterDrawer: React.FC<MobileFeedFilterDrawerProps> = ({
  isOpen,
  setIsOpen,
  filters,
  appliedFilterCount,
  isSelected,
  toggleParam,
  filteredSubCategories,
  visibleFeedItems,
  handleResetFilters: handleClearFilters,
  filterState,
}) => {
  console.log("🚀 ~ MobileFeedFilterDrawer ~ filterState:", filterState);
  const {
    aminitiesInfo,
    isFilterDrawerOpen,
    presetFeedFilters,
    setIsFilterDrawerOpen,
    selectedSiteCategories,
    toggleSiteCategory,
    feedSearchKeyword,
    setFeedSearchKeyword,
    clearSiteCategories,
  } = useGeneralStore();

  const { handleFilterTooltipShown } = useFavoriteFeedItemStore();
  const [advancedFilter, setAdvancedFilter] = useState(false);
  const [displayMode, setDisplayMode] = useState("");

  const handleResetFilters = () => {
    clearSiteCategories();
    setFeedSearchKeyword("");
    handleClearFilters();
  };

  const handleFilterIconClick = () => {
    const newState = !isFilterDrawerOpen;
    setIsFilterDrawerOpen(newState);
    handleFilterTooltipShown(true);
  };
  const hasActiveFilters =
    Object.values(filterState).some(
      (value) => Array.isArray(value) && value.length > 0,
    ) ||
    (feedSearchKeyword && feedSearchKeyword.length > 0) ||
    (selectedSiteCategories && selectedSiteCategories.length > 0);

  const totalActiveFilters =
    appliedFilterCount + (selectedSiteCategories?.length || 0);

  if (!isOpen) return null;

  return (
    <div>
      <div
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 z-50 custom-cursor"
      />

      {/* DRAWER */}
      <MotionDialogDiv
        type="drawer-bottom"
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          "fixed inset-x-0 bottom-0 z-50 w-full bg-white flex flex-col rounded-t-2xl h-[50vh] border-t border-gray-300 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]",
        )}
      >
        {/* SHEET HANDLER */}
        {/* <div className="w-full flex justify-center items-center pt-4 relative">
          <button
            type="button"
            onClick={() => setShowAllFilters((prev) => !prev)}
            className="transition-transform duration-300"
          >
            {showAllFilters ? <DownAngleArrowIcon /> : <UpAngleArrowIcon />}
          </button>
        </div> */}

        {/* HEADER */}
        <div className="flex items-center justify-between py-4 px-4">
          <span className="font-bold text-lg text-black">
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

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto max-h-[80vh] px-3 z-50">
          <div className="flex items-start justify-center">
            {/* Search Button */}
            <div className="w-7xl rounded-xl border border-gray-100 flex items-center gap-2 px-4 py-2">
              <IconImage icon="search" />
              <input
                type="text"
                value={feedSearchKeyword}
                placeholder={searchText.search}
                onChange={(e) => setFeedSearchKeyword(e.target.value)}
                className="w-full outline-none border-none focus:ring-0"
              />
              {feedSearchKeyword && (
                <IconImage
                  height={18}
                  width={18}
                  icon="circular-close-white"
                  onClick={() => setFeedSearchKeyword("")}
                />
              )}
            </div>
          </div>
          {/* MAIN CATEGORIES & SERVICE TYPES */}
          <div className=" py-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-gray-800">
                {filterPanelLabels.main}
              </div>
              {/* <h2 className="text-lg font-bold">
                <span>{itemCount}</span>{" "}
                <span>{filterPanelLabels.results}</span>
              </h2> */}
            </div>

            <div className="grid grid-cols-3 gap-x-1 gap-y-2 mt-2">
              {/* Point of Interest */}

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
                />
              )}

              {/* Main Categories */}
              {/* {filterCategories?.map((menu) => {
                const Icon = ICON_MAP[menu._id];
                return (
                  <FilterButton
                    key={menu._id}
                    active={isSelected("categoryIds", menu._id)}
                    onClick={() => {
                      toggleParam("categoryIds", menu._id);
                      sendGAEvent(triggerName.clickToCategory, {
                        category_id: menu._id,
                        category_name: menu.hebrewName,
                      });
                    }}
                    icon={Icon && <Icon strokColor="#7c7c7c" />}
                    activeIcon={Icon && <Icon strokColor="#fff" />}
                    label={menu.hebrewName}
                  />
                );
              })} */}

              {/* Funday */}
              {aminitiesInfo?.funday && (
                <FilterButton
                  active={isSelected("serviceTypes", SERVICE_TYPE_MAP.fun_day)}
                  onClick={() => {
                    toggleParam("serviceTypes", SERVICE_TYPE_MAP.fun_day);
                    sendGAEvent(triggerName.clickToServiceType, {
                      service_types: filterPanelLabels.funDays,
                    });
                  }}
                  icon={<FundayIcon strokColor="#7c7c7c" />}
                  activeIcon={<FundayIcon strokColor="#fff" />}
                  label={filterPanelLabels.funDays}
                />
              )}

              {/* Events */}
              {aminitiesInfo?.event && (
                <FilterButton
                  active={isSelected("serviceTypes", SERVICE_TYPE_MAP.event)}
                  onClick={() => {
                    toggleParam("serviceTypes", SERVICE_TYPE_MAP.event);
                    sendGAEvent(triggerName.clickToServiceType, {
                      service_types: filterPanelLabels.events,
                    });
                  }}
                  icon={<EventIcon strokColor="#7c7c7c" />}
                  activeIcon={<EventIcon strokColor="#fff" />}
                  label={filterPanelLabels.events}
                />
              )}

              {/* Routes */}
              {aminitiesInfo?.trip && (
                <FilterButton
                  active={isSelected("serviceTypes", SERVICE_TYPE_MAP.route)}
                  onClick={() => {
                    toggleParam("serviceTypes", SERVICE_TYPE_MAP.route);
                    sendGAEvent(triggerName.clickToServiceType, {
                      service_types: filterPanelLabels.routes,
                    });
                  }}
                  icon={<RouteIcon strokColor="#7c7c7c" />}
                  activeIcon={<RouteIcon strokColor="#fff" />}
                  label={filterPanelLabels.routes}
                />
              )}
            </div>
          </div>

          <AnimatePresence>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: 0,
                ease: "easeInOut",
              }}
              className="overflow-hidden"
            >
              <>
                {presetFeedFilters?.siteTopics?.map((topic: any) => (
                  <div key={topic.title} className="mb-4">
                    <h3 className="text-sm font-bold text-gray-800 tracking-wide mb-2 px-1 mt-2">
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
                                : "bg-gray-100 px-8 py-3 rounded-xl text-gray-800"
                            }`}
                          >
                            {cat.icon && (
                              <IconImage
                                icon={cat.icon}
                                width={18}
                                height={18}
                              />
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
                    {/* SUBCATEGORIES */}
                    {filteredSubCategories &&
                      filteredSubCategories?.length > 0 && (
                        <div className=" py-3">
                          <div className="font-bold text-gray-800">
                            {filterPanelLabels.second}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {filteredSubCategories.map((item) => (
                              <FilterChip
                                key={item._id}
                                active={isSelected("subCategoryIds", item._id)}
                                onClick={() => {
                                  toggleParam("subCategoryIds", item._id);
                                  sendGAEvent(triggerName.clickToSubCategory, {
                                    subcategory_id: item._id,
                                    subcategory_name: item.hebrewName,
                                  });
                                }}
                                label={item.hebrewName}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                    {/* ACCESSIBILITY */}
                    <div className=" py-3">
                      <div className="font-bold text-gray-800">
                        {filterPanelLabels.accessibility}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {filters?.accessibilities?.map((item) => (
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
                          />
                        ))}
                      </div>
                    </div>

                    {/* TARGET AUDIENCE */}
                    <div className=" py-3">
                      <div className="font-bold text-gray-800">
                        {filterPanelLabels.targetAudiences}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {filters?.groupTypes?.map((item) => (
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
                          />
                        ))}
                      </div>
                    </div>
                    {/* What to show? */}
                    <div className="mb-8">
                      <h3
                        className={`text-base font-bold mb-3 text-right ${"text-gray-800"}`}
                      >
                        {filterPanelLabels.whatToshow}{" "}
                      </h3>
                      <div
                        className={`flex gap-1 rounded-xl p-0.5 w-fit ${"bg-gray-100"}`}
                      >
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setDisplayMode("")}
                          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            displayMode === ""
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-800 hover:text-gray-900"
                          }`}
                        >
                          {filterPanelLabels.everything}{" "}
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setDisplayMode("businesses")}
                          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            displayMode === "businesses"
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-800 hover:text-gray-900"
                          }`}
                        >
                          {filterPanelLabels.business}{" "}
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setDisplayMode("products")}
                          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            displayMode === "products"
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-800 hover:text-gray-900"
                          }`}
                        >
                          {filterPanelLabels.products}{" "}
                        </motion.button>
                      </div>
                    </div>
                  </>
                )}
              </>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CLOSE BUTTON */}
        <div className="shrink-0 flex items-center justify-between px-4 gap-4 mt-4">
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="relative custom-cursor"
          >
            <SearchButton
              onClick={handleFilterIconClick}
              isFilterDrawerOpen={isFilterDrawerOpen}
              activeFiltersCount={totalActiveFilters}
              variant="continuous"
              size={96}
            />
          </div>
        </div>
      </MotionDialogDiv>
    </div>
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

export default MobileFeedFilterDrawer;
