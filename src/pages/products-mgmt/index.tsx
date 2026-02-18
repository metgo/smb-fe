import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { useSearchParams } from "react-router-dom";
import { ReactSelect } from "@/components/form-fields";
import { useAppSelector } from "@/hooks/hooks";
import { useRemoteSelectData } from "@/hooks/useRemoteSelectData";
import { formatILS } from "@/helpers/formatter";
import { skipToken } from "@reduxjs/toolkit/query";
import FilterChips from "@/components/shared/FilterChips";
import EmptyState from "@/components/shared/EmptyState";

const LIMIT = 20;
const defaultColumns = {
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
  updatedAt: false, //  optional
};

const columnDefinitions = [
  { key: "images" as keyof IColumnVisibility, isDefault: true },
  { key: "name" as keyof IColumnVisibility, isDefault: true },
  { key: "businessId" as keyof IColumnVisibility, isDefault: true },
  { key: "shortDescription" as keyof IColumnVisibility, isDefault: false },
  { key: "description" as keyof IColumnVisibility, isDefault: true },
  { key: "status" as keyof IColumnVisibility, isDefault: true },
  { key: "price" as keyof IColumnVisibility, isDefault: true },
  { key: "actions" as keyof IColumnVisibility, isDefault: true },
  { key: "impact" as keyof IColumnVisibility, isDefault: true },
  { key: "quantity" as keyof IColumnVisibility, isDefault: true },
  { key: "updatedAt" as keyof IColumnVisibility, isDefault: false },
];

