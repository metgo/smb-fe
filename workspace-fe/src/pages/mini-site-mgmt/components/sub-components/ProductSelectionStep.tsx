import clsx from "clsx";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Loader, Package, Building2, AlertCircle } from "lucide-react";

import { GridCard } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ProductSelectionStepProps {
  products: any[];
  isProductsLoading: boolean;
  isProductsFetching?: boolean;
  hasMoreProducts?: boolean;
  fetchNextProductsPage?: () => void;
  productSearch: string;
  setProductSearch: (value: string) => void;
  selectedProducts: string[];
  toggleProductSelection: (productId: string) => void;
  primaryProducts: string[];
  togglePrimaryProduct: (productId: string) => void;
  hasWebsite: boolean;
  minSelectedProducts: number;
}

export default function ProductSelectionStep({
  products,
  isProductsLoading,
  isProductsFetching,
  hasMoreProducts,
  fetchNextProductsPage,
  productSearch,
  setProductSearch,
  selectedProducts,
  toggleProductSelection,
  primaryProducts,
  hasWebsite,
  minSelectedProducts,
}: ProductSelectionStepProps) {
  const { t } = useTranslation("minisites");
  const {
    isDark,
    textPrimary,
    textSecondary,
    textTertiary,
    bgPrimary,
    bgSecondary,
    borderColor,
  } = useThemeClasses();
  const needsMoreProducts = selectedProducts.length < minSelectedProducts;
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  const visibleProducts = useMemo(() => {
    if (!showSelectedOnly) return products;
    return products.filter((product) => selectedProducts.includes(product._id));
  }, [products, selectedProducts, showSelectedOnly]);

  return (
    <div className="space-y-6">
      {!hasWebsite ? (
        <div
          className={clsx(
            "rounded-xl border border-dashed p-12 flex flex-col items-center text-center gap-3",
            bgSecondary,
            borderColor,
          )}
        >
          <div
            className={clsx(
              "w-12 h-12 rounded-full flex items-center justify-center",
              isDark ? "bg-purple-500/10" : "bg-purple-50",
            )}
          >
            <Building2 className="w-6 h-6 text-purple-500" />
          </div>
          <p className={clsx("text-sm max-w-sm", textTertiary)}>
            {t("select_website_first")}
          </p>
        </div>
      ) : (
        <>
          {/* Search & selection controls */}
          <div className={`${bgSecondary} rounded-lg py-4`}>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-1">
                <Search
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textTertiary}`}
                />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder={t("search_products")}
                />
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={clsx("text-sm whitespace-nowrap", textSecondary)}
                >
                  {selectedProducts.length} {t("products_selected")}
                </span>

                <label className="flex items-center gap-2 cursor-pointer select-none whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={showSelectedOnly}
                    onChange={(e) => setShowSelectedOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className={clsx("text-sm", textSecondary)}>
                    {t("show_selected_only")}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Products grid */}
          {isProductsLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Loader className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : visibleProducts.length === 0 ? (
            <div
              className={`${bgSecondary} rounded-lg p-8 text-center border ${borderColor}`}
            >
              <p className={textTertiary}>
                {showSelectedOnly
                  ? t("no_selected_products_found")
                  : t("no_products_found")}
              </p>
            </div>
          ) : (
            <div className="max-h-120 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {visibleProducts.map((product) => (
                  <GridCard
                    key={product._id}
                    image={product.images?.[0]?.image}
                    imageAlt={product.name}
                    fallbackIcon={Package}
                    fallbackGradient="from-purple-500 to-pink-600"
                    title={product?.name}
                    isChecked={selectedProducts.includes(product._id)}
                    onCheckChange={() => toggleProductSelection(product._id)}
                    onClick={() => toggleProductSelection(product._id)}
                    footer={
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={clsx(
                              "font-bold text-sm",
                              isDark ? "text-white" : "text-gray-900",
                            )}
                          >
                            ₪ {product?.price?.sellingPrice ?? "-"}
                          </span>
                          {product?.businessId?.name && (
                            <div
                              className={clsx(
                                "flex items-center gap-1 text-xs",
                                textTertiary,
                              )}
                            >
                              <Building2 className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-16">
                                {product.businessId.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    }
                  />
                ))}
              </div>

              {!showSelectedOnly && hasMoreProducts && (
                <div className="flex items-center justify-center pt-4">
                  <button
                    type="button"
                    onClick={fetchNextProductsPage}
                    disabled={isProductsFetching}
                    className={clsx(
                      "px-4 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2",
                      borderColor,
                      textPrimary,
                      isProductsFetching
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-purple-500/10",
                    )}
                  >
                    {isProductsFetching && (
                      <Loader className="w-4 h-4 animate-spin text-purple-600" />
                    )}
                    {t("load_more")}
                  </button>
                </div>
              )}
            </div>
          )}

          {primaryProducts.length > 0 && (
            <div className={`${bgSecondary} rounded-lg p-4`}>
              <p className={textSecondary}>
                {primaryProducts.length} {t("marked_as_primary")}
              </p>
            </div>
          )}

          {needsMoreProducts && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="text-sm">
                {t("min_products_required", { count: minSelectedProducts })}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
