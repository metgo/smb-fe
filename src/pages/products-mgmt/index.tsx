import {
  Package,
  Filter,
  Grid3x3,
  List,
  X,
  Check,
  Copy,
  Settings2,
  ArrowUpDown,
  ArrowUp,
  ChevronUp,
  ChevronDown,
  Columns,
} from "lucide-react";
import clsx from "clsx";

import { useProductMgmt } from "./useProductMgmt";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { PageHeader, PageStats, ReordableDataTable } from "@/components/shared";
import { CreateProductWizard } from "./components";
import { Activity, useMemo, useRef, useState } from "react";
import ProductDetails from "./details/inde";

import { useGetAllProductsQuery } from "@/store/api/productQueryApi";
import { useNavigate } from "react-router-dom";
import SearchInput from "@/components/shared/SearchInput";
import { useGetbusinessForProductQuery } from "@/store/api/businessQueryApi";
import ReactSelect from "react-select";

const businessId = "";
const defaultColumns = {
  images: true,
  name: true,
  businessId: true, //  optional
  productType: true,
  status: true,
  price: true,
  impact: false, //  optional
  quantity: false,
  updatedAt: false, //  optional
};

type ColumnVisibility = typeof defaultColumns;

const columnDefinitions = [
  { key: "images" as keyof ColumnVisibility, isDefault: true },
  { key: "name" as keyof ColumnVisibility, isDefault: true },
  { key: "businessId" as keyof ColumnVisibility, isDefault: true },
  { key: "productType" as keyof ColumnVisibility, isDefault: true },
  { key: "status" as keyof ColumnVisibility, isDefault: true },
  { key: "price" as keyof ColumnVisibility, isDefault: true },
  { key: "impact" as keyof ColumnVisibility, isDefault: false },
  { key: "quantity" as keyof ColumnVisibility, isDefault: false },
  { key: "updatedAt" as keyof ColumnVisibility, isDefault: false },
];
const USER_ROLE = "admin";

