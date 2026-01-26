import { useThemeClasses } from "@/hooks/useThemeClasses";
import React from "react";

interface ProductPricingAvailabilityProps {
  t: (key: string) => string;
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
  errors: {
    sellingPrice?: string;
    quantity?: string;
  };
}

const ProductPricingAvailability: React.FC<ProductPricingAvailabilityProps> = ({
  t,
  formData,
  setFormData,
  errors,
}) => {
  const { bgTertiary, textPrimary, textSecondary, textTertiary, borderColor } =
    useThemeClasses();

  return (
    <div className="space-y-6">
      {/* Price Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            {t("marked_price")} (₪)
          </label>
          <input
            type="number"
            value={formData.markedPrice}
            onChange={(e) =>
              setFormData({ ...formData, markedPrice: e.target.value })
            }
            className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            {t("selling_price")} (₪) *
          </label>
          <input
            type="number"
            value={formData.sellingPrice}
            onChange={(e) =>
              setFormData({ ...formData, sellingPrice: e.target.value })
            }
            className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          {errors.sellingPrice && (
            <p className="text-red-500 text-sm mt-1">{errors.sellingPrice}</p>
          )}
        </div>
      </div>

      {/* Stock */}
      <div>
        <label className={`flex items-center gap-2 mb-3`}>
          <input
            type="checkbox"
            checked={formData.isUnlimited}
            onChange={(e) =>
              setFormData({ ...formData, isUnlimited: e.target.checked })
            }
            className="rounded"
          />
          <span className={`text-sm font-medium ${textSecondary}`}>
            {t("unlimited_stock")}
          </span>
        </label>

        {!formData.isUnlimited && (
          <div>
            <label
              className={`block text-sm font-medium ${textSecondary} mb-2`}
            >
              {t("stock_quantity")} *
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
              placeholder="0"
              min="0"
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
            )}
          </div>
        )}
      </div>

      {/* Availability Dates */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-3`}>
          {t("availability_dates")}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs ${textTertiary} mb-1`}>
              {t("start_date")}
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
            />
          </div>
          <div>
            <label className={`block text-xs ${textTertiary} mb-1`}>
              {t("end_date")}
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPricingAvailability;
