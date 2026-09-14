import { useTranslation } from "react-i18next";
import { Search, Loader, Package, Building2, AlertCircle } from "lucide-react";
import clsx from "clsx";

import { GridCard } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { getLngWiseStr } from "@/helpers";

interface ProductSelectionStepProps {
  products: any[];
  isProductsLoading: boolean;
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
  productSearch,
  setProductSearch,
  selectedProducts,
  toggleProductSelection,
  primaryProducts,
  togglePrimaryProduct,
  hasWebsite,
  minSelectedProducts,
}: ProductSelectionStepProps) {
  const { t } = useTranslation("mini_campaign");
  const {
    isDark,
    language,
    textPrimary,
    textSecondary,
    textTertiary,
    bgPrimary,
    bgSecondary,
    borderColor,
  } = useThemeClasses();
  const needsMoreProducts = selectedProducts.length < minSelectedProducts;

  return (
    <div className="space-y-6">
      {!hasWebsite ? (
        <div
          className={`${bgSecondary} rounded-lg p-8 text-center border ${borderColor}`}
        >
          <p className={textTertiary}>{t("select_website_first")}</p>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className={`${bgSecondary} rounded-lg p-4`}>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              {t("search")}
            </label>
            <div className="relative">
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
          </div>

          {/* Products grid */}
          {isProductsLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Loader className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : products.length === 0 ? (
            <div
              className={`${bgSecondary} rounded-lg p-8 text-center border ${borderColor}`}
            >
              <p className={textTertiary}>{t("no_products_found")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((product) => (
                <GridCard
                  key={product._id}
                  image={product.images?.[0]?.image}
                  imageAlt={product.name}
                  fallbackIcon={Package}
                  fallbackGradient="from-purple-500 to-pink-600"
                  title={getLngWiseStr(
                    language,
                    product?.name,
                    product?.nameHe,
                    product?.nameAr,
                  )}
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
                      {selectedProducts.includes(product._id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePrimaryProduct(product._id);
                          }}
                          className={`w-full px-3 py-1 rounded-lg text-xs ${
                            primaryProducts.includes(product._id)
                              ? "bg-linear-to-r from-purple-500 to-pink-600 text-white"
                              : `${bgSecondary} ${textSecondary}`
                          }`}
                        >
                          {primaryProducts.includes(product._id)
                            ? `★ ${t("primary")}`
                            : t("mark_as_primary")}
                        </button>
                      )}
                    </div>
                  }
                />
              ))}
            </div>
          )}

          {/* Selection summary */}
          <div className={`${bgSecondary} rounded-lg p-4`}>
            <p className={textSecondary}>
              {selectedProducts.length} {t("products_selected")}
              {primaryProducts.length > 0 &&
                ` • ${primaryProducts.length} ${t("marked_as_primary")}`}
            </p>
          </div>

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
