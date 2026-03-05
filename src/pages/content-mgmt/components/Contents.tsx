import clsx from "clsx";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
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

interface Filters {
  status: string;
  hasProductFilter: string;
  primaryCategory: string;
}

interface ContentsProps {
  isLoading: boolean;
  isExpanded: boolean;
  viewMode: TViewMode;
  combinedBusinesses: any[];
  hasMore: boolean;
  filters: Filters;
  totalData: number;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  fetchNextPage: () => void;
  clearFilter: () => void;
  setViewMode: (v: TViewMode) => void;
  templateContents: IContentTemplate[];
  setTemplateContent: (value: IContentTemplate[]) => void;
}

const Contents = ({
  isLoading,
  isExpanded,
  viewMode,
  hasMore,
  setViewMode,
  combinedBusinesses,
  fetchNextPage,
  clearFilter,
  filters,
  setFilters,
  totalData,
}: ContentsProps) => {
  const { t } = useTranslation("content");
  const { isDark, textTertiary } = useThemeClasses();
  const { categories: categoryFilter } = useCommon();

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Map<string, any>>(
    new Map(),
  );

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
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ({t("source_backlog_description", { count: totalData })})
          </p>
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
          <FilterButton value={showFilters} onChange={setShowFilters} />
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
              <div className="grid grid-cols-3 gap-2 pb-2">
                {/* Status */}
                <div className="flex flex-col">
                  <label
                    className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {t("status")}
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-300 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  >
                    <option value="all">{t("all")}</option>
                    <option value="DRAFT">{t("draft")}</option>
                    <option value="PENDING">{t("pending")}</option>
                    <option value="APPROVED">{t("approved")}</option>
                    <option value="REJECTED">{t("rejected")}</option>
                    <option value="CLOSED">{t("closed")}</option>
                  </select>
                </div>

                {/* Has Products */}
                <div className="flex flex-col">
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

                {/* Category */}
                <div className="flex flex-col">
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
              </div>

              {/* Active Filter Chips */}
              {(filters.status !== "all" ||
                filters.hasProductFilter !== "all" ||
                filters.primaryCategory !== "all") && (
                <div className="flex items-center gap-2">
                  <label
                    className={`block text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {t("active_filters")}
                  </label>
                  <div className="flex gap-2 items-center">
                    <div className="flex flex-wrap gap-2 mb-2 mt-2">
                      {Object.entries(filters).map(([key, value]) => {
                        if (!value || value === "all") return null;
                        let displayValue = value;
                        if (key === "status")
                          displayValue = t(value.toLowerCase()) || value;
                        else if (key === "hasProductFilter")
                          displayValue = value === "yes" ? t("yes") : t("no");
                        else if (key === "primaryCategory") {
                          const found = categoryFilter?.find(
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
                                [key as keyof Filters]: "all",
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
              )}
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
        <InfiniteScroll
          dataLength={combinedBusinesses?.length}
          next={fetchNextPage}
          hasMore={hasMore}
          scrollableTarget="scrollableDiv"
          loader={
            <p className={clsx("text-center mt-4", textTertiary)}>
              {t("loading_text")}
            </p>
          }
          endMessage={
            !hasMore && (
              <p className={clsx("text-center mt-4", textTertiary)}>
                {t("loading_end_text")}
              </p>
            )
          }
        >
          <div className={clsx("grid grid-cols-12 gap-2")}>
            {combinedBusinesses?.map((item: any) => (
              <ContentCard
                key={item._id}
                _id={item._id}
                name={item?.name}
                descripition={item?.shortDescription}
                image={item?.images?.[0]?.image}
                categoryName=""
                viewMode={viewMode}
                isExpanded={isExpanded}
                isSelected={selectedItems.has(item._id)}
                selectedItems={selectedItems}
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
