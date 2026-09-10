import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";

import clsx from "clsx";
import {
  Package,
  Settings2,
  ArrowUpDown,
  ArrowUp,
  Compass,
} from "lucide-react";

import { FilterButton } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useAppSelector } from "@/hooks/hooks";
import { useRemoteSelectData } from "@/hooks/useRemoteSelectData";
import {
  BulkActionBar,
  ConfirmDialog,
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
import { useBulkProductsUpdateMutation } from "@/store/api/productMutationApi";
import SearchInput from "@/components/shared/SearchInput";
import EmptyState from "@/components/shared/EmptyState";
import { TourProvider, TourPortal, useTour } from "@/components/tour";
import type { TourStep } from "@/components/tour";
import { formatILS } from "@/helpers/formatter";
import ListHeaderBar from "@/components/shared/ListHeaderBar";

import { useProductFilters } from "./hooks/useProductFilters";
import { useProductListData } from "./hooks/useProductListData";
import { PRODUCT_COLUMNS } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const { defaultColumns, columnDefinitions, COLUMNS_STORAGE_KEY } =
  PRODUCT_COLUMNS;

// ─── Main Component ───────────────────────────────────────────────────────────

function ProductsMgmtPageInner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlBusinessId = searchParams?.get("businessId");
  const urlBusinessName = searchParams?.get("businessName");
  const urlBusinessNameProduct = searchParams?.get("businessNameProduct");

  const { t } = useTranslation(["products", "common"]);
  const { t: tc } = useTranslation("toast");
  const { t: tt } = useTranslation("tour");
  const { startDate, endDate } = useAppSelector((state) => state.auth);
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set(),
  );

  const [columnVisibility, setColumnVisibility] =
    useState<IProductColumnVisibility>(defaultColumns);

  const columnSettingsRef = useRef<HTMLDivElement>(null);

  // ─── Tour integration ─────────────────────────────────────────────────
  const {
    isOpen: isTourOpen,
    steps: tourSteps,
    currentStep,
    startTour,
    refreshTargetRect,
  } = useTour();

  const buildSteps = useCallback(
    (): TourStep[] => [
      {
        id: "welcome",
        placement: "center",
        title: "product_list.welcome.title",
        desc: "product_list.welcome.desc",
      },
      {
        id: "page-header",
        target: '[data-tour="page-header"]',
        placement: "bottom",
        title: "product_list.page_header.title",
        desc: "product_list.page_header.desc",
      },
      {
        id: "stats",
        target: '[data-tour="stats"]',
        placement: "bottom",
        title: "product_list.stats.title",
        desc: "product_list.stats.desc",
      },
      {
        id: "search",
        target: '[data-tour="search"]',
        placement: "bottom",
        title: "product_list.search.title",
        desc: "product_list.search.desc",
      },
      {
        id: "toolbar",
        target: '[data-tour="toolbar"]',
        placement: "bottom",
        title: "product_list.toolbar.title",
        desc: "product_list.toolbar.desc",
      },
      {
        id: "filter-panel",
        target: '[data-tour="filter-panel"]',
        placement: "bottom",
        title: "product_list.filter_panel.title",
        desc: "product_list.filter_panel.desc",
      },
      {
        id: "product-list",
        target: '[data-tour="product-list"]',
        placement: "top",
        title: "product_list.product_list.title",
        desc: "product_list.product_list.desc",
      },
    ],
    [],
  );

  // Open filter panel when tour lands on that step
  useEffect(() => {
    if (!isTourOpen) return;
    const stepId = tourSteps[currentStep]?.id;
    if (stepId === "filter-panel") {
      setShowFilters(true);
      const raf = requestAnimationFrame(() => {
        setTimeout(() => refreshTargetRect(), 40);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isTourOpen, currentStep, tourSteps, refreshTargetRect]);

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
    searchParams: { locale: language, startDate, endDate },
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
      <div className="flex flex-col pt-4 md:pt-0 gap-3 relative">
        {/* Sticky Top Header Bar (Title + Add Button + Horizontal Scrollable Stats) */}
        <div
          className={clsx(
            "sticky top-14 md:top-20 z-30 transition-all duration-200 py-2.5 px-3 md:px-4 rounded-2xl border backdrop-blur-md shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3",
            isDark
              ? "bg-gray-950/95 border-gray-800/90 shadow-black/40 text-gray-100"
              : "bg-white/95 border-gray-200/90 shadow-gray-200/40 text-gray-900",
          )}
        >
          <ListHeaderBar
            title={t("products_management")}
            count={totalData}
            addLabel={t("add_products")}
            onAdd={handleCreateNew}
            stats={salesStats}
            isStatsLoading={isStatsLoading}
            dataTourHeader="page-header"
            dataTourStats="stats"
          />
        </div>

        {/* Search bar (always visible) + collapsible controls on the same row */}
        <div
          className={clsx(
            "transition-all duration-300 py-3 px-3 md:px-4 rounded-2xl border shadow-md flex flex-col gap-3",
            isDark
              ? "bg-gray-900/90 border-gray-800/90"
              : "bg-white border-gray-200",
          )}
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex-1 min-w-0 relative" data-tour="search">
              <SearchInput
                placeholder={t("search_products")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>

            <div
              className="flex items-center justify-between gap-2 w-full lg:w-auto flex-wrap"
              data-tour="toolbar"
            >
              <div className="flex items-center gap-2 flex-wrap">
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

              <div className="flex items-center gap-2">
                <button
                  onClick={() => startTour(buildSteps())}
                  title={tt("start_tour")}
                  className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isDark
                      ? "border-gray-700 hover:bg-gray-800 text-gray-400 hover:text-teal-400"
                      : "border-gray-300 hover:bg-gray-100 text-gray-500 hover:text-teal-600"
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {t("tour") ?? tt("start_tour")}
                  </span>
                </button>
                <ViewModeToggle
                  onChange={setViewMode}
                  value={viewMode}
                  tableName="productViewMode"
                />
              </div>
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

        {/* Content Area (product list/grid rendered naturally) */}
        <div className="flex-1 mt-1" data-tour="product-list">
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
      {isCreateModalOpen && (
        <CreateProductWizard
          onClose={() => setIsCreateModalOpen(false)}
          refetch={refetchFromPage1}
        />
      )}

      <TourPortal />
    </>
  );
}

// ─── Exported page (wraps with TourProvider) ──────────────────────────────────

export default function ProductsMgmtPage() {
  return (
    <TourProvider>
      <ProductsMgmtPageInner />
    </TourProvider>
  );
}
