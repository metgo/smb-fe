import { useThemeClasses } from "@/hooks/useThemeClasses";

interface OfflineOrderProductInfoProps {
  t: (key: string) => string;
  formData: {
    vendor: string;
    product: string;
    paymentMethod: string;
    description: string;
    productPrice: number | string;
    desiredQuantity: number | string;
  };
  setFormData: (data: any) => void;
  errors: Record<string, string>;
}

const OfflineOrderProductInfo = ({
  t,
  formData,
  setFormData,
  errors,
}: OfflineOrderProductInfoProps) => {
  const { textPrimary, textSecondary, bgTertiary, borderColor } =
    useThemeClasses();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            {t("vendor")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.vendor}
            onChange={(e) =>
              setFormData({ ...formData, vendor: e.target.value })
            }
            className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
            placeholder={t("vendor")}
          />
          {errors.vendor && (
            <p className="text-red-500 text-sm mt-1">{errors.vendor}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            {t("product_name")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.product}
            onChange={(e) =>
              setFormData({ ...formData, product: e.target.value })
            }
            className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
            placeholder={t("product_name")}
          />
          {errors.product && (
            <p className="text-red-500 text-sm mt-1">{errors.product}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            {t("price")} (₪) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.productPrice}
            onChange={(e) =>
              setFormData({ ...formData, productPrice: e.target.value })
            }
            className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          {errors.productPrice && (
            <p className="text-red-500 text-sm mt-1">{errors.productPrice}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            {t("quantity")} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.desiredQuantity}
            onChange={(e) =>
              setFormData({ ...formData, desiredQuantity: e.target.value })
            }
            className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
            placeholder="0"
            min="0"
          />
          {errors.desiredQuantity && (
            <p className="text-red-500 text-sm mt-1">
              {errors.desiredQuantity}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("payment_method")}
        </label>
        <input
          type="text"
          value={formData.paymentMethod}
          onChange={(e) =>
            setFormData({ ...formData, paymentMethod: e.target.value })
          }
          className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
          placeholder={t("payment_method")}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("description")}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={4}
          className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
          placeholder={t("description")}
        />
      </div>
    </div>
  );
};

export default OfflineOrderProductInfo;
