import clsx from "clsx";
import { useTranslation } from "react-i18next";
import React, { useState, useCallback } from "react";

import { useCommon } from "@/hooks/useCommon";
import { ContentCard } from "./sub-components";
import { FilterButton } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  FilterChips,
  SearchInput,
  Spinner,
  ViewModeToggle,
} from "@/components/shared";
import { ReactSelect } from "@/components/form-fields";
import {
  useGetBusinessForProductQuery,
  useLazyGetBusinessForProductQuery,
} from "@/store/api/businessQueryApi";
import { useRemoteSelectData } from "@/hooks/useRemoteSelectData";
import { useAppSelector } from "@/hooks/hooks";

interface Filters {
  hasProductFilter: string;
  primaryCategory: string;
  businessId: string;
  registrationFilter: string;
  eventTypeFilter: string;
  dateRangeFilter: {
    start: string;
    end: string;
  };
  isTrip: string;
}

interface ContentsProps {
  selected: string | null;
  setSelected: (v: string | null) => void;
  isLoading: boolean;
  isExpanded: boolean;
  viewMode: TViewMode;
  combinedBusinesses: any[];
  filters: Filters;
  totalData: number;
  tabCounts: Record<string, number>;
  tabLoadings: Record<string, boolean>;
  setFilters: (value: Filters | ((prev: Filters) => Filters)) => void;
  clearFilter: () => void;
  setViewMode: (v: TViewMode) => void;
  templateContents: IContentTemplate[];
  setTemplateContent: (value: IContentTemplate[]) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  currentTab: string;
}
const FILTER_OPTIONS = [
  "Businesses",
  "Products",
  // "Trips",
  // "Events",
  // "POI",
];

const TAB_TO_CONTENT_TYPE: Record<string, IContent["contentType"]> = {
  Businesses: "business",
  Products: "product",
  Trips: "trip",
  Events: "event",
  POI: "poi",
};

