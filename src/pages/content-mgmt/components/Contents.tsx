import clsx from "clsx";
import { CheckCircle2, Circle } from "lucide-react";
import { useTranslation } from "react-i18next";
import React, { useState, useCallback, useMemo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

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
// import { ReactSelect } from "@/components/form-fields"; // Commented out - unused after product filters disabled for TRAVELLER
import { useGetBusinessForProductQuery } from "@/store/api/businessQueryApi";
// import { useRemoteSelectData } from "@/hooks/useRemoteSelectData"; // Commented out - unused after product filters disabled for TRAVELLER
import { useAppSelector } from "@/hooks/hooks";

interface Filters {
  hasProductFilter: string;
  primaryCategory: string;
  businessId: string;
  assignmentStatus: string; // 'all' | 'assigned' | 'unassigned'
  viewCategory: string; // category titleHe or 'all'
  sortOrder: string; // 'recent' | 'alpha'
}

interface ContentsProps {
  selected: string | null;
  setSelected: (v: string) => void;
  isLoading: boolean;
  isFetching?: boolean;
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
  loadMore?: () => void;
  hasMore?: boolean;
  hiddenTabs?: string[];
}
const ALL_FILTER_OPTIONS = ["Businesses", "Products"];

const TAB_TO_CONTENT_TYPE: Record<string, IContent["contentType"]> = {
  Businesses: "business",
  Products: "product",
};

type TInViewFilter = "all" | "assigned" | "unassigned";

const IN_VIEW_FILTER_OPTIONS: {
  value: TInViewFilter;
  labelKey: string;
}[] = [
  { value: "all", labelKey: "in_view_filter_all" },
  { value: "assigned", labelKey: "in_view_filter_included" },
  { value: "unassigned", labelKey: "in_view_filter_unincluded" },
];

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
};
const Contents = ({
  isLoading,
  isFetching = false,
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
  loadMore,
  hasMore,
  templateContents,
  hiddenTabs = [],
}: ContentsProps) => {
  const FILTER_OPTIONS = ALL_FILTER_OPTIONS.filter(
    (tab) => !hiddenTabs.includes(tab),
  );
  const { t } = useTranslation("content");
  const { t: tc } = useTranslation("common");

  const { isDark, language, textTertiary } = useThemeClasses();
  const { categories: categoryFilter } = useCommon();

  const [showFilters, setShowFilters] = useState(false);
  // "In view / Not in view" toggle — backed by the shared `assignmentStatus`
  // filter so it is applied server-side via useContentData.
  const inViewFilter: TInViewFilter =
    (filters.assignmentStatus as TInViewFilter) || "all";
  const setInViewFilter = (value: TInViewFilter) =>
    setFilters({ ...filters, assignmentStatus: value, viewCategory: "all" });
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

  // Commented out - unused after product filters disabled for TRAVELLER
  // const {
  //   items: businesses,
  //   search: searchBusiness,
  //   isSearching,
  // } = useRemoteSelectData({
  //   initialData: businessData?.data,
  //   debounceMs: 400,
  //   searchParams: { locale: language, dmoId, authorityId, startDate, endDate },
  //   lazySearch: async (params) => {
  //     const res = await getBusinessList(params).unwrap();
  //     return { data: res?.data };
  //   },
  // });
  const businesses = businessData?.data;
  // ─── Derive assigned IDs and view categories from templateContents ────────
  // templateContents uses IContentTemplate: { topic, groups: [{ category, contents: [{ _id, contentType }] }] }
  // const assignedBusinessIds = useMemo(() => {
  //   const ids = new Set<string>();
  //   templateContents?.forEach((topic) =>
  //     topic.groups?.forEach((group) =>
  //       group.contents
  //         ?.filter((c) => c.contentType === "business")
  //         .forEach((c) => ids.add(c._id?.toString())),
  //     ),
  //   );
  //   return ids;
  // }, [templateContents]);

  // const assignedProductIds = useMemo(() => {
  //   const ids = new Set<string>();
  //   templateContents?.forEach((topic) =>
  //     topic.groups?.forEach((group) =>
  //       group.contents
  //         ?.filter((c) => c.contentType === "product")
  //         .forEach((c) => ids.add(c._id?.toString())),
  //     ),
  //   );
  //   return ids;
  // }, [templateContents]);

  const viewCategories = useMemo(() => {
    const cats: {
      label: string;
      businessIds: string[];
      productIds: string[];
    }[] = [];
    templateContents?.forEach((topic) =>
      topic.groups?.forEach((group) => {
        const label = group.category;
        if (!label) return;
        const businessIds = (group.contents ?? [])
          .filter((c) => c.contentType === "business")
          .map((c) => c._id?.toString());
        const productIds = (group.contents ?? [])
          .filter((c) => c.contentType === "product")
          .map((c) => c._id?.toString());
        cats.push({ label, businessIds, productIds });
      }),
    );
    return cats;
  }, [templateContents]);

  // ─── IDs of items already included in the currently loaded view ───────────
  // templateContents holds the view/template currently open in the composer.
  const currentContentType = TAB_TO_CONTENT_TYPE[currentTab] ?? "business";
  const inViewIds = useMemo(() => {
    const ids = new Set<string>();
    templateContents?.forEach((topic) =>
      topic.groups?.forEach((group) =>
        group.contents
          ?.filter((c) => c.contentType === currentContentType)
          .forEach((c) => c._id && ids.add(c._id.toString())),
      ),
    );
    return ids;
  }, [templateContents, currentContentType]);

  const filteredItems = useMemo(() => {
    let items = combinedBusinesses ?? [];

    if (filters.sortOrder === "alpha") {
      items = [...items].sort((a, b) => {
        const nameA = (a.name || a.nameHe || "").toLowerCase();
        const nameB = (b.name || b.nameHe || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } else {
      // 'recent' — newest first (default)
      items = [...items].sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      });
    }

    return items;
  }, [combinedBusinesses, filters.sortOrder]);

  // ─── Selection handler ────────────────────────────────────────────────────
  const handleSelect = useCallback(
    (item: any, isMulti: boolean) => {
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
    },
    [setSelectedItems],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent, item: any) => {
      const isMulti = e.ctrlKey || e.metaKey || e.shiftKey;
      handleSelect(item, isMulti);
    },
    [handleSelect],
  );

  const handleContextMenu = useCallback(
    (item: any) => {
      // Right-click selects the card if not already in selection
      setSelectedItems((prev) => {
        if (prev.has(item._id)) return prev; // already selected — keep selection
        const next = new Map();
        next.set(item._id, item);
        return next;
      });
    },
    [setSelectedItems],
  );

  // Click on the empty area of the list clears the selection
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setSelectedItems(new Map());
    }
  };

  return (
    <div className="flex-1 min-w-0">
      <div
        className={clsx(
          "border px-2 py-1 rounded-md",
          isDark ? "border-gray-500" : "border-gray-200",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <h2
            className={`${isDark ? "text-gray-400" : "text-gray-700"} text-lg font-semibold`}
          >
            {t("source_backlog_title")}
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400 flex gap-1">
            <div>{totalData}</div>
            {currentTab} {t("available")}
          </div>

          <div className="flex ml-auto">
            <div className="flex items-center gap-1">
              {FILTER_OPTIONS.map((option) => {
                const isSelected = selected === option;
                const count = tabCounts[option] ?? "?";
                const isTabLoading = tabLoadings[option] ?? false;
                return (
                  <button
                    key={option}
                    onClick={() => setSelected(option)}
                    className={clsx(
                      "group relative flex items-center gap-0.5 rounded-md px-2 py-1.5 transition-colors border",
                      isSelected
                        ? "bg-teal-500/15 border-teal-500/40 text-teal-600"
                        : isDark
                          ? "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                          : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600",
                    )}
                  >
                    {FILTER_ICONS[option]}
                    {isTabLoading ? (
                      <span className="flex items-center gap-px">
                        <span
                          className={clsx(
                            "w-1 h-1 rounded-full animate-bounce [animation-delay:0ms]",
                            isSelected
                              ? "bg-teal-500"
                              : isDark
                                ? "bg-gray-400"
                                : "bg-gray-400",
                          )}
                        />
                        <span
                          className={clsx(
                            "w-1 h-1 rounded-full animate-bounce [animation-delay:150ms]",
                            isSelected
                              ? "bg-teal-500"
                              : isDark
                                ? "bg-gray-400"
                                : "bg-gray-400",
                          )}
                        />
                        <span
                          className={clsx(
                            "w-1 h-1 rounded-full animate-bounce [animation-delay:300ms]",
                            isSelected
                              ? "bg-teal-500"
                              : isDark
                                ? "bg-gray-400"
                                : "bg-gray-400",
                          )}
                        />
                      </span>
                    ) : (
                      <span
                        className={clsx(
                          "text-xs leading-none tabular-nums font-bold px-1.5 py-0.5 rounded-full",
                          isSelected
                            ? "bg-teal-500/20 text-teal-600"
                            : isDark
                              ? "bg-gray-700 text-gray-400"
                              : "bg-gray-100 text-gray-500",
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

        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 relative">
            <SearchInput
              placeholder={t("search_businesses_placeholder")}
              searchTerm={searchQuery}
              setSearchTerm={setSearchQuery}
              storageKey="contentSearchTerm"
            />
          </div>
          <FilterButton value={showFilters} onChange={setShowFilters} />
          <ViewModeToggle
            onChange={setViewMode}
            value={viewMode}
            tableName="contentViewMode"
          />
        </div>

        {/* ── "Already in view" filter switch ── */}
        <div className="flex items-center gap-1">
          <div
            className={clsx(
              "inline-flex items-center rounded-lg border p-0.5",
              isDark
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-gray-50",
            )}
          >
            {IN_VIEW_FILTER_OPTIONS.map((opt) => {
              const isActive = inViewFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setInViewFilter(opt.value)}
                  className={clsx(
                    "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-teal-500/15 text-teal-600"
                      : isDark
                        ? "text-gray-400 hover:text-gray-200"
                        : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  {opt.value === "assigned" && (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  {opt.value === "unassigned" && (
                    <Circle className="w-3.5 h-3.5" />
                  )}
                  {t(opt.labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div
            className={`border-t pt-2 ${isDark ? "border-gray-800 bg-gray-900/30" : "border-gray-200 bg-gray-50"}`}
          >
            <div className="flex flex-wrap items-start gap-4 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-8 gap-2 pb-2">
                {/* ── Business filters ── */}
                {currentTab === "Businesses" && (
                  <>
                    <div className="flex flex-col sm:col-span-4">
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

                    <div className="flex flex-col sm:col-span-4">
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
                {/* Products disabled for TRAVELLER purpose - commented out */}
                {/* {currentTab === "Products" && (
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
                )} */}

                {/* ── View-category filter (Businesses only - Products disabled for TRAVELLER).
                    "In view / Not in view" itself is the chip toggle above the list,
                    backed by filters.assignmentStatus. ── */}
                {currentTab === "Businesses" && (
                  <>
                    {filters.assignmentStatus !== "unassigned" &&
                      viewCategories.length > 0 && (
                        <div className="flex flex-col sm:col-span-4">
                          <label
                            className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                          >
                            Filter by Category
                          </label>
                          <select
                            value={filters.viewCategory}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                viewCategory: e.target.value,
                              })
                            }
                            className={`w-full px-3 py-2 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-300 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                          >
                            <option value="all">All categories</option>
                            {viewCategories.map((cat) => (
                              <option key={cat.label} value={cat.label}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                  </>
                )}

                {/* ── Sort order (Businesses only - Products disabled for TRAVELLER) ── */}
                {currentTab === "Businesses" && (
                  <div className="flex flex-col sm:col-span-4">
                    <label
                      className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Sort
                    </label>
                    <select
                      value={filters.sortOrder}
                      onChange={(e) =>
                        setFilters({ ...filters, sortOrder: e.target.value })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-300 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    >
                      <option value="recent">Most recently added</option>
                      <option value="alpha">Alphabetical (A–Z)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* ── Active Filter Chips ── */}
              {currentTab === "Businesses" &&
              (filters.hasProductFilter !== "all" ||
                filters.primaryCategory !== "all") ? (
                <div className="flex flex-col items-start gap-1">
                  <label
                    className={`block text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {t("active_filters")}
                  </label>
                  <div className="flex gap-2 items-center">
                    <div className="flex flex-wrap gap-2 mb-2 mt-2">
                      {Object.entries(filters).map(([key, value]) => {
                        if (!value || value === "all" || value === "")
                          return null;
                        if (typeof value === "object") return null;

                        // Only show chips relevant to current tab
                        if (currentTab === "Businesses" && key === "businessId")
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

        {/* Empty list: show a loading hint while a fetch is in flight,
            otherwise a "no results" message. Without this the panel renders
            blank during any refetch (filter / search / website change), since
            RTK's `isLoading` is false on refetches. */}
        {(filteredItems?.length ?? 0) === 0 && !isLoading ? (
          <p className={clsx("text-center mt-8", textTertiary)}>
            {isFetching ? t("loading_items") : t("no_results_found")}
          </p>
        ) : null}

        <InfiniteScroll
          dataLength={filteredItems?.length ?? 0}
          next={() => loadMore?.()}
          hasMore={!!hasMore && (filteredItems?.length ?? 0) > 0}
          scrollableTarget="scrollableDiv"
          loader={
            (filteredItems?.length ?? 0) > 0 ? (
              <p className={clsx("text-center mt-4", textTertiary)}>
                {tc("loading_text")}
              </p>
            ) : null
          }
          endMessage={
            hasMore === false && (filteredItems?.length ?? 0) > 0 ? (
              <p className={clsx("text-center mt-4", textTertiary)}>
                {tc("loading_end_text")}
              </p>
            ) : null
          }
        >
          <div className={clsx("grid grid-cols-12 gap-2")}>
            {filteredItems?.map((item: any) => (
              <ContentCard
                key={item._id}
                _id={item._id}
                name={item?.name}
                descripition={item?.shortDescription}
                image={
                  typeof item?.images === "string"
                    ? item?.images
                    : item?.images?.[0]?.image
                }
                categoryName={item?.primaryCategoryId?.name}
                address={item?.address}
                viewMode={viewMode}
                isExpanded={isExpanded}
                isSelected={selectedItems.has(item._id)}
                isInView={inViewIds.has(item._id?.toString())}
                selectedItems={selectedItems}
                contentType={currentContentType}
                handleClick={(e) => handleClick(e, item)}
                handleContextMenu={() => handleContextMenu(item)}
              />
            ))}
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default Contents;
