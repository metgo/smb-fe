"use client";

import clsx from "clsx";
import { useState, useEffect, useMemo } from "react";
import { scaleLayout, shuffleArray } from "@/lib/helpers";

import {
  onlyCardsColumns,
  onlyCardsLayouts,
  REFERENCE_SCREEN_WIDTH,
} from "@/constant/collageLayouts";
import FeedCard from "../cards/FeedCard";
import NoFeedItemLayout from "./NoFeedItemLayout";
import { AnimatePresence, motion } from "motion/react";
import { useGetAllCategorySites } from "@/hooks/useGetAllCategorySites";
import {
  CloseIcon,
  EventIcon,
  FundayIcon,
  PointOfInterestIcon,
  RouteIcon,
} from "../ui/svgIcons";
import { filterPanelLabels, searchText } from "@/constant/hebrew";
import { SERVICE_TYPE_MAP } from "@/lib/utils";
import { sendGAEvent, triggerName } from "@/lib/googleEventsConfig";
import { SunsetButton } from "../filter-icon/SunsetButton";
import useGeneralStore from "@/stores/generalStore";
import { ChevronDown } from "lucide-react";
import SearchFlow from "../navbar/SearchFlow";
import { useSearchFlow } from "@/hooks/useSearchFlow";
import { IconImage } from "../ui";

interface OnlyFeedCardsLayoutProps {
  data: FeedItemList;
  isFilterOpen: boolean;
  setIsFilterOpen: (v: boolean) => void;
  filters: FiltersResponse;
  appliedFilterCount: number;
  isSelected: (key: any, value: string) => boolean;
  toggleParam: (key: any, value: string) => void;
  handleResetFilters: () => void;
  filteredSubCategories: SubCategory[];
  itemCount: number;
}

