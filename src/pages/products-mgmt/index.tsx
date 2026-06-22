import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Package, Settings2, ArrowUpDown, ArrowUp } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  BulkActionBar,
  ConfirmDialog,
  PageHeader,
  PageStats,
  ShowColumns,
  ViewModeToggle,
} from "@/components/shared";
import {
  CreateProductWizard,
  ExportProductsButton,
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

  const { dmoId, authorityId, startDate, endDate } = useAppSelector(
    (state) => state.auth,
  );

  const {
    isDark,
    language,
    bgPrimary,
    bgSecondary,
    borderColor,
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

  // ─── Reset page and clear products when filters/search change ─────────
  useEffect(() => {
    setPage(1);
    setCombinedProducts([]);
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
    useGetProductStatsQuery(statsQueryParams, {
      refetchOnMountOrArgChange: true,
    });

  const {
    data: productData,
    refetch,
    isFetching,
    isLoading: isLoadingProduct,
  } = useGetAllProductsQuery(productQueryParams, {
    refetchOnMountOrArgChange: true,
  });

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

  const refetchFromPage1 = useCallback(() => {
    if (page === 1) {
      refetch();
    } else {
      setPage(1);
    }
  }, [page, refetch]);

  // ─── Handlers (memoized) ─────────
  const handleCreateNew = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  useEffect(() => {
    if (urlBusinessId && urlBusinessName) {
      handleCreateNew();
    }
  }, [urlBusinessId, urlBusinessName, handleCreateNew]);

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
    localStorage.removeItem(SEARCH_STORAGE_KEY);
    setSearchTerm("");
    setPage(1);
    setCombinedProducts([]);
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
      <div className="h-[calc(100vh-7rem)] flex flex-col overflow-hidden pt-10">
        <div className="shrink-0">
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
            className="sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4"
          />
        </div>

        <div className="shrink-0 space-y-2 mb-2 mt-4">
          {/* Toolbar */}
          <div className="flex flex-col gap-2">
            {/* Search */}
            <div className="flex-1 relative">
              <SearchInput
                placeholder={t("search_products")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                storageKey={SEARCH_STORAGE_KEY}
              />
            </div>

            <div className="flex items-center justify-between gap-2 relative">
              <div className="flex items-center gap-2">
                <FilterButton value={showFilters} onChange={setShowFilters} />
                <ShowColumns
                  t={t}
                  viewMode={viewMode}
                  columnDefinitions={columnDefinitions}
                  columnVisibility={columnVisibility}
                  showColumnSettings={showColumnSettings}
                  setShowColumnSettings={setShowColumnSettings}
                  setColumnVisibility={setColumnVisibility}
                  resetToDefault={resetToDefault}
                />
                <ExportProductsButton
                  products={combinedProducts}
                  selectedProducts={selectedProducts}
                  columnVisibility={columnVisibility}
                  t={t}
                />
              </div>

              <ViewModeToggle
                onChange={(mode) => {
                  setViewMode(mode);
                }}
                value={viewMode}
                tableName="productViewMode"
              />
            </div>
          </div>

          {/* Filters Panel */}
          {(showFilters || urlBusinessId || hasSavedFilters) && (
            <div
              className={`rounded-md border py-2 px-3 ${borderColor} ${bgPrimary}`}
            >
              <div className="flex flex-wrap gap-3 items-start w-full">
                <FilterByStatus filters={filters} setFilters={setFilters} />

                {!urlBusinessId && (
                  <div className="flex flex-col flex-1 min-w-35">
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
                  <div className="flex flex-col w-full sm:w-auto">
                    <label className={`block text-sm mb-1 ${textTertiary}`}>
                      {tb("active_filters")}:
                    </label>
                    <div className="flex flex-wrap gap-1.5 items-center">
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
                          className="px-2.5 py-1 bg-red-500/20 text-red-500 rounded-full text-xs hover:bg-red-500/30 transition-colors shrink-0"
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
        <div className="flex-1 overflow-y-auto min-h-0">
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
              isLoading={isLoadingProduct || isFetching}
              selectedProducts={selectedProducts}
              setSelectedProducts={setSelectedProducts}
              columnVisibility={columnVisibility}
              refetch={refetchFromPage1}
            />
          ) : (
            <ProductGridView
              hasMore={!!hasMore}
              refetch={refetchFromPage1}
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
          refetch={refetchFromPage1}
        />
      )}
    </>
  );
}