export default function ProductsMgmtPage() {
  const {
    t,
    isRTL,
    language,
    isDark,
    viewMode,
    setViewMode,
    isEditing,
    setIsEditing,
    selectedProduct,
    setSelectedProduct,
    selectedProducts,
    setSelectedProducts,
    showFilters,
    setShowFilters,
    // isCreating,
    setIsCreating,

    sortedProducts,
    handleBulkStatusChange,
    handleDuplicateProduct,
    salesMetrics,
    getProductTypeLabel,
    getStatusBadge,
  } = useProductMgmt();

  const { data: businessData, isLoading: isBusinessesLoading } =
    useGetbusinessForProductQuery({});
  const businesses = businessData?.data;
  const canChangeStatus = ["superadmin", "admin", "dmo", "authority"].includes(
    USER_ROLE,
  );

  //filters
  const [page, _setPage] = useState(1);
  const LIMIT = 10;
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filters, setFilters] = useState({
    status: "all",
    productType: "all",
    businessId: "all",
  });
  const [clearBusiness, setClearBusiness] = useState(false);
  const clearFilter = (filterKey: string) => {
    setClearBusiness(true);
    setFilters((prev) => ({
      ...prev,
      [filterKey]: "all",
    }));
  };

  const productQueryParams = useMemo(() => {
    const params: any = {
      page,
      limit: LIMIT,
    };

    if (searchTerm) {
      params.search = searchTerm;
    }

    if (filters.status !== "all") {
      params.status = filters.status.toUpperCase();
    }

    if (filters.productType !== "all") {
      params.productType = filters.productType.toUpperCase();
    }

    if (filters.businessId !== "all") {
      params.businessId = filters.businessId;
    }

    return params;
  }, [page, searchTerm, filters]);

  const [currentView, setCurrentView] = useState<
    "list" | "details" | "edit" | "create"
  >("list");
  const [productId, setProductId] = useState<string>("");
  const { textSecondary } = useThemeClasses();

  const themeColor = useThemeClasses();
  const navigate = useNavigate();

  const handleProductClick = (product: any) => {
    console.log("product grid", product);
    setSelectedProduct(product);
    setProductId(product?._id);
    navigate(`?productId=${product?._id}&productSlug=${product?.slug}`, {
      replace: true,
    });
    setCurrentView("details");
  };
  const handleCreateNew = () => {
    setSelectedProduct(null);
    setCurrentView("create");
  };
  const handleEdit = () => {
    setCurrentView("edit");
  };

  const {
    data: productData,
    isLoading: isLoadingProduct,
    refetch,
  } = useGetAllProductsQuery(productQueryParams);

  //column settings
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const columnSettingsRef = useRef<HTMLDivElement>(null);

  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibility>(defaultColumns);
  // Reset to default columns
  const resetToDefault = () => {
    setColumnVisibility(defaultColumns);
  };

  const columns = [
    ...(canChangeStatus ? [{ key: "checkbox", label: "", width: "50px" }] : []),

    columnVisibility.images && {
      key: "images",
      label: t("product_image"),
      render: (product: any) => (
        <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden">
          {product?.images?.length > 0 ? (
            <img
              src={product?.images[0]?.image}
              alt={product.name[language]}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-6 h-6 text-white" />
          )}
        </div>
      ),
    },

    columnVisibility.name && {
      key: "name",
      label: t("product_name"),
      sortable: true,
      render: (product: any) => (
        <div>
          <div className="font-medium">{product.name[language]}</div>
          <div className="text-xs text-gray-500 truncate max-w-xs">
            {product.name}
          </div>
        </div>
      ),
    },

    columnVisibility.businessId && {
      key: "businessId",
      label: t("business_name"),
      render: (product: any) => product.businessId?.name,
    },

    columnVisibility.productType && {
      key: "productType",
      label: t("product_type"),
      render: (product: any) => product.productType,
    },

    columnVisibility.status && {
      key: "status",
      label: t("product_status"),
      render: (product: any) => {
        const st = (product.status || "").toLowerCase();
        return (
          <span
            className={clsx(
              "inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium",
              st === "active"
                ? "bg-green-400 text-white"
                : st === "inactive"
                  ? "bg-yellow-500/20 text-yellow-600"
                  : st === "draft"
                    ? "bg-gray-500/20 text-gray-600"
                    : isDark
                      ? "bg-gray-700 text-gray-400"
                      : "bg-gray-100 text-gray-600",
            )}
          >
            {t(st) || st || t("unknown")}
          </span>
        );
      },
    },

    columnVisibility.price && {
      key: "price",
      label: t("price"),
      sortable: true,
      render: (product: any) => (
        <div>
          {product.price?.markedPrice !== product.price?.sellingPrice && (
            <div className="text-xs text-gray-400 line-through">
              ₪{product.markedPrice}
            </div>
          )}
          <div className="font-medium">₪{product.price?.markedPrice}</div>
        </div>
      ),
    },

    columnVisibility.impact && {
      key: "impact",
      label: t("impact"),
      sortable: true,
      render: (product: any) => <div>{product.impact}</div>,
    },

    columnVisibility.quantity && {
      key: "quantity",
      label: t("quantity"),
      sortable: true,
      render: (product: any) => product.quantity?.sold,
    },

    columnVisibility.updatedAt && {
      key: "updatedAt",
      label: t("last_updated"),
      sortable: true,
      render: (product: any) => (
        <div className={`p-3 ${themeColor.textTertiary} text-sm`}>
          {new Date(product.updatedAt).toLocaleDateString(language)}
        </div>
      ),
    },

    columnVisibility.actions && {
      key: "actions",
      label: t("actions"),
      render: (product: any) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDuplicateProduct(product);
          }}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Copy className="w-4 h-4" />
        </button>
      ),
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    width?: string;
    sortable?: boolean;
    render?: (row: any) => React.ReactNode;
  }[];

  const salesStats = [
    {
      id: 1,
      title: t("total_revenue"),
      value: `₪${salesMetrics.totalRevenue.toLocaleString()}`,
      label: t("all_time") || "All Time",
      icon: <Package className="w-5 h-5 text-purple-600" />,
    },
    {
      id: 2,
      title: t("items_sold"),
      value: salesMetrics.itemsSold.toLocaleString(),
      label: t("total_units") || "Total Units",
      icon: <ArrowUpDown className="w-5 h-5 text-green-600" />,
    },
    {
      id: 3,
      title: t("avg_product_price"),
      value: `₪${Math.round(salesMetrics.avgPrice).toLocaleString()}`,
      label: t("per_product") || "Per Product",
      icon: <Settings2 className="w-5 h-5 text-blue-600" />,
    },
    {
      id: 4,
      title: t("revenue_this_month"),
      value: `₪${salesMetrics.monthlyRevenue.toLocaleString()}`,
      label: t("current_month") || "Current Month",
      icon: <ArrowUp className="w-5 h-5 text-orange-600" />,
    },
  ];

  return (
    <>
      <Activity mode={currentView === "list" ? "visible" : "hidden"}>
        <div className="h-[calc(104vh-204px)] flex flex-col">
          <PageHeader
            title={t("products_management")}
            description={t("products_management_desc")}
            h1Gradient="bg-linear-to-r  text-transparent from-blue-500 via-indigo-600 to-purple-600"
            btnLabel={t("add_products")}
            onClick={handleCreateNew}
          />

          {/* Fixed Stats, Toolbar, Filters - Always Visible */}
          <div className="shrink-0 py-6 pb-0">
            <div className=" mx-auto">
              <PageStats
                stats={salesStats}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
              />

              {/* Toolbar */}
              <div className="py-4 flex flex-col lg:flex-row items-center justify-between gap-3">
                {/* Search - extreme left */}
                <div className="flex-1 relative max-w-full ">
                  <SearchInput
                    placeholder={t("search_products")}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                  />
                </div>

                {/* Right side group: Filter Button + View Mode Toggle */}
                <div className="flex items-center gap-3">
                  {/* Filter Button */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-3 py-2 rounded-lg border ${themeColor.borderColor} ${
                      showFilters
                        ? "bg-white dark:bg-teal-950 "
                        : themeColor.bgSecondary
                    } ${themeColor.textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2`}
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">{t("filters")}</span>
                    {showFilters ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {viewMode === "list" && (
                    <div className="relative" ref={columnSettingsRef}>
                      <button
                        onClick={() =>
                          setShowColumnSettings(!showColumnSettings)
                        }
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
                          className={`absolute ${isRTL ? "left-0" : "right-0"} mt-2 w-64 rounded-lg shadow-lg max-h-50vh overflow-y-auto border z-50 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
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
                                  columnDefinitions.find(
                                    (col) => col.key === key,
                                  )?.isDefault,
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
                                      setColumnVisibility((prev) => ({
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
                            {columnDefinitions.some(
                              (col) => !col.isDefault,
                            ) && (
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
                                  !columnDefinitions.find(
                                    (col) => col.key === key,
                                  )?.isDefault,
                              )
                              .map(([key, visible]) => (
                                <label
                                  key={key}
                                  className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                    isRTL ? "flex-row-reverse justify-end" : ""
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={visible}
                                    onChange={(e) =>
                                      setColumnVisibility((prev) => ({
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
                  <div
                    className={`flex items-center gap-1 p-1 rounded-lg border border-gray-300 ${isDark ? "bg-gray-900" : "bg-white"} `}
                  >
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded ${
                        viewMode === "list"
                          ? "bg-teal-500 text-white"
                          : "text-gray-500 dark:text-gray-400"
                      } `}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded ${
                        viewMode === "grid"
                          ? "bg-teal-500 text-white"
                          : "text-gray-500"
                      }`}
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div>
                  <div
                    className={`mb-6 p-4 rounded-t-sm border-t ${themeColor.borderColor} ${themeColor.bgSecondary}`}
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

                      <div>
                        <label
                          className={`block text-sm mb-1 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {t("filter_by_type")}
                        </label>
                        <select
                          value={filters.productType}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              productType: e.target.value,
                            }))
                          }
                          className={`w-full px-3 py-2 rounded-lg border ${
                            isDark
                              ? "bg-gray-800 border-gray-700 text-gray-200"
                              : "bg-white border-gray-300 text-gray-900"
                          } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                        >
                          <option value="all">{t("all")}</option>
                          <option value="physical">
                            {t("physical_product")}
                          </option>
                          <option value="table_order">
                            {t("table_order")}
                          </option>
                          <option value="service">{t("service")}</option>
                          <option value="hotel-room">{t("hotel_room")}</option>
                          <option value="experience">{t("experience")}</option>
                        </select>
                      </div>

                      {!businessId && (
                        <div>
                          <label
                            className={`block text-sm mb-1 ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {t("filter_by_business")}
                          </label>
                          {/* <select
                            value={filters.businessId}
                            onChange={(e) =>
                              setFilters((prev) => ({
                                ...prev,
                                businessId: e.target.value,
                              }))
                            }
                            className={`w-full px-3 py-2 rounded-lg border ${
                              isDark
                                ? "bg-gray-800 border-gray-700 text-gray-200"
                                : "bg-white border-gray-300 text-gray-900"
                            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                          >
                            <option value="all">{t("all_businesses")}</option>
                            {isBusinessesLoading ? (
                              <option disabled>{t("loading")}...</option>
                            ) : (
                              businessData?.data?.map((business: any) => (
                                <option key={business._id} value={business._id}>
                                  {business.name}
                                </option>
                              ))
                            )}
                          </select> */}
                          <ReactSelect
                            isClearable
                            value={filters.businessId?.name}
                            onChange={(selectedOption) => {
                              setFilters((prev) => ({
                                ...prev,
                                businessId: selectedOption?.value,
                              }));
                            }}
                            placeholder="Select Business"
                            options={
                              businessData?.data?.map((item: any) => ({
                                value: item._id,
                                label: item.name,
                                logo: item.logo,
                              })) ?? []
                            }
                            className="rounded-md z-5"
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
                            onClick={() =>
                              setFilters({
                                status: "all",
                                productType: "all",
                                businessId: "all",
                              })
                            }
                            className="ml-auto text-sm text-green-600 "
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
                              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-sm">
                                {t(filters.status)}
                                <button
                                  onClick={() => clearFilter("status")}
                                  aria-label="Clear status filter"
                                  className="ml-1 text-teal-800 hover:text-teal-600 focus:outline-none"
                                >
                                  ×
                                </button>
                              </span>
                            )}
                            {filters.productType !== "all" && (
                              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-sm">
                                {t(filters.productType)}
                                <button
                                  onClick={() => clearFilter("productType")}
                                  aria-label="Clear product type filter"
                                  className="ml-1 text-teal-800 hover:text-teal-600 focus:outline-none"
                                >
                                  ×
                                </button>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bulk Actions */}
              {selectedProducts.size > 0 && (
                <div
                  className={`mb-6 py-4 rounded-xl border ${themeColor.borderColor} bg-teal-50 dark:bg-teal-950/30 flex items-center justify-between gap-4`}
                >
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    <span className={themeColor.textSecondary}>
                      {selectedProducts.size} {t("selected_items")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBulkStatusChange("approved")}
                      className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                    >
                      {t("approve")}
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange("archived")}
                      className="px-3 py-1.5 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors"
                    >
                      {t("archive")}
                    </button>
                    <button
                      onClick={() => setSelectedProducts(new Set())}
                      className={`p-1.5 rounded-lg ${themeColor.hoverBg} ${themeColor.textSecondary}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Table Section */}
          <div className="flex-1 overflow-y-auto py-6 pb-6">
            <div className=" mx-auto">
              {/* Products Content */}
              {sortedProducts.length === 0 ? (
                // Empty State
                <div
                  className={`text-center py-16 ${themeColor.bgSecondary} rounded-xl border ${themeColor.borderColor}`}
                >
                  <Package
                    className={`w-16 h-16 mx-auto mb-4 ${themeColor.textTertiary}`}
                  />
                  <h3 className={`text-lg ${themeColor.textPrimary} mb-2`}>
                    {t("no_products")}
                  </h3>
                  <p className={`${themeColor.textTertiary} mb-6`}>
                    {t("no_products_desc")}
                  </p>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="px-6 py-3 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    {t("create_product")}
                  </button>
                </div>
              ) : viewMode === "list" ? (
                // List View
                <div
                  className={`rounded-xl border ${themeColor.borderColor} ${themeColor.bgSecondary} overflow-hidden max-h-[calc(100vh-400px)] overflow-y-auto`}
                >
                  <ReordableDataTable
                    rowKey="id"
                    isDataLoading={isLoadingProduct}
                    data={productData?.data}
                    selectedItems={selectedProducts}
                    onSelectionChange={setSelectedProducts}
                    onRowClick={(product) => handleProductClick(product)}
                    storageKey="productsTableColumnOrder"
                    columns={columns}
                  />
                </div>
              ) : (
                // Grid View
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {productData?.data?.map((product: any) => (
                    <div
                      key={product._id}
                      onClick={() => handleProductClick(product)}
                      className={`rounded-xl border ${themeColor.borderColor} ${themeColor.bgSecondary} overflow-hidden hover:shadow-lg transition-all cursor-pointer group`}
                    >
                      <div className="relative h-48 bg-linear-to-br from-blue-500 to-indigo-600">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-16 h-16 text-white opacity-50" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              const newSet = new Set(selectedProducts);
                              if (e.target.checked) {
                                newSet.add(product.id);
                              } else {
                                newSet.delete(product.id);
                              }
                              setSelectedProducts(newSet);
                            }}
                            className="rounded"
                          />
                        </div>
                        <div className="absolute top-3 right-3">
                          {getStatusBadge(product.status)}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3
                          className={`${themeColor.textPrimary} mb-2 font-medium line-clamp-2`}
                        >
                          {product.name}
                        </h3>
                        {/* <p
                          className={`text-sm ${themeColor.textTertiary} mb-3 line-clamp-2`}
                        >
                          {product.shortDescription[language]}
                        </p> */}
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`text-sm ${themeColor.textSecondary}`}
                          >
                            {getProductTypeLabel(product.type)}
                          </div>
                          <div className={themeColor.textPrimary}>
                            {product.markedPrice !== product.sellingPrice && (
                              <span className="text-xs text-gray-400 line-through mr-2">
                                ₪{product.markedPrice}
                              </span>
                            )}
                            <span className="font-medium">
                              ₪{product?.price?.selligPrice}
                            </span>
                          </div>
                        </div>
                        <div className={`text-xs ${themeColor.textTertiary}`}>
                          {product.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Activity>

      {/* Create/Edit Product Wizard */}
      {currentView === "create" && (
        <CreateProductWizard
          productId={productId}
          setProductId={setProductId}
          onClose={() => {
            setIsCreating(false);
            setIsEditing(false);
            setSelectedProduct(null);
            setCurrentView("list");
          }}
          selectedProduct={selectedProduct}
          preSelectedBusinessName={"abc"}
          currentView={currentView}
          businesses={businesses}
          businessData={businessData}
        />
      )}
      {currentView === "edit" && (
        <CreateProductWizard
          onClose={() => {
            setIsCreating(false);
            setIsEditing(false);
            setSelectedProduct(null);
            setCurrentView("list");
          }}
          businesses={businesses}
          selectedProduct={selectedProduct}
          productId={productId}
          setProductId={setProductId}
          currentView={currentView}
          isBusinessesLoading={isBusinessesLoading}
          businessData={businessData}
        />
      )}

      {selectedProduct && currentView === "details" && (
        <Activity mode={!isEditing ? "visible" : "hidden"}>
          <ProductDetails
            // selectedProduct={selectedProduct}
            onBack={() => {
              setCurrentView("list");
            }}
            onDuplicate={() => {}}
            onEdit={handleEdit}
            productId={productId}
            setProductId={setProductId}
          />
        </Activity>
      )}
    </>
  );
}