export default function ProductsMgmtPage() {
  const { t } = useTranslation("products");
  const { dmoId, authorityId, startDate, endDate } = useAppSelector(
    (state) => state.auth,
  );

  const [searchParams] = useSearchParams();
  const businessId = searchParams?.get("businessId");
  // const businessName = searchParams?.get("businessName");
  const bzIdForProdView = searchParams?.get("bzIdForProdView");

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
  const { data: businessData, isLoading: _isBusinessesLoading } =
    useGetBusinessForProductQuery(
      !bzIdForProdView
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
    searchParams: {
      locale: language,
      dmoId,
      authorityId,
      startDate,
      endDate,
    },
    lazySearch: async (params) => {
      const res = await getBusinessList(params).unwrap();
      return { data: res?.data };
    },
  });

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [showFilters, setShowFilters] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  //select products
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set(),
  );
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [combinedProducts, setCombinedProducts] = useState<any[]>([]);

  const removeQueryParams = () => {
    const param = searchParams.get("bzIdForProdView");
    if (param) {
      searchParams.delete("bzIdForProdView");
    }
  };

  //filters
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [filters, setFilters] = useState({
    status: "all",
    locale: language,
    businessId: "",
  });
  const [_clearBusiness, setClearBusiness] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const clearFilter = (filterKey: string) => {
    setClearBusiness(true);
    setFilters((prev) => ({
      ...prev,
      [filterKey]: "all",
    }));
  };

  useEffect(() => {
    if (businessId) {
      setIsCreateModalOpen(true);
    }
  }, [businessId]);

  const productQueryParams = useMemo(() => {
    const params: any = {
      page,
      limit: LIMIT,
      locale: language,
      dmoId,
      authorityId,
      startDate,
      endDate,
    };

    const finalSearchTerm =
      localStorage.getItem("productSearchTerm") ?? searchTerm;
    if (finalSearchTerm) params.search = finalSearchTerm;

    if (filters.status !== "all") {
      params.status = filters.status.toUpperCase();
    }

    if (filters.businessId !== "") {
      params.businessId = filters.businessId;
    }

    if (bzIdForProdView) {
      params.businessId = bzIdForProdView;
    }

    return params;
  }, [
    page,
    searchTerm,
    filters,
    language,
    bzIdForProdView,
    dmoId,
    authorityId,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    filters,
    language,
    bzIdForProdView,
    dmoId,
    authorityId,
    startDate,
    endDate,
  ]);

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

  const products = productData?.data ?? [];
  const hasMore = productData?.meta?.hasNextPage;
  const totalData = productData?.totalData;

  useEffect(() => {
    if (page === 1) setCombinedProducts(products);
    else {
      setCombinedProducts((prev: any) => {
        const existingIds = new Set(prev.map((b: any) => b._id));
        const newItems = products?.filter((b: any) => !existingIds?.has(b._id));

        return [...prev, ...newItems];
      });
    }
  }, [products, page]);

  const fetchNextPage = () => {
    if (!hasMore || isFetching) return;
    setPage((prev) => {
      return prev + 1;
    });
  };

  const handleCreateNew = () => {
    setSelectedProduct(null);
    setIsCreateModalOpen(true);
  };
  const promptBulkDelete = () => {
    if (selectedProducts.size === 0) return;
    setIsBulkDelete(true); // mark bulk delete mode
    setIsConfirmOpen(true); // open confirmation dialog
  };

  //bulk delete
  const handleBulkDelete = async () => {
    if (!selectedProducts.size) return;
    setIsConfirmOpen(true);

    const toastId = toast.loading("Please wait. Products are deleting...");
    try {
      const results = await bulkProductsUpdate({
        productsId: Array.from(selectedProducts),
        isDeleted: true,
      });

      if (results?.data) {
        const message = "Products deleted successfully";
        toast.success(message, { id: toastId });
        setSelectedProducts(new Set());
        refetch();
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete Products");
    }
  };

  // //bulk status change
  const handleBulkStatusChange = async (status: TStatus) => {
    if (!selectedProducts.size) return;
    toast.loading("Please wait. Product's status are changing...");

    try {
      const results = await bulkProductsUpdate({
        productsId: Array.from(selectedProducts),
        status,
      });

      if (results?.data) {
        const message = "Products status updated successfully";
        toast.success(message);
        setSelectedProducts(new Set());
        refetch();
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to change Products status");
    }
  };

  //column settings
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const columnSettingsRef = useRef<HTMLDivElement>(null);

  const [columnVisibility, seIColumnVisibility] =
    useState<IColumnVisibility>(defaultColumns);
  // Reset to default columns
  const resetToDefault = () => {
    seIColumnVisibility(defaultColumns);
  };

  const salesStats = [
    {
      id: 1,
      title: t("total_revenue"),
      value: formatILS(productStats?.totalRevenue),
      label: t("all_time") || "All Time",
      icon: <Package className="w-5 h-5 text-purple-600" />,
    },
    {
      id: 2,
      title: t("items_sold"),
      value: productStats?.itemsSold,
      label: t("total_units") || "Total Units",
      icon: <ArrowUpDown className="w-5 h-5 text-green-600" />,
    },
    {
      id: 3,
      title: t("avg_product_price"),
      value: formatILS(productStats?.averageProductPrice),
      label: t("per_product") || "Per Product",
      icon: <Settings2 className="w-5 h-5 text-blue-600" />,
    },
    {
      id: 4,
      title: t("revenue_this_month"),
      value: formatILS(productStats?.revenueThisMonth),
      label: t("current_month") || "Current Month",
      icon: <ArrowUp className="w-5 h-5 text-orange-600" />,
    },
  ];

  return (
    <>
      <div className="h-[calc(104vh-204px)] flex flex-col">
        <PageHeader
          title={t("products_management")}
          description={t("products_management_desc")}
          h1Gradient="bg-linear-to-r  text-transparent from-blue-500 via-indigo-600 to-purple-600"
          btnLabel={t("add_products")}
          onClick={handleCreateNew}
          totalCount={totalData ?? 0}
        />
        <PageStats
          stats={salesStats}
          isLoading={isStatsLoading}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        />

        <div className="shrink-0">
          {/* Toolbar */}
          <div className="py-4 flex flex-col lg:flex-row items-center justify-between gap-3">
            {/* Search - extreme left */}
            <div className="flex-1 relative max-w-full ">
              <SearchInput
                placeholder={t("search_products")}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                storageKey="productSearchTerm"
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

                  {/* Column Settings Dropdown */}
                  {showColumnSettings && (
                    <div
                      className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-64 rounded-lg shadow-lg max-h-50vh overflow-y-auto border z-100 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                    >
                      <div
                        className={`p-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3
                            className={`text-sm ${isDark ? "text-gray-200" : "text-gray-900"}`}
                          >
                            {t("column_settings") || "Column Settings"}
                          </h3>
                          <button
                            onClick={resetToDefault}
                            className="text-xs text-teal-600 hover:text-teal-700 transition-colors"
                          >
                            {t("reset_to_default") || "Reset to Default"}
                          </button>
                        </div>
                        <p
                          className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
                        >
                          {t("select_columns_to_display") ||
                            "Select columns to display"}
                        </p>
                      </div>
                      <div className="p-3 max-h-96 overflow-y-auto">
                        {/* Default Columns */}
                        {Object.entries(columnVisibility)
                          .filter(
                            ([key]) =>
                              columnDefinitions.find((col) => col.key === key)
                                ?.isDefault,
                          )
                          .map(([key, visible]) => (
                            <label
                              key={key}
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer  dark:hover:bg-gray-700 ${
                                isRTL ? "flex-row-reverse justify-end" : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={visible}
                                onChange={(e) =>
                                  seIColumnVisibility((prev) => ({
                                    ...prev,
                                    [key]: e.target.checked,
                                  }))
                                }
                                className="rounded"
                              />
                              <span className={`text-sm ${textSecondary}`}>
                                {t(key as keyof typeof t)}
                              </span>
                            </label>
                          ))}

                        {/* Divider */}
                        {columnDefinitions.some((col) => !col.isDefault) && (
                          <div className="my-3 border-t border-gray-200 dark:border-gray-700" />
                        )}

                        {/* Non-default Columns */}
                        <p
                          className={`text-xs mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                        >
                          Optional Columns
                        </p>
                        {Object.entries(columnVisibility)
                          .filter(
                            ([key]) =>
                              !columnDefinitions.find((col) => col.key === key)
                                ?.isDefault,
                          )
                          .map(([key, visible]) => (
                            <label
                              key={key}
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                                isRTL ? "flex-row-reverse justify-end" : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={visible}
                                onChange={(e) =>
                                  seIColumnVisibility((prev) => ({
                                    ...prev,
                                    [key]: e.target.checked,
                                  }))
                                }
                                className="rounded"
                              />
                              <span className={`text-sm ${textSecondary}`}>
                                {t(key as keyof typeof t)}
                              </span>
                            </label>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* View Mode Toggle */}
              <ViewModeToggle onChange={setViewMode} value={viewMode} />
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div
              className={`p-4 rounded-md border ${borderColor} ${bgPrimary}`}
            >
              <div className="grid grid-cols-1 z-5 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    className={`block text-sm mb-1 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {t("filter_by_status")}
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-gray-200"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  >
                    <option value="all">{t("all")}</option>
                    <option value="draft">{t("draft")}</option>
                    <option value="active">{t("active")}</option>
                    <option value="inactive">{t("inactive")}</option>
                  </select>
                </div>

                {!bzIdForProdView && (
                  <div>
                    <label
                      className={`block text-sm mb-1 ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {t("filter_by_business")}
                    </label>

                    <ReactSelect
                      isClearable
                      value={filters?.businessId ?? ""}
                      onChange={(businessId) => {
                        setFilters((prev) => ({
                          ...prev,
                          businessId: businessId,
                        }));
                      }}
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
              </div>
              <div className="flex mt-4 gap-6 items-center">
                <div>
                  {/* Clear all button */}
                  {Object.entries(filters).some(
                    ([_, val]) => val !== "all",
                  ) && (
                    <button
                      onClick={() => {
                        setFilters({
                          status: "all",
                          locale: language,
                          businessId: "",
                        });
                        removeQueryParams();
                      }}
                      className="ml-auto text-sm text-green-600"
                    >
                      {t("clear_all")}
                    </button>
                  )}
                </div>

                {/* Active filters display and clear all button */}
                <div className="flex items-start gap-3">
                  {/* Show active filters */}
                  {Object.entries(filters).some(
                    ([_, val]) => val !== "all",
                  ) && (
                    <div className="flex flex-wrap items-center gap-2">
                      {filters.status !== "all" && (
                        <FilterChips
                          label={t(filters.status)}
                          onRemove={() => clearFilter("status")}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedProducts?.size > 0 && (
            <BulkActionBar
              isProduct
              selectedItemCount={selectedProducts?.size || 0}
              handleBulkStatusChange={handleBulkStatusChange}
              handleBulkDelete={promptBulkDelete}
            />
          )}
        </div>

        {/* Scrollable Table Section */}
        <div className="flex-1 overflow-y-auto">
          <div className=" mx-auto">
            {/* Products Content */}
            {combinedProducts?.length === 0 &&
            !(isFetching || isLoadingProduct) ? (
              <div
                className={`text-center py-16 ${bgSecondary} rounded-xl border ${borderColor}`}
              >
                {searchTerm ? (
                  <div>
                    <EmptyState searchQuery={searchTerm} />
                  </div>
                ) : (
                  <div className="text-center">
                    <Package
                      className={`w-16 h-16 mx-auto mb-4 ${textTertiary}`}
                    />

                    <p className={`${textTertiary} mb-6`}>
                      {t("no_products_desc")}
                    </p>

                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="px-6 py-3 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      {t("create_product")}
                    </button>
                  </div>
                )}
              </div>
            ) : viewMode === "list" ? (
              <ProductListView
                hasMore={hasMore}
                fetchNextPage={fetchNextPage}
                products={combinedProducts}
                isLoading={isLoadingProduct || isFetching}
                selectedProducts={selectedProducts}
                setSelectedProducts={setSelectedProducts}
                columnVisibility={columnVisibility}
              />
            ) : (
              <ProductGridView
                hasMore={hasMore}
                refetch={refetch}
                fetchNextPage={fetchNextPage}
                products={combinedProducts}
                isLoading={isLoadingProduct || isFetching}
                selectedProducts={selectedProducts}
                setSelectedProducts={setSelectedProducts}
              />
            )}
          </div>
        </div>
        <ConfirmDialog
          open={isConfirmOpen}
          title={t("delete_product")}
          message={t("delete_product_confirm")}
          confirmText="delete"
          loading={isDeleting}
          variant="danger"
          onCancel={() => {
            setIsConfirmOpen(false);
            setItemToDelete(null);
          }}
          onConfirm={() => {
            setIsConfirmOpen(false);

            if (isBulkDelete) {
              handleBulkDelete();
              setIsBulkDelete(false);
              setIsConfirmOpen(false);
            } else {
              if (!itemToDelete) return;
              setItemToDelete(null);
            }
          }}
        />
      </div>

      {/* Create Product Wizard */}
      {isCreateModalOpen && (
        <CreateProductWizard
          onClose={() => setIsCreateModalOpen(false)}
          selectedProduct={selectedProduct}
          refetch={refetch}
        />
      )}
    </>
  );
}
