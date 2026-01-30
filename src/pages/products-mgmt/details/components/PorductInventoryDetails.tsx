import React from "react";

interface ProductInventoryDetailsProps {
  product: {
    quantity: number | null;
    soldCount: number;
  };
  theme: Theme;
  t: (key: string) => string;
}

const ProductInventoryDetails: React.FC<ProductInventoryDetailsProps> = ({
  product,
  theme,
  t,
}) => {
  const availableStock =
    product.quantity !== null ? product.quantity - product.soldCount : null;
  const stockPercentage =
    product.quantity && availableStock !== null
      ? (availableStock / product.quantity) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Quantity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Quantity */}
        <div
          className={`p-4 rounded-lg border ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800/50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <h3
            className={`text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
          >
            {t("total_quantity")}
          </h3>
          <p
            className={`text-3xl font-bold ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
          >
            {product.quantity === null ? (
              <span className="text-teal-500">{t("unlimited")}</span>
            ) : (
              product.quantity.toLocaleString()
            )}
          </p>
        </div>

        {/* Available Stock */}
        <div
          className={`p-4 rounded-lg border ${
            availableStock !== null && availableStock < 10
              ? theme === "dark"
                ? "border-red-700 bg-red-950/30"
                : "border-red-200 bg-red-50"
              : theme === "dark"
                ? "border-green-700 bg-green-950/30"
                : "border-green-200 bg-green-50"
          }`}
        >
          <h3
            className={`text-sm mb-2 ${
              availableStock !== null && availableStock < 10
                ? theme === "dark"
                  ? "text-red-400"
                  : "text-red-700"
                : theme === "dark"
                  ? "text-green-400"
                  : "text-green-700"
            }`}
          >
            {t("available_stock")}
          </h3>
          <p
            className={`text-3xl font-bold ${
              availableStock !== null && availableStock < 10
                ? theme === "dark"
                  ? "text-red-300"
                  : "text-red-800"
                : theme === "dark"
                  ? "text-green-300"
                  : "text-green-800"
            }`}
          >
            {product.quantity === null ? (
              <span className="text-teal-500">∞</span>
            ) : (
              availableStock?.toLocaleString()
            )}
          </p>
        </div>
      </div>

      {/* Stock Status */}
      {product.quantity !== null && (
        <div
          className={`p-4 rounded-lg border ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800/50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <h3
            className={`text-sm mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
          >
            {t("stock_status")}
          </h3>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all"
              style={{ width: `${stockPercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span
              className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
            >
              {product.soldCount} {t("sold")}
            </span>
            <span
              className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
            >
              {availableStock} {t("remaining")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductInventoryDetails;
