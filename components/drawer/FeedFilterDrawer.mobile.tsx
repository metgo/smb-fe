"use client";

import clsx from "clsx";
import { useState } from "react";
import { IconImage, MotionDialogDiv } from "../ui";
import { filterPanelLabels, searchText } from "@/constant/hebrew";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloseIcon,
  DownAngleArrowIcon,
  EventIcon,
  FundayIcon,
  PointOfInterestIcon,
  RouteIcon,
  UpAngleArrowIcon,
} from "../ui/svgIcons";
import { filterCategories, ICON_MAP, SERVICE_TYPE_MAP } from "@/lib/utils";
import useGeneralStore from "@/stores/generalStore";
import { SunsetButton } from "../filter-icon/SunsetButton";
import { sendGAEvent, triggerName } from "@/lib/googleEventsConfig";
import { useSearchFlow } from "@/hooks/useSearchFlow";
import { useGetAllCategorySites } from "@/hooks/useGetAllCategorySites";
import useFavoriteFeedItemStore from "@/stores/favoriteFeedItemStore";
import { SearchButton } from "../filter-icon/SearchButton";
import { ChevronDown } from "lucide-react";

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
}

const MobileFeedFilterDrawer: React.FC<MobileFeedFilterDrawerProps> = ({
  isOpen,
  setIsOpen,
  itemCount,
  filters,
  appliedFilterCount,
  isSelected,
  toggleParam,
  handleResetFilters,
  filteredSubCategories,
}) => {
  const { aminitiesInfo, isFilterDrawerOpen } = useGeneralStore();
  const [advancedFilter, setAdvancedFilter] = useState(false);
  const [displayMode, setDisplayMode] = useState("");

  if (!isOpen) return null;

  const { setIsFilterDrawerOpen } = useGeneralStore();

  const { handleFilterTooltipShown } = useFavoriteFeedItemStore();
  const {
    hasResults,
    isLoading: isSearchLoading,
    hasMounted,
    handleClearInputText,
    handleKeywordSelect,
    recommendedBusinesses,
    searchItems,
    searchKeyword,
    setSearchKeyword,
  } = useSearchFlow();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleFilterIconClick = () => {
    const newState = !isFilterDrawerOpen;
    setIsFilterDrawerOpen(newState);
    setIsFilterOpen(newState);
    handleFilterTooltipShown(true);
  };

  const { data: categoriesSites } = useGetAllCategorySites();
  return (
    <>
      <div
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 z-50 custom-cursor"
      />

      {/* DRAWER */}
      <MotionDialogDiv
        type="drawer-bottom"
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          "fixed inset-x-0 bottom-0 z-50 w-full bg-white flex flex-col shadow-2xl overflow-y-auto h-[60vh]",
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
        <div className="flex  items-center">
          {/* <div
            className=" absolute left-4 top-4  custom-cursor"
            onClick={() => setIsOpen(false)}
          >
            <CloseIcon />
          </div> */}
          <span className="font-bold text-lg py-4 px-4 text-black mr-5">
            {filterPanelLabels.searchText}
          </span>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto max-h-[80vh] px-3 z-50">
          <div className="flex items-start justify-center py-7.5">
            {/* Search Button */}
            <div className="max-sm:mx-4 max-sm:w-full md:w-[546px] h-10 rounded-3xl border border-lightGray flex items-center gap-2 px-4 py-2">
              <IconImage icon="search" />
              <input
                type="text"
                value={searchKeyword}
                placeholder={searchText.search}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full outline-none border-none focus:ring-0"
              />
              {searchKeyword && (
                <IconImage
                  height={18}
                  width={18}
                  icon="circular-close-white"
                  onClick={handleClearInputText}
                />
              )}
            </div>
          </div>
          {/* MAIN CATEGORIES & SERVICE TYPES */}
          <div className="border-b border-primary py-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-theme">
                {filterPanelLabels.main}
              </div>
              {/* <h2 className="text-lg font-bold">
                <span>{itemCount}</span>{" "}
                <span>{filterPanelLabels.results}</span>
              </h2> */}
            </div>

            <div className="grid grid-cols-12 gap-x-1 gap-y-2 mt-2">
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
                {categoriesSites?.siteTopics?.map((topic: any) => (
                  <div key={topic.title} className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-500  tracking-wide mb-2 px-1">
                      {topic.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {topic.siteCategories?.map((category: any) => (
                        <FilterButton
                          key={category.title}
                          active={isSelected("categoryIds", category.title)}
                          onClick={() => {
                            toggleParam("categoryIds", category.title);
                            sendGAEvent(triggerName.clickToCategory, {
                              category_id: category.title,
                              category_name: category.title,
                            });
                          }}
                          icon={null}
                          activeIcon={null}
                          label={category.title}
                        />
                      ))}
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
                        <div className="border-b border-primary py-3">
                          <div className="font-bold text-theme">
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
                    <div className="border-b border-primary py-3">
                      <div className="font-bold text-theme">
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
                    <div className="border-b border-primary py-3">
                      <div className="font-bold text-theme">
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
                        className={`text-base font-semibold mb-3 text-right ${"text-gray-600"}`}
                      >
                        מה להציג?
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
                              : "text-gray-600 hover:text-gray-900"
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
                              : "text-gray-600 hover:text-gray-900"
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
                              : "text-gray-600 hover:text-gray-900"
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
            onClick={() => setIsOpen(false)}
            className="relative custom-cursor"
          >
            <SearchButton
              onClick={handleFilterIconClick}
              activeFiltersCount={appliedFilterCount}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              variant="continuous"
              size={96}
            />
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            disabled={appliedFilterCount === 0}
            className={clsx(
              appliedFilterCount === 0
                ? "cursor-not-allowed text-black/30 "
                : "custom-cursor bg-black/80 text-white font-bold hover:bg-black ",
              " border border-black/20 items-center font-bold text-lightGray rounded-xl  w-full py-2",
            )}
          >
            {filterPanelLabels.clearAll}
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
    className={`md:col-span-6  max-sm:col-span-4 sm:col-span-12 lg:col-span-4 custom-cursor flex items-center justify-start gap-2 border border-theme rounded-3xl ps-3 h-[42px] transition-all
      ${active ? "bg-black text-white" : "text-theme"}`}
  >
    {active ? activeIcon : icon}
    <span className="text-[12px] font-bold ml-4">{label}</span>
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

export default MobileFeedFilterDrawer;
