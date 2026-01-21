import {
  Package,
  Search,
  Filter,
  Grid3x3,
  List,
  X,
  Check,
  Copy,
  Settings2,
  ArrowUpDown,
  ArrowUp,
} from "lucide-react";
import { useProductMgmt } from "./useProductMgmt";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useAppSelector } from "@/hooks/hooks";
import { PageHeader, PageStats, ReordableDataTable } from "@/components/shared";
import { CreateProductWizard } from "./components";
import { Activity, useState } from "react";
import ProductDetails from "./details/inde";

const businessId = "";

export default function ProductsMgmtPage() {
  const { isRTL } = useAppSelector((state) => state.settings);

  const {
    t,
    language,
    searchQuery,
    setSearchQuery,
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
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    businessFilter,
    setBusinessFilter,
    sortedProducts,
    handleBulkStatusChange,
    handleDuplicateProduct,
    salesMetrics,
    getProductTypeLabel,
    getStatusBadge,
  } = useProductMgmt();

  const [currentView, setCurrentView] = useState<
    "list" | "details" | "edit" | "create"
  >("list");

  const themeColor = useThemeClasses();

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setCurrentView("details");
  };

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
            onClick={() => setIsCreating(true)}
          />

          {/* Fixed Stats, Toolbar, Filters - Always Visible */}
          <div className="shrink-0 py-6 pb-0">
            <div className=" mx-auto">
              <PageStats
                stats={salesStats}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
              />

              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                {/* Search */}
                <div className="flex-1 min-w-50 max-w-md">
                  <div className="relative">
                    <Search
                      className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-5 h-5 ${themeColor.textTertiary}`}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t("search_products")}
                      className={`w-full ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} py-2 rounded-lg border ${themeColor.borderColor} ${themeColor.bgSecondary} ${themeColor.textPrimary} placeholder-gray-400`}
                    />
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-3 py-2 rounded-lg border ${themeColor.borderColor} ${showFilters ? "bg-teal-50 dark:bg-teal-950 border-teal-500" : themeColor.bgSecondary} ${themeColor.textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2`}
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">{t("filters")}</span>
                  </button>

                  <div
                    className={`flex items-center gap-1 p-1 rounded-lg border ${themeColor.borderColor} ${themeColor.bgSecondary}`}
                  >
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded ${viewMode === "list" ? "bg-teal-500 text-white" : themeColor.textTertiary}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded ${viewMode === "grid" ? "bg-teal-500 text-white" : themeColor.textTertiary}`}
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div
                  className={`mb-6 p-4 rounded-xl border ${themeColor.borderColor} ${themeColor.bgSecondary}`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label
                        className={`block text-sm ${themeColor.textSecondary} mb-2`}
                      >
                        {t("filter_by_status")}
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border ${themeColor.borderColor} ${themeColor.bgPrimary} ${themeColor.textPrimary}`}
                      >
                        <option value="all">{t("all")}</option>
                        <option value="draft">{t("draft")}</option>
                        <option value="pending">{t("pending")}</option>
                        <option value="approved">{t("approved")}</option>
                        <option value="rejected">{t("rejected")}</option>
                        <option value="archived">{t("archived")}</option>
                      </select>
                    </div>

                    <div>
                      <label
                        className={`block text-sm ${themeColor.textSecondary} mb-2`}
                      >
                        {t("filter_by_type")}
                      </label>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border ${themeColor.borderColor} ${themeColor.bgPrimary} ${themeColor.textPrimary}`}
                      >
                        <option value="all">{t("all")}</option>
                        <option value="physical">
                          {t("physical_product")}
                        </option>
                        <option value="table-order">{t("table_order")}</option>
                        <option value="service">{t("service")}</option>
                        <option value="hotel-room">{t("hotel_room")}</option>
                        <option value="experience">{t("experience")}</option>
                      </select>
                    </div>

                    {!businessId && (
                      <div>
                        <label
                          className={`block text-sm ${themeColor.textSecondary} mb-2`}
                        >
                          {t("filter_by_business")}
                        </label>
                        <select
                          value={businessFilter}
                          onChange={(e) => setBusinessFilter(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border ${themeColor.borderColor} ${themeColor.bgPrimary} ${themeColor.textPrimary}`}
                        >
                          <option value="all">{t("all_businesses")}</option>
                          {/* Add business options dynamically */}
                        </select>
                      </div>
                    )}
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
                    data={sortedProducts}
                    selectedItems={selectedProducts}
                    onSelectionChange={setSelectedProducts}
                    // onRowClick={setSelectedProduct}
                    onRowClick={(product) => handleProductClick(product)}
                    storageKey="productsTableColumnOrder"
                    columns={[
                      { key: "checkbox", label: "", width: "50px" },
                      {
                        key: "image",
                        label: t("product_image"),
                        render: (product) => (
                          <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name[language]}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-white" />
                            )}
                          </div>
                        ),
                      },
                      {
                        key: "productName",
                        label: t("product_name"),
                        sortable: true,
                        render: (product) => (
                          <div>
                            <div className="font-medium">
                              {product.name[language]}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {product.shortDescription[language]}
                            </div>
                          </div>
                        ),
                      },
                      {
                        key: "businessName",
                        label: t("business_name"),
                        render: (p) => p.businessName,
                      },
                      {
                        key: "type",
                        label: t("product_type"),
                        render: (p) => getProductTypeLabel(p.type),
                      },
                      {
                        key: "status",
                        label: t("product_status"),
                        render: (p) => getStatusBadge(p.status),
                      },
                      {
                        key: "price",
                        label: t("price"),
                        sortable: true,
                        render: (p) => (
                          <div>
                            {p.markedPrice !== p.sellingPrice && (
                              <div className="text-xs text-gray-400 line-through">
                                ₪{p.markedPrice}
                              </div>
                            )}
                            <div className="font-medium">₪{p.sellingPrice}</div>
                          </div>
                        ),
                      },
                      {
                        key: "impact",
                        label: t("impact"),
                        sortable: true,
                        render: (p) => (
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium ${p.soldCount > 20 ? "text-green-600" : p.soldCount > 10 ? "text-blue-600" : "text-gray-600"}`}
                            >
                              {p.soldCount}
                            </span>
                            <span className="text-xs text-gray-400">sold</span>
                          </div>
                        ),
                      },
                      {
                        key: "quantity",
                        label: t("quantity"),
                        sortable: true,
                        render: (p) => p.quantity,
                      },
                      {
                        key: "lastUpdated",
                        label: t("last_updated"),
                        sortable: true,
                        render: (p) => (
                          <div
                            key="lastUpdated"
                            className={`p-3 ${themeColor.textTertiary} text-sm`}
                          >
                            {new Date(p.lastUpdated).toLocaleDateString(
                              language,
                            )}
                          </div>
                        ),
                      },
                      {
                        key: "actions",
                        label: t("actions"),
                        render: (product) => (
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
                    ]}
                  />
                </div>
              ) : (
                // Grid View
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product);
                        setCurrentView("details");
                      }}
                      className={`rounded-xl border ${themeColor.borderColor} ${themeColor.bgSecondary} overflow-hidden hover:shadow-lg transition-all cursor-pointer group`}
                    >
                      <div className="relative h-48 bg-linear-to-br from-blue-500 to-indigo-600">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name[language]}
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
                          {product.name[language]}
                        </h3>
                        <p
                          className={`text-sm ${themeColor.textTertiary} mb-3 line-clamp-2`}
                        >
                          {product.shortDescription[language]}
                        </p>
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
                              ₪{product.sellingPrice}
                            </span>
                          </div>
                        </div>
                        <div className={`text-xs ${themeColor.textTertiary}`}>
                          {product.businessName}
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
      {(currentView === "create" || currentView === "edit") && (
        <CreateProductWizard
          onClose={() => {
            setIsCreating(false);
            setIsEditing(false);
            setSelectedProduct(null);
          }}
          editingProduct={
            isEditing && selectedProduct
              ? {
                  businessId: selectedProduct.businessId,
                  name: selectedProduct.name,
                  shortDescription: selectedProduct.shortDescription,
                  fullDescription: { en: "", he: "", ar: "" },
                  type: selectedProduct.type,
                  categories: selectedProduct.categories,
                  markedPrice: selectedProduct.markedPrice.toString(),
                  sellingPrice: selectedProduct.sellingPrice.toString(),
                  quantity: selectedProduct.quantity?.toString() || "",
                  isUnlimited: selectedProduct.quantity === null,
                  startDate: selectedProduct.availability.startDate || "",
                  endDate: selectedProduct.availability.endDate || "",
                  mainImage: selectedProduct.image,
                  additionalImages: [],
                  enableHomeDelivery: false,
                  enableStorePickup: false,
                  deliveryFee: "",
                  deliveryTime: "",
                  serviceDuration: "",
                  serviceLocation: "",
                }
              : null
          }
          preSelectedBusinessName={"abc"}
        />
      )}

      {selectedProduct && currentView === "details" && (
        <Activity mode={!isEditing ? "visible" : "hidden"}>
          <ProductDetails
            product={selectedProduct}
            onBack={() => {}}
            onDuplicate={() => {}}
            onEdit={() => {
              setIsEditing(true);
            }}
          />
        </Activity>
      )}
    </>
  );
}