const OnlyFeedCardsLayout = ({
  data,
  isFilterOpen,
  setIsFilterOpen,
  filters,
  appliedFilterCount,
  isSelected,
  toggleParam,
  handleResetFilters,
  filteredSubCategories,
  itemCount,
}: OnlyFeedCardsLayoutProps) => {
  const feedItemCount = data?.length;
  const { aminitiesInfo } = useGeneralStore();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const {
    data: categoriesSites,
    isLoading,
    isError,
  } = useGetAllCategorySites();

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const currentWidth = window.innerWidth;
      const newScale = currentWidth / REFERENCE_SCREEN_WIDTH;
      setScale(newScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Memoize shuffled layouts so they only shuffle once
  const shuffledLayouts = useMemo(() => {
    const layout16 = scaleLayout(onlyCardsLayouts["layout16"], scale);
    return shuffleArray(layout16);
  }, [scale]);

  // Early return BEFORE any complex rendering logic
  if (!data || data.length < 1) {
    return <NoFeedItemLayout />;
  }
  const [advancedFilter, setAdvancedFilter] = useState(false);
  const [displayMode, setDisplayMode] = useState("");
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

  const renderCards = (
    indexes: number[],
    layout: LayoutItem[],
    offset: number,
  ) => (
    <div className="space-y-5">
      {indexes.map((i) => {
        const feedItem = data[i + offset];
        const cardLayout = layout[i];

        if (!feedItem || !cardLayout) return null;

        return (
          <FeedCard
            key={`feedcard-${feedItem?._id ?? "no-id"}-${i + offset}`}
            width={cardLayout.width}
            height={cardLayout.height}
            feedItem={feedItem}
          />
        );
      })}
    </div>
  );

  const renderHorizontalCards = (
    indexes: number[],
    layout: LayoutItem[],
    offset: number,
  ) => (
    <div className="flex gap-5 pt-5">
      {indexes.map((i) => {
        const feedItem = data[i + offset];
        const cardLayout = layout[i];

        if (!feedItem || !cardLayout) return null;

        return (
          <FeedCard
            key={`feedcard-${feedItem?._id ?? "no-id"}-${i + offset}`}
            width={cardLayout.width}
            height={cardLayout.height}
            feedItem={feedItem}
          />
        );
      })}
    </div>
  );

  const renderLayoutSection = (
    layoutData: LayoutItem[],
    columnLayoutData: Record<string, number[]> | null,
    offset: number,
    index: number,
  ) => {
    if (!columnLayoutData) {
      return (
        <div className="space-y-5" key={index}>
          {layoutData.map((item, i) => {
            const feedItem = data[i + offset];

            if (!feedItem) return null;

            return (
              <FeedCard
                key={`feedcard-${feedItem?._id ?? "no-id"}-${i + offset}`}
                width={item.width}
                height={item.height}
                feedItem={feedItem}
              />
            );
          })}
        </div>
      );
    }

    return (
      <div className="flex gap-5" key={index}>
        {Object.keys(columnLayoutData)
          .filter((key) => !key.startsWith("sub"))
          .map((colKey, idx) => {
            const subKey = `sub${colKey[0].toUpperCase()}${colKey.slice(1)}`;
            const mainIndexes = columnLayoutData[colKey];
            const subIndexes = columnLayoutData[subKey];

            return (
              <div key={`${colKey}-${idx}`} className="flex flex-col">
                {renderCards(mainIndexes, layoutData, offset)}
                {subIndexes &&
                  renderHorizontalCards(subIndexes, layoutData, offset)}
              </div>
            );
          })}
      </div>
    );
  };

  const renderExtraCards = (extraBusinesses: any[]) => {
    if (extraBusinesses.length === 0) return null;

    const columnCount = 5;

    const columns: {
      businesses: any[];
      layouts: LayoutItem[];
      height: number;
    }[] = Array.from({ length: columnCount }, () => ({
      businesses: [],
      layouts: [],
      height: 0,
    }));

    extraBusinesses.forEach((biz, i) => {
      if (!biz) return;

      const layoutIndex = i % shuffledLayouts.length;
      const layout = shuffledLayouts[layoutIndex];

      const shortestColumnIndex = columns.reduce(
        (minIdx, col, idx) =>
          col.height < columns[minIdx].height ? idx : minIdx,
        0,
      );

      columns[shortestColumnIndex].businesses.push(biz);
      columns[shortestColumnIndex].layouts.push(layout);
      columns[shortestColumnIndex].height += layout.height;
    });

    return (
      <div className="flex w-full gap-5 items-start mt-4">
        {columns.map((column, colIdx) => (
          <div key={`column-${colIdx}`} className="flex flex-col gap-5">
            {column.businesses.map((biz, bizIdx) => {
              const layout = column.layouts[bizIdx];

              if (!biz || !layout) return null;

              return (
                <FeedCard
                  key={`${biz._id}-extra-${colIdx}-${bizIdx}`}
                  width={layout.width}
                  height={layout.height}
                  feedItem={biz}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderFullLayout = () => {
    const safeLayoutKey = `layout${Math.min(feedItemCount, 16)}`;
    const layout = scaleLayout(onlyCardsLayouts[safeLayoutKey], scale);
    const columnLayout = onlyCardsColumns[safeLayoutKey] ?? null;

    const extraBusinesses = feedItemCount > 16 ? data.slice(16) : [];

    return (
      <div key="layout-root">
        {renderLayoutSection(layout, columnLayout, 0, 0)}
        {feedItemCount > 16 && renderExtraCards(extraBusinesses)}
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col justify-center items-center py-12">
        {/* title */}
        <h1
          className={`text-center ${"text-gray-900"}`}
          style={{
            fontFamily: "sans-serif",
            fontSize: "clamp(3.5rem, 12vw, 9rem)",
            letterSpacing: "-0.02em",
            lineHeight: 0.85,
          }}
        >
          לוקחים נשימה
        </h1>{" "}
        {/* subtitle */}
        <p
          className="text-center bg-gradient-to-l from-teal-400 via-cyan-400 to-teal-500 bg-clip-text text-transparent "
          style={{
            fontFamily: "sans-serif",
            fontWeight: 600,
            fontSize: "clamp(3.5rem, 16vw, 9rem)",
            letterSpacing: "-0.02em",
            lineHeight: 0.85,
          }}
        >
          עם הנגב הפורח
        </p>{" "}
        <motion.div className="flex flex-wrap gap-3 justify-center mt-12">
          {categoriesSites?.siteTopics?.map((topic: any) => {
            return topic.siteCategories?.map((category: any) => {
              const isActive = selectedCategories.includes(category.title);
              return (
                <motion.button
                  key={category.title}
                  whileTap={{ scale: 0.96 }}
                  onClick={() =>
                    setSelectedCategories(
                      isActive
                        ? selectedCategories.filter((c) => c !== category.title)
                        : [...selectedCategories, category.title],
                    )
                  }
                  className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium backdrop-blur-sm ${
                    isActive
                      ? `bg-blue-500 text-white shadow-lg`
                      : "bg-white/80 text-gray-700 hover:bg-white shadow-md"
                  }`}
                >
                  {category.title}
                </motion.button>
              );
            });
          })}
        </motion.div>
      </div>

      {/* ── MAIN CONTENT: sticky filter panel + scrollable feed cards side by side ── */}
      <div
        className={clsx(
          "px-20 flex gap-8 items-start w-full h-full relative overflow-x-clip",
        )}
      >
        {/* ── STICKY INLINE FILTER PANEL ── */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              key="inline-filter"
              initial={{ opacity: 0, x: 40, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 500 }}
              exit={{ opacity: 0, x: 40, width: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="sticky top-24 self-start shrink-0 "
              style={{ width: 320 }}
            >
              <div className="bg-white rounded-2xl shadow-xl flex flex-col max-h-[88vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
                  <span className="font-bold text-lg text-theme">
                    {filterPanelLabels.searchText}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {itemCount} {filterPanelLabels.results}
                    </span>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="custom-cursor p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                </div>

                {/* Scrollable filter body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
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
                  <div>
                    <div className="font-bold text-theme mb-2">
                      {filterPanelLabels.main}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {aminitiesInfo?.poi && (
                        <FilterButton
                          active={isSelected(
                            "serviceTypes",
                            SERVICE_TYPE_MAP.poi,
                          )}
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
                      {aminitiesInfo?.funday && (
                        <FilterButton
                          active={isSelected(
                            "serviceTypes",
                            SERVICE_TYPE_MAP.fun_day,
                          )}
                          onClick={() => {
                            toggleParam(
                              "serviceTypes",
                              SERVICE_TYPE_MAP.fun_day,
                            );
                            sendGAEvent(triggerName.clickToServiceType, {
                              service_types: filterPanelLabels.funDays,
                            });
                          }}
                          icon={<FundayIcon strokColor="#7c7c7c" />}
                          activeIcon={<FundayIcon strokColor="#fff" />}
                          label={filterPanelLabels.funDays}
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
                        />
                      )}
                      {/* Dynamic categories from API */}
                      {/* {categoriesSites?.siteTopics?.map((topic: any) =>
                        topic.siteCategories?.map((category: any) => (
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
                        )),
                      )} */}
                    </div>
                  </div>
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
                      {/* SUBCATEGORIES */}
                      {filteredSubCategories?.length > 0 && (
                        <div>
                          <div className="font-bold text-theme mb-2">
                            {filterPanelLabels.second}
                          </div>
                          <div className="flex flex-wrap gap-2">
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
                      {filters?.accessibilities?.length > 0 && (
                        <div>
                          <div className="font-bold text-theme mb-2">
                            {filterPanelLabels.accessibility}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {filters.accessibilities.map((item) => (
                              <FilterChip
                                key={item._id}
                                active={isSelected(
                                  "accessibilityIds",
                                  item._id,
                                )}
                                onClick={() => {
                                  toggleParam("accessibilityIds", item._id);
                                  sendGAEvent(
                                    triggerName.clickToAccessibility,
                                    {
                                      accessibility_id: item._id,
                                      accessibility_name: item.hebrewName,
                                    },
                                  );
                                }}
                                label={item.hebrewName}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TARGET AUDIENCE (Group Types) */}
                      {filters?.groupTypes?.length > 0 && (
                        <div>
                          <div className="font-bold text-theme mb-2">
                            {filterPanelLabels.targetAudiences}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {filters.groupTypes.map((item) => (
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
                      )}
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
                </div>

                {/* Footer actions */}
                <div className="shrink-0 flex items-center justify-between px-5 py-4 border-t border-gray-100">
                  <div
                    onClick={() => setIsFilterOpen(false)}
                    className="custom-cursor"
                  >
                    <SunsetButton
                      size={50}
                      variant="black"
                      appliedFilterCount={appliedFilterCount}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    disabled={appliedFilterCount === 0}
                    className={clsx(
                      appliedFilterCount === 0
                        ? "cursor-not-allowed text-black/30"
                        : "custom-cursor bg-black/80 text-white font-bold hover:bg-black",
                      "border border-black/20 font-bold text-lightGray rounded-xl px-8 py-2 transition-colors",
                    )}
                  >
                    {filterPanelLabels.clearAll}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FEED CARDS ── */}
        <div className="flex flex-col gap-5 items-start justify-start flex-1 min-w-0 overflow-hidden">
          {renderFullLayout()}
        </div>
      </div>
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
}> = ({ active, onClick, icon, activeIcon, label }) => (
  <div
    onClick={onClick}
    className={`custom-cursor flex items-center justify-start gap-2  border border-theme rounded-3xl ps-3 h-[42px] transition-all
      ${active ? "bg-black text-white" : "text-theme"}`}
  >
    <span className="mr-2">{active ? activeIcon : icon}</span>
    <span className="text-[12px] font-bold mr-2">{label}</span>
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
    className={`custom-cursor px-4 h-[38px] flex items-center justify-center rounded-3xl text-[12px] font-bold border border-theme transition-all
      ${active ? "bg-black text-white" : "text-theme"}`}
  >
    {label}
  </span>
);

export default OnlyFeedCardsLayout;
