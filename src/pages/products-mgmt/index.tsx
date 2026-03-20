import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Package,
  Settings2,
  ArrowUpDown,
  ArrowUp,
  ChevronUp,
  ChevronDown,
  Columns,
} from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  BulkActionBar,
  ConfirmDialog,
  PageHeader,
  PageStats,
  ViewModeToggle,
} from "@/components/shared";
import {
  CreateProductWizard,
  ProductGridView,
  ProductListView,
} from "./components";

import {
  useGetAllProductsQuery,
  useGetProductStatsQuery,
} from "@/store/api/productQueryApi";
import SearchInput from "@/components/shared/SearchInput";
import { FilterButton } from "@/components/btns";
import { useBulkProductsUpdateMutation } from "@/store/api/productMutationApi";
import {
  useGetBusinessForProductQuery,
  useLazyGetBusinessForProductQuery,
} from "@/store/api/businessQueryApi";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ReactSelect } from "@/components/form-fields";
import { useAppSelector } from "@/hooks/hooks";
import { useRemoteSelectData } from "@/hooks/useRemoteSelectData";
import { formatILS } from "@/helpers/formatter";
import { skipToken } from "@reduxjs/toolkit/query";
import FilterChips from "@/components/shared/FilterChips";
import EmptyState from "@/components/shared/EmptyState";
import { FilterByStatus } from "@/components/filter-fields";

// ─────────────────────────────────────────────────────────────
// Constants & Types
// ─────────────────────────────────────────────────────────────
const LIMIT = 20;
const STORAGE_KEY = "product_query_state";
const COLUMNS_STORAGE_KEY = "productsTableColumns";
const SEARCH_STORAGE_KEY = "productSearchTerm";

type IColumnVisibility = {
  images: boolean;
  name: boolean;
  businessId: boolean;
  shortDescription: boolean;
  description: boolean;
  actions: boolean;
  status: boolean;
  price: boolean;
  impact: boolean;
  quantity: boolean;
  updatedAt: boolean;
};

const defaultColumns: IColumnVisibility = {
  images: true,
  name: true,
  businessId: true,
  shortDescription: false,
  description: true,
  actions: true,
  status: true,
  price: true,
  impact: true,
  quantity: true,
  updatedAt: false,
};

