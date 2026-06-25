import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Package, Settings2, ArrowUpDown, ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useAppSelector } from "@/hooks/hooks";
import { useRemoteSelectData } from "@/hooks/useRemoteSelectData";
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
  ProductFiltersPanel,
  ProductGridView,
  ProductListView,
} from "./components";
import {
  useGetBusinessForProductQuery,
  useLazyGetBusinessForProductQuery,
} from "@/store/api/businessQueryApi";
import SearchInput from "@/components/shared/SearchInput";
import { FilterButton } from "@/components/btns";
import { useBulkProductsUpdateMutation } from "@/store/api/productMutationApi";
import EmptyState from "@/components/shared/EmptyState";
import { formatILS } from "@/helpers/formatter";

import { useProductFilters } from "./hooks/useProductFilters";
import { useProductListData } from "./hooks/useProductListData";

// ─── Constants ────────────────────────────────────────────────────────────────

const COLUMNS_STORAGE_KEY = "productsTableColumns";

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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductsMgmtPage() {
  const { t } = useTranslation("products");
  const { t: tc } = useTranslation("toast");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlBusinessId = searchParams?.get("businessId");
  const urlBusinessName = searchParams?.get("businessName");
  const urlBusinessNameProduct = searchParams?.get("businessNameProduct");

  const { dmoId, authorityId, startDate, endDate } = useAppSelector(
    (state) => state.auth,
  );
  const { isDark, bgSecondary, borderColor, language } = useThemeClasses();

  // ─── Filter & Search (persisted to localStorage) ─────────────────────
  const {
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    clearFilter,
    hasSavedFilters,
  } = useProductFilters();

  // ─── Data fetching & infinite scroll ─────────────────────────────────
  const {
    combinedProducts,
    productStats,
    isLoading,
    isFetching,
    isStatsLoading,
    refetchFromPage1,
    hasMore,
    totalData,
    fetchNextPage,
  } = useProductListData(filters, searchTerm, urlBusinessId);

  // ─── UI State ─────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set(),
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [columnVisibility, setColumnVisibility] =
    useState<IColumnVisibility>(defaultColumns);

  const columnSettingsRef = useRef<HTMLDivElement>(null);

  // ─── Column visibility (persisted to localStorage) ────────────────────
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

  // ─── Close column dropdown on outside click ────────────────────────────
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

  // ─── Business Data for Filter Panel ──────────────────────────────────
  const { data: businessData, isLoading: isBusinessesLoading } =
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

  // ─── Mutations ─────────────────────────────────────────────────────────
  const [bulkProductsUpdate, { isLoading: isDeleting }] =
    useBulkProductsUpdateMutation();

  // ─── Handlers ─────────────────────────────────────────────────────────
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
        refetchFromPage1();
      }
    } catch (error: any) {
      toast.error(error?.message || tc("product_delete_failed"), {
        id: toastId,
      });
    } finally {
      setIsConfirmOpen(false);
      setIsBulkDelete(false);
    }
  }, [selectedProducts, bulkProductsUpdate, refetchFromPage1, tc]);

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
          refetchFromPage1();
        }
      } catch (error: any) {
        toast.error(error?.message || tc("product_status_update_failed"), {
          id: toastId,
        });
      }
    },
    [selectedProducts, bulkProductsUpdate, refetchFromPage1, tc],
  );

  // ─── Stats Cards ───────────────────────────────────────────────────────
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

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex flex-col pt-10 md:pt-0">
        {/* Sticky Header */}
        <div
          className={`border-b ${isDark ? "border-gray-800" : "bg-transparent border-gray-200"} z-30`}
        >
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

          {/* Search & Actions */}
          <div className="py-3 flex flex-col gap-2">
            <div className="flex-1 relative">
              <SearchInput
                placeholder={t("search_products")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>

            <div className="flex items-center justify-between gap-2 w-full">
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
                onChange={setViewMode}
                value={viewMode}
                tableName="productViewMode"
              />
            </div>
          </div>

          {/* Filters Panel */}
          {(showFilters || urlBusinessId || hasSavedFilters) && (
            <ProductFiltersPanel
              filters={filters}
              setFilters={setFilters}
              hasSavedFilters={hasSavedFilters}
              clearFilter={clearFilter}
              urlBusinessId={urlBusinessId}
              urlBusinessName={urlBusinessName}
              urlBusinessNameProduct={urlBusinessNameProduct}
              removeQueryParams={removeQueryParams}
              businesses={businesses ?? []}
              searchBusiness={searchBusiness}
              isSearching={isSearching}
              isBusinessesLoading={isBusinessesLoading}
            />
          )}

          <BulkActionBar
            selectedItemCount={selectedProducts.size}
            handleBulkStatusChange={handleBulkStatusChange}
            handleBulkDelete={promptBulkDelete}
            hancleClearSelection={() => setSelectedProducts(new Set())}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto mt-2">
          {!isLoading && !isFetching && combinedProducts?.length === 0 ? (
            <div
              className={`text-center py-16 ${bgSecondary} rounded-xl border ${borderColor}`}
            >
              {searchTerm ? (
                <EmptyState searchQuery={searchTerm} />
              ) : (
                <div className="text-center">
                  <Package className={`w-16 h-16 mx-auto mb-4 opacity-30`} />
                  <p className={`opacity-50 mb-6`}>{t("no_products_desc")}</p>
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
              isLoading={isLoading || isFetching}
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
              isLoading={isLoading || isFetching}
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
