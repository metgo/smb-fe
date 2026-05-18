import { useThemeClasses } from "@/hooks/useThemeClasses";
import React from "react";

interface ProductPricingInventoryDetailsProps {
  product: Product;
  t: (key: string) => string;
}

const ProductPricingInventoryDetails: React.FC<
  ProductPricingInventoryDetailsProps
> = ({ product, t }) => {
  const { isDark } = useThemeClasses();

  const discountAmount =
    product?.price?.markedPrice - product?.price?.sellingPrice;
  const discountPercent =
    product?.price?.markedPrice > 0
      ? Math.round((discountAmount / product?.price?.markedPrice) * 100)
      : 0;

  const isUnlimited = product?.quantity?.isUnlimited;
  const availableStock = product?.quantity?.remaining ?? 0;
  const soldCount = product?.quantity?.sold ?? 0;
  const totalStock = isUnlimited ? null : availableStock + soldCount;
  const stockPercentage =
    !isUnlimited && totalStock ? (availableStock / totalStock) * 100 : 100;

  return (
    <div className="space-y-6">
      {/* Prices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Marked Price */}
        <div
          className={`p-4 rounded-lg border ${
            isDark
              ? "border-gray-700 bg-gray-800/50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <h3
            className={`text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {t("marked_price") || "Marked Price"}
          </h3>
          <p
            className={`text-3xl font-bold ${isDark ? "text-gray-200" : "text-gray-800"}`}
          >
            ₪{product?.price?.markedPrice?.toLocaleString()}
          </p>
        </div>

        {/* Selling Price */}
        <div
          className={`p-4 rounded-lg border ${
            isDark
              ? "border-teal-700 bg-teal-950/30"
              : "border-teal-200 bg-teal-50"
          }`}
        >
          <h3
            className={`text-sm mb-2 ${isDark ? "text-teal-400" : "text-teal-700"}`}
          >
            {t("selling_price") || "Selling Price"}
          </h3>
          <p
            className={`text-3xl font-bold ${isDark ? "text-teal-300" : "text-teal-800"}`}
          >
            ₪{product?.price?.sellingPrice?.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Discount */}
      {discountAmount > 0 && (
        <div
          className={`p-4 rounded-lg border ${
            isDark
              ? "border-orange-700 bg-orange-950/30"
              : "border-orange-200 bg-orange-50"
          }`}
        >
          <h3
            className={`text-sm mb-2 ${isDark ? "text-orange-400" : "text-orange-700"}`}
          >
            {t("discount") || "Discount"}
          </h3>
          <div className="flex items-baseline gap-3">
            <p
              className={`text-2xl font-bold ${isDark ? "text-orange-300" : "text-orange-800"}`}
            >
              ₪{discountAmount?.toLocaleString()}
            </p>
            <p
              className={`text-lg ${isDark ? "text-orange-400" : "text-orange-700"}`}
            >
              ({discountPercent}% off)
            </p>
          </div>
        </div>
      )}

      {/* Quantity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Quantity */}
        <div
          className={`p-4 rounded-lg border ${
            isDark
              ? "border-gray-700 bg-gray-800/50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <h3
            className={`text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {t("total_quantity")}
          </h3>
          <p
            className={`text-3xl font-bold ${isDark ? "text-teal-300" : "text-teal-800"}`}
          >
            {isUnlimited ? (
              <span className="text-teal-500">{t("unlimited")}</span>
            ) : (
              totalStock?.toLocaleString()
            )}
          </p>
        </div>

        {/* Available Stock */}
        <div
          className={`p-4 rounded-lg border ${
            availableStock < 10
              ? isDark
                ? "border-red-700 bg-red-950/30"
                : "border-red-200 bg-red-50"
              : isDark
                ? "border-green-700 bg-green-950/30"
                : "border-green-200 bg-green-50"
          }`}
        >
          <h3
            className={`text-sm mb-2 ${
              availableStock < 10
                ? isDark
                  ? "text-red-400"
                  : "text-red-700"
                : isDark
                  ? "text-green-400"
                  : "text-green-700"
            }`}
          >
            {t("available_stock")}
          </h3>
          <p
            className={`text-3xl font-bold ${isDark ? "text-teal-300" : "text-teal-800"}`}
          >
            {isUnlimited ? (
              <span className="text-teal-500">∞</span>
            ) : (
              availableStock.toLocaleString()
            )}
          </p>
        </div>
      </div>

      {/* Stock Status */}
      {product?.quantity !== null && (
        <div
          className={`p-4 rounded-lg border ${
            isDark
              ? "border-gray-700 bg-gray-800/50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <h3
            className={`text-sm mb-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {t("stock_status")}
          </h3>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-teal-500 to-blue-500 transition-all"
              style={{ width: `${stockPercentage}%` }}
            />
          </div>
          {!isUnlimited && (
            <div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-blue-500"
                  style={{ width: `${stockPercentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span
                  className={`font-bold ${isDark ? "text-teal-300" : "text-teal-800"}`}
                >
                  {soldCount} {t("sold")}
                </span>
                <span
                  className={`font-bold ${isDark ? "text-teal-300" : "text-teal-800"}`}
                >
                  {availableStock} {t("remaining")}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductPricingInventoryDetails;
