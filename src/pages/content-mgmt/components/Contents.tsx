import { ContentGridView, ContentListView } from "./sub-components";
import React, { useState, useEffect, useMemo, useRef } from "react";


import { Button } from "@/components/ui/button";
import { useDrag} from "react-dnd";
import { toast } from "sonner";

import SearchInput from "@/components/shared/SearchInput";
import { ViewModeToggle } from "@/components/shared";
import { FilterButton } from "@/components/btns";
import { ReactMultiSelect } from "@/components/form-fields";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useCommon } from "@/hooks/useCommon";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetAllbusinessesQuery } from "@/store/api/businessQueryApi";
import { useAppSelector } from "@/hooks/hooks";
import FilterChips from "@/components/shared/FilterChips";

interface Filters {
  status: string;
  hasProductFilter: string;
  primaryCategory: string;
  accessibility: string[];
  groupTypes: string[];
}


interface Category {
  id: string;
  name: string;
  businessIds: string[];
  description: string;
}

const ItemTypes = {
  BUSINESS_CARD: "business_card",
};

const STORAGE_KEY = "content-manager-categories";


const Contents = () => {

  const { t } = useTranslation("businesses");


 const { dmoId, authorityId, startDate, endDate, websiteId } = useAppSelector(
    (state) => state.auth,
  );
  const { categories: categoryFilter, accessibility, groupTypes } = useCommon();

  const [categories, setCategories] = useState<Category[]>([]);

  const [viewMode, setViewMode] = useState<"list" | "grid">(
    (localStorage.getItem("contentViewMode") as "list" | "grid") ?? "list",
  );
  const [showFilters, setShowFilters] = useState(false);

  const [selectedCategories] = useState<string[]>([]);


  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    categoryId: string;
    categoryName: string;
    businessCount: number;
  } | null>(null);

  const [filters, setFilters] = useState<Filters>({
    status: "all",
    hasProductFilter: "all",
    primaryCategory: "all",
    accessibility: [],
    groupTypes: [],
  });

  const { isDark, language } = useThemeClasses();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const queryParams = useMemo(() => {
    const params: any = {
      page,
      dmoId,
      startDate,
      endDate,
      authorityId,
      limit: 20,
      locale: language,
      externalApiId: websiteId,
    };

    const finalSearchTerm = searchQuery;
    if (finalSearchTerm) params.search = finalSearchTerm;

    if (filters.status !== "all") {
      params.status = filters.status;
    }

    if (filters.hasProductFilter !== "all") {
      params.hasProductFilter = filters.hasProductFilter === "yes";
    }
    if (filters.primaryCategory !== "all") {
      params.categories = filters.primaryCategory;
    }
    if (filters.accessibility.length > 0) {
      params.accessibilityId = filters.accessibility;
    }
    if (filters.groupTypes.length > 0) {
      params.groupTypes = filters.groupTypes;
    }
    return params;
  }, [
    page,
    searchQuery,
    language,
    dmoId,
    authorityId,
    startDate,
    endDate,
    websiteId,
    filters,
  ]);

  const {
    data: businessData,
    isLoading: isBusinessLoading,
    isFetching,
    // refetch,
  } = useGetAllbusinessesQuery(queryParams);
  const hasMore = businessData?.meta?.hasNextPage;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filters, dmoId, authorityId, startDate, endDate]);


  const [combinedBusinesses, setCombinedBusinesses] = useState<any[]>([]);

  useEffect(() => {
    if (page === 1) {
      setCombinedBusinesses(businessData?.data);
    } else {
      setCombinedBusinesses((prev) => {
        const existingIds = new Set(prev.map((b) => b._id));
        const newItems = businessData?.data.filter(
          (b: any) => !existingIds.has(b._id),
        );

        return [...prev, ...newItems];
      });
    }
  }, [businessData?.data, page]);


  const clearFilter = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("businessSearchTerm");

    setFilters({
      status: "all",
      hasProductFilter: "all",
      primaryCategory: "all",
      accessibility: [],
      groupTypes: [],
    });
    setSearchQuery("");
    setPage(1);
  };
  const fetchNextPage = () => {
    console.log("fetch next");
    if (!hasMore || isFetching) return;
    setPage((prev: any) => {
      return prev + 1;
    });
  };
 

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.BUSINESS_CARD,
    canDrag: !isInCategory, //  (prevents dragging out from inside category)
    item: () => {
      // When dragging a card that is NOT selected, only drag that one
      if (!isSelected) {
        return {
          ids: [business._id], ///usedrop id not matching
          isMultiple: false,
          count: 1,
        };
      }

      // When the card IS selected drag all currently selected items
      if (selectedIds.size > 0) {
        return {
          ids: Array.from(selectedIds),
          isMultiple: true,
          count: selectedIds.size,
        };
      }

      // fallback (shouldn't happen)
      return {
        ids: [business.id],
        isMultiple: false,
        count: 1,
      };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleClick = (e: React.MouseEvent) => {
    const isMulti = e.ctrlKey || e.metaKey || e.shiftKey;
    onSelect(business.id, isMulti);
  };

  const handleContextMenu = () => {
    if (!isSelected) {
      onSelect(business.id, false);
    }
  };


  const backlogBusinesses = useMemo(() => {
    return businessData?.data?.filter((business: any) => {
      if (selectedCategories?.length > 0) {
        const hasCat = business.categories?.some((c: any) =>
          selectedCategories?.includes(c),
        );
        if (!hasCat) return false;
      }
      return true;
    });
  }, [selectedCategories, businessData?.data]);



  const confirmDelete = () => {
    if (deleteConfirmation) {
      setCategories((prev) =>
        prev.filter((c) => c.id !== deleteConfirmation.categoryId),
      );
      toast.success(t("category_deleted"));
      setDeleteConfirmation(null);
    }
  };

  const selectionClasses = isSelected
    ? "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700 ring-2 ring-rose-400/50"
    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600";

  const draggingClasses = isDragging ? "opacity-50" : "opacity-100";

  const baseClasses = `
      cursor-pointer transition-all border
      ${draggingClasses}
      ${selectionClasses}
    `;

  const logoSrc = business?.logo?.image;
  const logoAlt = business?.name;
  const primaryCategory = business?.primaryCategoryId;
  const scrollRef = useRef<HTMLDivElement | null>(null);


  useInfiniteScroll({
    ref: scrollRef,
    hasMore,
    isLoading: isBusinessLoading,
    onLoadMore: fetchNextPage,
  });

  return (
    <div className="flex-1 min-w-0">
      <div className="">
        <div className="mb-4 shrink-0">
          <h2
            className={`${isDark ? "text-gray-400" : "text-gray-700"} text-lg font-semibold`}
          >
            {t("source_backlog_title")}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("source_backlog_description", {
              count: backlogBusinesses?.length,
            })}
          </p>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <SearchInput
                placeholder={t("search_businesses_placeholder")}
                searchTerm={searchQuery}
                setSearchTerm={setSearchQuery}
                storageKey="contentSearchTerm"
              />
            </div>
            <FilterButton
              value={showFilters}
              onChange={setShowFilters}
            />

            <ViewModeToggle
              onChange={setViewMode}
              value={viewMode}
              tableName="contentViewMode"
            />
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div
              className={` border-t py-2 ${isDark
                ? "border-gray-800 bg-gray-900/30"
                : "border-gray-200 bg-gray-50"
                }`}
            >
              {/* Active Filters Title */}
              <div className="flex flex-wrap items-start gap-4 ml-4  w-full">
                <div className="grid grid-cols-3 gap-2">
                  {/* Status Filter */}
                  <div className="flex flex-col min-w-45">
                    <label
                      className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {t("status")}
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          status: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 rounded-lg border ${isDark
                        ? "bg-gray-800 border-gray-700 text-gray-200"
                        : "bg-white border-gray-300 text-gray-900"
                        } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    >
                      <option value="all">{t("all")}</option>
                      <option value="DRAFT">{t("draft")}</option>
                      <option value="PENDING">
                        {t("pending")}
                      </option>
                      <option value="APPROVED">
                        {t("approved")}
                      </option>
                      <option value="REJECTED">
                        {t("rejected")}
                      </option>
                      <option value="CLOSED">{t("closed")}</option>
                    </select>
                  </div>

                  {/* Has Products Filter */}
                  <div className="flex flex-col min-w-45">
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
                      className={`w-full px-3 py-2 rounded-lg border ${isDark
                        ? "bg-gray-800 border-gray-700 text-gray-200"
                        : "bg-white border-gray-300 text-gray-900"
                        } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    >
                      <option value="all">{t("all")}</option>
                      <option value="yes">{t("yes")}</option>
                      <option value="no">{t("no")}</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div className="flex flex-col min-w-45">
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
                      className={`w-full px-3 py-2 rounded-lg border ${isDark
                        ? "bg-gray-800 border-gray-700 text-gray-200"
                        : "bg-white border-gray-300 text-gray-900"
                        } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    >
                      <option value="">{t("all")}</option>
                      {categoryFilter?.map((cat: any) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Accessibility Filter */}
                  <div className="flex flex-col min-w-45">
                    <ReactMultiSelect
                      label={t("accessibility")}
                      options={accessibility?.map((cat: any) => ({
                        label: t(cat.name),
                        value: cat._id,
                      }))}
                      value={filters.accessibility}
                      onChange={(values) =>
                        setFilters((prev) => ({
                          ...prev,
                          accessibility: values,
                        }))
                      }
                    />
                  </div>

                  {/* Group Types Filter */}
                  <div className="flex flex-col min-w-45">
                    <ReactMultiSelect
                      label={t("group_types")}
                      options={groupTypes?.map((cat: any) => ({
                        label: t(cat.name),
                        value: cat._id,
                      }))}
                      value={filters.groupTypes}
                      onChange={(values) =>
                        setFilters((prev) => ({
                          ...prev,
                          groupTypes: values,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Active Filters Label + Chips */}
                {(filters?.status !== "all" ||
                  filters?.hasProductFilter !== "all" ||
                  filters?.primaryCategory !== "all") && (
                    <div className="flex flex-col min-w-45">
                      {/* Label inline with other filter labels */}
                      <label
                        className={`block text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {t("active_filters")}
                      </label>
                      <div className="flex gap-2 items-center">
                        {" "}
                        {/* Chips row */}
                        <div className="flex flex-wrap gap-2 mb-2 mt-2">
                          {Object.entries(filters).map(
                            ([key, value]) => {
                              if (!value || value === "all")
                                return null;

                              let displayValue = value;
                              if (key === "status") {
                                displayValue =
                                  t(value.toLowerCase()) || value;
                              } else if (key === "hasProductFilter") {
                                displayValue =
                                  value === "yes"
                                    ? t("yes")
                                    : t("no");
                              } else if (key === "primaryCategory") {
                                const selectedprimaryCategory =
                                  categoryFilter?.find(
                                    (item: any) => item._id === value,
                                  );
                                displayValue =
                                  selectedprimaryCategory?.name ||
                                  value;
                              }
                              return (
                                <FilterChips
                                  key={key}
                                  label={displayValue}
                                  onRemove={() => {
                                    if (key === "status") {
                                      setFilters((prev) => ({
                                        ...prev,
                                        status: "all",
                                      }));
                                    } else if (
                                      key === "accessibility"
                                    ) {
                                      setFilters((prev) => ({
                                        ...prev,
                                        accessibility: [],
                                      }));
                                    } else {
                                      setFilters((prev) => ({
                                        ...prev,
                                        [key]: "all",
                                      }));
                                    }
                                  }}
                                />
                              );
                            },
                          )}
                        </div>
                        {/* Clear All Button */}
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

        {deleteConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            {/* Backdrop click to close */}
            <div
              className="absolute inset-0"
              onClick={() => setDeleteConfirmation(null)}
            />

            {/* Modal content */}
            <div className="relative w-full max-w-md rounded-lg border bg-white p-6 shadow-2xl dark:bg-gray-900 dark:border-gray-700">
              <h3 className="text-lg font-semibold">
                Delete "{deleteConfirmation.categoryName}"?
              </h3>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                This category contains{" "}
                <span className="font-medium text-foreground">
                  {deleteConfirmation.businessCount} business
                  {deleteConfirmation.businessCount !== 1
                    ? "es"
                    : ""}
                </span>
                . This action cannot be undone.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmation(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        <div
          className={
            viewMode === "grid"
              ? `grid gap-4 max-h-[96vh] overflow-y-auto ${sidebarState === "collapsed"
                ? "grid-cols-4"
                : "grid-cols-1  lg:grid-cols-2"
              }`
              : "grid grid-cols-1 space-y-3 max-h-[96vh] overflow-y-auto"
          }
        >
          {combinedBusinesses?.map((business: any) => {
            return (
              <div>
                <ContentListView
                  drag={drag}
                  handleClick={handleClick}
                  handleContextMenu={handleContextMenu}
                  baseClasses={baseClasses}
                  logoSrc={logoSrc}
                  logoAlt={logoAlt}
                  business={business}
                  language={language}
                  fetchNextPage={fetchNextPage}
                  hasMore={hasMore}
                  isBusinessLoading={isBusinessLoading}
                  primaryCategory={primaryCategory}
                  isInCategory={isInCategory}
                  onRemove={onRemove}
                />

                <ContentGridView
                  drag={drag}
                  handleClick={handleClick}
                  handleContextMenu={handleContextMenu}
                  baseClasses={baseClasses}
                  logoSrc={logoSrc}
                  logoAlt={logoAlt}
                  isInCategory={isInCategory}
                  fetchNextPage={fetchNextPage}
                  language={language}
                  hasMore={hasMore}
                  onRemove={onRemove}
                  business={business}
                  isBusinessLoading={isBusinessLoading}
                  primaryCategory={primaryCategory}
                />
              </div>
            )
          })
          }
        </div>
      </div>
    </div>
  )
}

export default Contents