const columnDefinitions: Array<{
  key: keyof IColumnVisibility;
  isDefault: boolean;
}> = [
  { key: "images", isDefault: true },
  { key: "name", isDefault: true },
  { key: "businessId", isDefault: true },
  { key: "shortDescription", isDefault: false },
  { key: "description", isDefault: true },
  { key: "status", isDefault: true },
  { key: "price", isDefault: true },
  { key: "actions", isDefault: true },
  { key: "impact", isDefault: true },
  { key: "quantity", isDefault: true },
  { key: "updatedAt", isDefault: false },
];

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function ProductsMgmtPage() {
  const { t } = useTranslation("products");
  const { t: tc } = useTranslation("toast");
  const { t: tb } = useTranslation("businesses");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlBusinessId = searchParams?.get("businessId");
  const urlBusinessName = searchParams?.get("businessName");
  const urlBusinessNameProduct = searchParams?.get("businessNameProduct");

  useEffect(() => {
    if (urlBusinessId && urlBusinessName) {
      handleCreateNew();
    }
  }, [urlBusinessId, urlBusinessName]);

  const { dmoId, authorityId, startDate, endDate } = useAppSelector(
    (state) => state.auth,
  );

  const {
    isDark,
    isRTL,
    language,
    bgPrimary,
    bgSecondary,
    borderColor,
    textSecondary,
    textTertiary,
  } = useThemeClasses();

  // ─── Local State ─────────────────────────────────────────
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set(),
  );
  const [combinedProducts, setCombinedProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "all" as const,
    locale: language,
    businessId: "",
  });
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [columnVisibility, setColumnVisibility] =
    useState<IColumnVisibility>(defaultColumns);

  const columnSettingsRef = useRef<HTMLDivElement>(null);
  const hasSavedFilters = filters.businessId !== "" || filters.status !== "all";

  // ─── Load persisted state on mount ─────────
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (saved?.filters) setFilters(saved.filters);
      if (saved?.searchTerm) setSearchTerm(saved.searchTerm);
      if (saved?.page) setPage(saved.page);
      if (saved?.viewMode) setViewMode(saved.viewMode);
    } catch (e) {
      console.error("Failed to load saved state:", e);
    }
  }, []);

  // Load column visibility
  useEffect(() => {
    try {
      const saved = localStorage.getItem(COLUMNS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setColumnVisibility((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error("Failed to load column settings:", e);
    }
  }, []);

  // ─── Persist state to localStorage ─────────
  useEffect(() => {
    const { status, locale, businessId } = filters;
    if (
      status !== "all" ||
      locale !== language ||
      businessId !== "" ||
      searchTerm !== ""
    ) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ filters, searchTerm, page, viewMode }),
      );
    }
  }, [filters, language, searchTerm, page, viewMode]);

  useEffect(() => {
    localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  // useEffect(() => {
  //   if (searchTerm) {
  //     localStorage.setItem(SEARCH_STORAGE_KEY, searchTerm);
  //   } else {
  //     localStorage.removeItem(SEARCH_STORAGE_KEY);
  //   }
  // }, [searchTerm]);

  // ─── Close column dropdown on outside click ─────────
  useEffect(() => {
    if (!showColumnSettings) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        columnSettingsRef.current &&
        !columnSettingsRef.current.contains(event.target as Node)
      ) {
        setShowColumnSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showColumnSettings]);

  // ─── Reset page when filters/search change ─────────
  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    filters,
    language,
    urlBusinessId,
    dmoId,
    authorityId,
    startDate,
    endDate,
  ]);

  // ─── Business Data Fetching ─────────
  const { data: businessData, isLoading: _isBusinessesLoading } =
    useGetBusinessForProductQuery(
      !urlBusinessId
        ? {
            locale: language,
            limit: 20,
            page: 1,
            dmoId,
            authorityId,
            startDate,
            endDate,
          }
        : skipToken,
    );
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

  // ─── Query Parameters (memoized) ─────────
  const productQueryParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      limit: LIMIT,
      locale: language,
      dmoId,
      authorityId,
      startDate,
      endDate,
    };
    const finalSearchTerm =
      localStorage.getItem(SEARCH_STORAGE_KEY) ?? searchTerm;
    if (finalSearchTerm) params.search = finalSearchTerm;
    if (filters.status !== "all") params.status = filters?.status;

    // Priority: URL param > filter > none
    const effectiveBusinessId = urlBusinessId || filters.businessId || "";
    if (effectiveBusinessId) params.businessId = effectiveBusinessId;

    return params;
  }, [
    page,
    status,
    searchTerm,
    filters,
    language,
    urlBusinessId,
    dmoId,
    authorityId,
    startDate,
    endDate,
  ]);

  // ─── API Queries ─────────
  const statsQueryParams = useMemo(() => {
    const { page, limit, status, locale, ...rest } = productQueryParams;
    return rest;
  }, [productQueryParams]);

  const { data: productStats, isLoading: isStatsLoading } =
    useGetProductStatsQuery(statsQueryParams);

  const {
    data: productData,
    refetch,
    isFetching,
    isLoading: isLoadingProduct,
  } = useGetAllProductsQuery(productQueryParams);

  const [bulkProductsUpdate, { isLoading: isDeleting }] =
    useBulkProductsUpdateMutation();

  const hasMore = productData?.meta?.hasNextPage;
  const totalData = productData?.totalData;

  // ─── Infinite Scroll: Merge new data safely ─────────
  useEffect(() => {
    if (!productData?.data?.length) {
      setCombinedProducts([]);
      return;
    }
    setCombinedProducts((prev) => {
      if (page === 1) return productData?.data;
      const existingIds = new Set(prev.map((p) => p._id));
      const newItems = productData?.data.filter(
        (p: any) => !existingIds.has(p._id),
      );
      return newItems.length ? [...prev, ...newItems] : prev;
    });
  }, [productData, page]);

  const fetchNextPage = useCallback(() => {
    if (!hasMore || isFetching) return;
    setPage((prev) => prev + 1);
  }, [hasMore, isFetching]);

  // ─── Handlers (memoized) ─────────
  const handleCreateNew = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const removeQueryParams = useCallback(() => {
    navigate({}, { replace: true });
  }, [navigate]);

  const clearFilter = useCallback((filterKey: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: filterKey === "businessId" ? "" : "all",
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({ status: "all", locale: language, businessId: "" });
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SEARCH_STORAGE_KEY);
    setSearchTerm("");
    setPage(1);
    setCombinedProducts(productData?.data);
  }, [language]);

  const resetToDefault = useCallback(() => {
    setColumnVisibility(defaultColumns);
  }, []);

  const promptBulkDelete = useCallback(() => {
    if (!selectedProducts.size) return;
    setIsBulkDelete(true);
    setIsConfirmOpen(true);
  }, [selectedProducts.size]);

  const handleBulkDelete = useCallback(async () => {
    if (!selectedProducts.size) return;
    const toastId = toast.loading(tc("product_delete_loading"));
    try {
      const results = await bulkProductsUpdate({
        productsId: Array.from(selectedProducts),
        isDeleted: true,
      });
      if (results?.data) {
        toast.success(tc("product_deleted_success"), { id: toastId });
        setSelectedProducts(new Set());
        refetch();
      }
    } catch (error: any) {
      toast.error(error?.message || tc("product_delete_failed"), {
        id: toastId,
      });
    } finally {
      setIsConfirmOpen(false);
      setIsBulkDelete(false);
    }
  }, [selectedProducts, bulkProductsUpdate, refetch, tc]);

  const handleBulkStatusChange = useCallback(
    async (status: TStatus) => {
      if (!selectedProducts.size) return;
      const toastId = toast.loading(tc("product_status_change_loading"));
      try {
        const results = await bulkProductsUpdate({
          productsId: Array.from(selectedProducts),
          status: status.toUpperCase(),
        });
        if (results?.data) {
          toast.success(tc("product_status_update_success"), { id: toastId });
          setSelectedProducts(new Set());
          refetch();
        }
      } catch (error: any) {
        toast.error(error?.message || tc("product_status_update_failed"), {
          id: toastId,
        });
      }
    },
    [selectedProducts, bulkProductsUpdate, refetch, tc],
  );

  // ─── Stats Cards (memoized) ─────────
  const salesStats = useMemo(
    () => [
      {
        id: 1,
        title: t("total_revenue"),
        value: formatILS(productStats?.totalRevenue),
        label: t("all_time"),
        icon: <Package className="w-5 h-5 text-purple-600" />,
      },
      {
        id: 2,
        title: t("items_sold"),
        value: productStats?.itemsSold,
        label: t("total_units"),
        icon: <ArrowUpDown className="w-5 h-5 text-green-600" />,
      },
      {
        id: 3,
        title: t("avg_product_price"),
        value: formatILS(productStats?.averageProductPrice),
        label: t("per_product"),
        icon: <Settings2 className="w-5 h-5 text-blue-600" />,
      },
      {
        id: 4,
        title: t("revenue_this_month"),
        value: formatILS(productStats?.revenueThisMonth),
        label: t("current_month"),
        icon: <ArrowUp className="w-5 h-5 text-orange-600" />,
      },
    ],
    [productStats, t],
  );

  // ─── Render ─────────
  return (
    <>
      <div className="h-[calc(104vh-150px)] flex flex-col">
        <PageHeader
          title={t("products_management")}
          description={t("products_management_desc")}
          h1Gradient="bg-linear-to-r text-transparent from-blue-500 via-indigo-600 to-purple-600"
          btnLabel={t("add_products")}
          onClick={handleCreateNew}
          totalCount={totalData ?? 0}
        />
        <PageStats
          stats={salesStats}
          isLoading={isStatsLoading}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        />

        <div className="shrink-0 space-y-2 mb-2 mt-4">
          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="flex-1 relative max-w-full">
              <SearchInput
                placeholder={t("search_products")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                storageKey={SEARCH_STORAGE_KEY}
              />
            </div>

            <div className="flex items-center gap-3">
              <FilterButton value={showFilters} onChange={setShowFilters} />

              {viewMode === "list" && (
                <div className="relative" ref={columnSettingsRef}>
                  <button
                    onClick={() => setShowColumnSettings(!showColumnSettings)}
                    className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${
                      isDark
                        ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                        : "border-gray-300 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <Columns className="w-5 h-5" />
                    {t("show_columns")}
                    {showColumnSettings ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {showColumnSettings && (
                    <div
                      className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-64 rounded-lg shadow-lg max-h-96 overflow-y-auto border z-50 ${
                        isDark
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div
                        className={`p-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3
                            className={`text-sm ${isDark ? "text-gray-200" : "text-gray-900"}`}
                          >
                            {t("column_settings")}
                          </h3>
                          <button
                            onClick={resetToDefault}
                            className="text-xs text-teal-600 hover:text-teal-700"
                          >
                            {t("reset_to_default")}
                          </button>
                        </div>
                        <p
                          className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
                        >
                          {t("select_columns_to_display")}
                        </p>
                      </div>
                      <div className="p-3 space-y-1">
                        {columnDefinitions.map(({ key }) => (
                          <label
                            key={key}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                              isRTL ? "flex-row-reverse" : ""
                            } ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                          >
                            <input
                              type="checkbox"
                              checked={columnVisibility[key]}
                              onChange={(e) =>
                                setColumnVisibility((prev) => ({
                                  ...prev,
                                  [key]: e.target.checked,
                                }))
                              }
                              className="rounded"
                            />
                            <span className={`text-sm ${textSecondary}`}>
                              {t(key)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <ViewModeToggle
                onChange={(mode) => {
                  setViewMode(mode);
                  localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({
                      ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"),
                      viewMode: mode,
                    }),
                  );
                }}
                value={viewMode}
                tableName="productViewMode"
              />
            </div>
          </div>

          {/* Filters Panel */}
          {(showFilters || urlBusinessId || hasSavedFilters) && (
            <div
              className={`rounded-md border p-2 ${borderColor} ${bgPrimary}`}
            >
              <div className="flex gap-4 items-start w-full">
                <FilterByStatus filters={filters} setFilters={setFilters} />

                {!urlBusinessId && (
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

                {(filters.status !== "all" ||
                  filters.businessId !== "" ||
                  urlBusinessName ||
                  urlBusinessNameProduct) && (
                  <div className="flex flex-col min-w-45">
                    <label className={`block text-sm mb-1 ${textTertiary}`}>
                      {tb("active_filters")}:
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {filters.status !== "all" && (
                        <FilterChips
                          label={t(filters.status)}
                          onRemove={() => clearFilter("status")}
                        />
                      )}
                      {urlBusinessId && urlBusinessName && (
                        <FilterChips
                          label={urlBusinessName ?? ""}
                          onRemove={removeQueryParams}
                        />
                      )}
                      {urlBusinessId && !urlBusinessName && (
                        <FilterChips
                          label={urlBusinessNameProduct ?? ""}
                          onRemove={removeQueryParams}
                        />
                      )}

                      {filters.businessId && (
                        <FilterChips
                          label={
                            businesses?.find(
                              (b: any) => b._id === filters.businessId,
                            )?.name || filters.businessId
                          }
                          onRemove={() => clearFilter("businessId")}
                        />
                      )}
                      {(filters.status !== "all" ||
                        filters.businessId !== "") && (
                        <button
                          onClick={clearAllFilters}
                          className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-xs hover:bg-red-500/30 transition-colors"
                        >
                          {t("clear_all")}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedProducts.size > 0 && (
            <BulkActionBar
              selectedItemCount={selectedProducts.size}
              handleBulkStatusChange={handleBulkStatusChange}
              handleBulkDelete={promptBulkDelete}
              hancleClearSelection={() => setSelectedProducts(new Set())}
            />
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {!isLoadingProduct &&
          !isFetching &&
          combinedProducts?.length === 0 ? (
            <div
              className={`text-center py-16 ${bgSecondary} rounded-xl border ${borderColor}`}
            >
              {searchTerm ? (
                <EmptyState searchQuery={searchTerm} />
              ) : (
                <div className="text-center">
                  <Package
                    className={`w-16 h-16 mx-auto mb-4 ${textTertiary}`}
                  />
                  <p className={`${textTertiary} mb-6`}>
                    {t("no_products_desc")}
                  </p>
                  <button
                    onClick={handleCreateNew}
                    className="px-6 py-3 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    {t("create_product")}
                  </button>
                </div>
              )}
            </div>
          ) : viewMode === "list" ? (
            <ProductListView
              hasMore={!!hasMore}
              fetchNextPage={fetchNextPage}
              products={combinedProducts}
              isLoading={isLoadingProduct}
              selectedProducts={selectedProducts}
              setSelectedProducts={setSelectedProducts}
              columnVisibility={columnVisibility}
            />
          ) : (
            <ProductGridView
              hasMore={!!hasMore}
              refetch={refetch}
              fetchNextPage={fetchNextPage}
              products={combinedProducts}
              isLoading={isLoadingProduct || isFetching}
              selectedProducts={selectedProducts}
              setSelectedProducts={setSelectedProducts}
            />
          )}
        </div>

        {/* Modals */}
        <ConfirmDialog
          open={isConfirmOpen}
          title={t("delete_product")}
          message={t("delete_product_confirm")}
          confirmText="delete"
          loading={isDeleting}
          variant="danger"
          onCancel={() => {
            setIsConfirmOpen(false);
            setIsBulkDelete(false);
          }}
          onConfirm={() => {
            if (isBulkDelete) {
              handleBulkDelete();
            }
            setIsConfirmOpen(false);
          }}
        />
      </div>

      {isCreateModalOpen && (
        <CreateProductWizard
          onClose={() => setIsCreateModalOpen(false)}
          refetch={refetch}
        />
      )}
    </>
  );
}