const FILTER_ICONS: Record<string, React.ReactNode> = {
  Businesses: (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  ),
  Trips: (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
      />
    </svg>
  ),
  Products: (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  ),
  Events: (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  POI: (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
};
const Contents = ({
  isLoading,
  isExpanded,
  viewMode,
  setViewMode,
  combinedBusinesses,
  clearFilter,
  filters,
  setFilters,
  totalData,
  tabCounts,
  tabLoadings,
  selected,
  setSelected,
  searchQuery,
  setSearchQuery,
  currentTab,
}: ContentsProps) => {
  const { t } = useTranslation("content");
  const { t: tc } = useTranslation("common");

  const { isDark, language } = useThemeClasses();
  const { categories: categoryFilter } = useCommon();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Map<string, any>>(
    new Map(),
  );
  const { dmoId, authorityId, startDate, endDate } = useAppSelector(
    (state) => state.auth,
  );
  // ─── Business Data Fetching ─────────
  const { data: businessData, isLoading: _isBusinessesLoading } =
    useGetBusinessForProductQuery({
      locale: language,
      limit: 20,
      page: 1,
      dmoId,
      authorityId,
      startDate,
      endDate,
    });
  const [getBusinessList] = useLazyGetBusinessForProductQuery();

  const {
    items: businesses,
    search: searchBusiness,
    isSearching,
  } = useRemoteSelectData({
    initialData: businessData?.data,
    debounceMs: 400,
    searchParams: { locale: language, dmoId, authorityId, startDate, endDate },
    lazySearch: async (params) => {
      const res = await getBusinessList(params).unwrap();
      return { data: res?.data };
    },
  });
  // ─── Selection handler ────────────────────────────────────────────────────
  const handleSelect = useCallback((item: any, isMulti: boolean) => {
    setSelectedItems((prev) => {
      const next = new Map(prev);
      if (isMulti) {
        // Ctrl/Cmd/Shift: toggle this item
        if (next.has(item._id)) {
          next.delete(item._id);
        } else {
          next.set(item._id, item);
        }
      } else {
        // Plain click: if it's the only selected item, deselect it; otherwise select only it
        if (next.has(item._id)) {
          next.delete(item._id);
        } else {
          next.set(item._id, item);
        }
      }
      return next;
    });
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent, item: any) => {
      const isMulti = e.ctrlKey || e.metaKey || e.shiftKey;
      handleSelect(item, isMulti);
    },
    [handleSelect],
  );

  const handleContextMenu = useCallback((item: any) => {
    // Right-click selects the card if not already in selection
    setSelectedItems((prev) => {
      if (prev.has(item._id)) return prev; // already selected — keep selection
      const next = new Map();
      next.set(item._id, item);
      return next;
    });
  }, []);

  // Click on the empty area of the list clears the selection
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setSelectedItems(new Map());
    }
  };

  return (
    <div className="flex-1 min-w-0 pt-6">
      <div
        className={clsx(
          "border p-2 rounded-md",
          isDark ? "border-gray-500" : "border-gray-200",
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <h2
            className={`${isDark ? "text-gray-400" : "text-gray-700"} text-lg font-semibold`}
          >
            {t("source_backlog_title")}
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400 flex gap-1">
            <div>{totalData}</div>
            {currentTab} {t("available")}
          </div>

          <div className="flex flex-1 justify-end">
            <div className="flex items-center gap-1">
              {FILTER_OPTIONS.map((option) => {
                const isSelected = selected === option;
                const count = tabCounts[option] ?? "?";
                const isTabLoading = tabLoadings[option] ?? false;
                return (
                  <button
                    key={option}
                    onClick={() => setSelected(isSelected ? null : option)}
                    className={clsx(
                      "group relative flex items-center gap-0.5 rounded-md px-2 py-1.5 transition-colors border",
                      isSelected
                        ? "bg-teal-500/15 border-teal-500/40 text-teal-600 dark:text-teal-400"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300",
                    )}
                  >
                    {FILTER_ICONS[option]}
                    <span
                      className={clsx(
                        "text-xs font-medium",
                        isSelected
                          ? "text-teal-600 dark:text-teal-400"
                          : "text-gray-500 dark:text-gray-400",
                      )}
                    >
                      {option}
                    </span>
                    {isTabLoading ? (
                      <span className="w-5 h-3 rounded animate-pulse bg-gray-300 dark:bg-gray-600 inline-block" />
                    ) : (
                      <span
                        className={clsx(
                          "text-xs leading-none tabular-nums font-bold px-1.5 py-0.5 rounded-full",
                          isSelected
                            ? "bg-teal-500/20 text-teal-600 dark:text-teal-400"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400",
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 relative">
            <SearchInput
              placeholder={t("search_businesses_placeholder")}
              searchTerm={searchQuery}
              setSearchTerm={setSearchQuery}
              storageKey="contentSearchTerm"
            />
          </div>
          {currentTab !== "POI" && (
            <FilterButton value={showFilters} onChange={setShowFilters} />
          )}
          <ViewModeToggle
            onChange={setViewMode}
            value={viewMode}
            tableName="contentViewMode"
          />
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div
            className={`border-t pt-2 ${isDark ? "border-gray-800 bg-gray-900/30" : "border-gray-200 bg-gray-50"}`}
          >
            <div className="flex flex-wrap items-start gap-4 w-full">
              <div className="grid grid-cols-8 gap-2 pb-2">
                {/* ── Business filters ── */}
                {currentTab === "Businesses" && (
                  <>
                    <div className="flex flex-col col-span-4">
                      <label
                        className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {t("has_products")}
                      </label>
                      <select
                        value={filters.hasProductFilter}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            hasProductFilter: e.target.value,
                          })
                        }
                        className={`w-full px-3 py-2 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-300 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                      >
                        <option value="all">{t("all")}</option>
                        <option value="yes">{t("yes")}</option>
                        <option value="no">{t("no")}</option>
                      </select>
                    </div>

                    <div className="flex flex-col col-span-4">
                      <label
                        className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {t("primary_category")}
                      </label>
                      <select
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            primaryCategory: e.target.value,
                          })
                        }
                        value={filters.primaryCategory}
                        className={`w-full px-3 py-2 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-300 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                      >
                        <option value="">{t("all")}</option>
                        {categoryFilter?.map((cat: any) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* ── Product filters ── */}
                {currentTab === "Products" && (
                  <div className="flex flex-col min-w-45">
                    <label
                      className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {t("filter_by_business")}
                    </label>
                    <ReactSelect
                      isClearable
                      value={filters.businessId}
                      onChange={(businessId: string) =>
                        setFilters((prev) => ({ ...prev, businessId }))
                      }
                      items={
                        businesses?.map((item: any) => ({
                          _id: item._id,
                          name: item.name,
                        })) ?? []
                      }
                      placeholder={t("select_business")}
                      onSearch={searchBusiness}
                      isLoading={isSearching || _isBusinessesLoading}
                    />
                  </div>
                )}

                {currentTab === "Trips" && (
                  <div className="flex flex-col min-w-45">
                    <label
                      className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {t("isTrip")}
                    </label>
                    <select
                      value={filters.isTrip}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          isTrip: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? "bg-gray-900 border-gray-700 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    >
                      <option value="all">{tc("all")}</option>
                      <option value="true">{tc("yes")}</option>
                      <option value="false">{tc("no")}</option>
                    </select>
                  </div>
                )}
                {/* ── Event filters ── */}
                {currentTab === "Events" && (
                  <div className="flex flex-col min-w-45">
                    <label className={`block text-sm mb-2`}>
                      {t("event_type")}
                    </label>
                    <select
                      value={filters.eventTypeFilter}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          eventTypeFilter: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? "bg-gray-900 border-gray-700 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    >
                      <option value="all">{tc("all")}</option>
                      <option value="free">{tc("free")}</option>
                      <option value="paid">{tc("paid")}</option>
                    </select>
                    <label className={`block text-sm mb-2 `}>
                      {t("registration")}
                    </label>
                    <select
                      value={filters.registrationFilter}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          registrationFilter: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark
                          ? "bg-gray-900 border-gray-700 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    >
                      <option value="all">{tc("all")}</option>
                      <option value="true">{tc("required")}</option>
                      <option value="false">{tc("not_required")}</option>
                    </select>
                    <label className={`block text-sm mb-2 `}>
                      {t("date_range")}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={filters?.dateRangeFilter.start}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            dateRangeFilter: {
                              ...filters.dateRangeFilter,
                              start: e.target.value,
                            },
                          })
                        }
                        className={`w-full px-3 py-2 rounded-lg border text-sm ${
                          isDark
                            ? "bg-gray-900 border-gray-700 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                      <input
                        type="date"
                        value={filters?.dateRangeFilter.end}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            dateRangeFilter: {
                              ...filters.dateRangeFilter,
                              end: e.target.value,
                            },
                          })
                        }
                        className={`w-full px-3 py-2 rounded-lg border text-sm ${
                          isDark
                            ? "bg-gray-900 border-gray-700 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ── Active Filter Chips ── */}
              {(currentTab === "Businesses" &&
                (filters.hasProductFilter !== "all" ||
                  filters.primaryCategory !== "all")) ||
              (currentTab === "Products" && filters.businessId) ? (
                <div className="flex flex-col items-start gap-1">
                  <label
                    className={`block text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {t("active_filters")}
                  </label>
                  <div className="flex gap-2 items-center">
                    <div className="flex flex-wrap gap-2 mb-2 mt-2">
                      {Object.entries(filters).map(([key, value]) => {
                        if (!value || value === "all") return null;
                        if (typeof value === "object") return null;

                        // Only show chips relevant to current tab
                        if (currentTab === "Businesses" && key === "businessId")
                          return null;
                        if (currentTab === "Products" && key !== "businessId")
                          return null;

                        let displayValue = value;
                        if (key === "hasProductFilter")
                          displayValue = value === "yes" ? t("yes") : t("no");
                        else if (key === "primaryCategory") {
                          const found = categoryFilter?.find(
                            (item: any) => item._id === value,
                          );
                          displayValue = found?.name || value;
                        } else if (key === "businessId") {
                          const found = businesses?.find(
                            (item: any) => item._id === value,
                          );
                          displayValue = found?.name || value;
                        }

                        return (
                          <FilterChips
                            key={key}
                            label={displayValue}
                            onRemove={() =>
                              setFilters((prev: Filters) => ({
                                ...prev,
                                [key as keyof Filters]:
                                  key === "businessId" ? null : "all",
                              }))
                            }
                          />
                        );
                      })}
                    </div>
                    <button
                      onClick={clearFilter}
                      className="px-3 py-1 mb-2 mt-2 bg-red-500/20 text-red-500 rounded-full text-xs hover:bg-red-500/30 transition-colors whitespace-nowrap"
                    >
                      {t("clear_all")}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Selection badge */}
      {selectedItems.size > 0 && (
        <div className="flex items-center justify-between mb-1 px-1">
          <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
            {selectedItems.size} item{selectedItems.size > 1 ? "s" : ""}{" "}
            selected — drag to drop all
          </span>
          <button
            onClick={() => setSelectedItems(new Map())}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Scrollable card grid */}
      <div
        id="scrollableDiv"
        className="overflow-y-scroll h-[56vh] px-2 py-4"
        onClick={handleContainerClick}
      >
        <Spinner isLoading={isLoading} />
        <div className={clsx("grid grid-cols-12 gap-2")}>
          {combinedBusinesses?.map((item: any) => (
            <ContentCard
              key={item._id}
              _id={item._id}
              name={item?.name}
              descripition={item?.shortDescription}
              image={item?.images?.[0]?.image}
              categoryName={item?.primaryCategoryId?.name}
              viewMode={viewMode}
              isExpanded={isExpanded}
              isSelected={selectedItems.has(item._id)}
              selectedItems={selectedItems}
              contentType={TAB_TO_CONTENT_TYPE[currentTab] ?? "business"}
              handleClick={(e) => handleClick(e, item)}
              handleContextMenu={() => handleContextMenu(item)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contents;
