import { ReactSelect } from "@/components/form-fields";
import FormFieldWrapper from "@/components/form-fields/FormFieldWrapper";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface PunchPassBasicInfoProps {
  t: (key: string) => string;
  isFree: boolean;
  setIsFree: (value: boolean) => void;
  formData: IPunchPassPayload;
  setFormData: (data: any) => void;
  errors: {
    businessId?: string;
    name?: string;
    sellingPrice?: string;
    quantity?: string;
  };
  businesses: ISearchBusiness[] | [];
  searchBusiness: (key: string) => void;
  isLoading: boolean;
  setBusinessId: (data: string) => void;
  presetBusinessId?: string;
}

const PunchPassBasicInfo = ({
  t,
  isFree,
  setIsFree,
  isLoading,
  formData,
  setFormData,
  errors,
  businesses,
  setBusinessId,
  searchBusiness,
  presetBusinessId,
}: PunchPassBasicInfoProps) => {
  const { textSecondary, textPrimary, bgTertiary, borderColor, language } =
    useThemeClasses();

  const handleChange = (updates: Partial<IPunchPassPayload>) => {
    setFormData((prev: any) => ({ ...prev, ...updates }));
  };

  const handleFreeToggle = (checked: boolean) => {
    setIsFree(checked);
    if (checked) {
      handleChange({
        price: {
          ...formData.price,
          markedPrice: 0,
          sellingPrice: 0,
        },
      });
    }
  };

  const inputClasses = `w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`;
  const isRtl = language === "he" || language === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  return (
    <div className="space-y-6">
      {/* Select Business */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("select_business")} <span className="text-red-500">*</span>
        </label>

        <ReactSelect
          isDisabled={!!presetBusinessId}
          value={formData.businessId}
          onChange={(selectedBusinessId: string) => {
            handleChange({ businessId: selectedBusinessId });
            setBusinessId(selectedBusinessId);
          }}
          placeholder={t("select_business")}
          items={
            businesses?.map((biz) => ({
              _id: biz._id,
              name: biz.name,
            })) || []
          }
          onSearch={searchBusiness}
          isLoading={isLoading}
        />

        {errors.businessId && (
          <p className="text-red-500 text-sm mt-1">{errors.businessId}</p>
        )}
      </div>

      {/* Name */}
      <FormFieldWrapper label={t("name")} required error={errors.name}>
        <input
          type="text"
          dir={dir}
          value={formData.name || ""}
          onChange={(e) => handleChange({ name: e.target.value })}
          placeholder={t("punch_pass_name_placeholder")}
          className={inputClasses}
        />
      </FormFieldWrapper>

      {/* Description */}
      <FormFieldWrapper label={t("description")}>
        <textarea
          dir={dir}
          rows={4}
          value={formData.description || ""}
          onChange={(e) => handleChange({ description: e.target.value })}
          placeholder={t("punch_pass_description_placeholder")}
          className={`${inputClasses} resize-none`}
        />
      </FormFieldWrapper>

      {/* Free */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isFree}
          onChange={(e) => handleFreeToggle(e.target.checked)}
          className="rounded"
        />
        <span className={`text-sm font-medium ${textSecondary}`}>
          {t("free")}
        </span>
      </label>

      {/* Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormFieldWrapper label={t("marked_price")}>
          <input
            type="number"
            min={0}
            step="0.01"
            disabled={isFree}
            value={isFree ? 0 : (formData.price?.markedPrice ?? "")}
            onChange={(e) =>
              handleChange({
                price: {
                  ...formData.price,
                  markedPrice: Number(e.target.value),
                },
              })
            }
            placeholder="0.00"
            className={`${inputClasses} ${isFree ? "opacity-50 cursor-not-allowed" : ""}`}
          />
        </FormFieldWrapper>

        <FormFieldWrapper
          label={t("selling_price")}
          required
          error={errors.sellingPrice}
        >
          <input
            type="number"
            min={0}
            step="0.01"
            disabled={isFree}
            value={isFree ? 0 : (formData.price?.sellingPrice ?? "")}
            onChange={(e) =>
              handleChange({
                price: {
                  ...formData.price,
                  sellingPrice: Number(e.target.value),
                },
              })
            }
            placeholder="0.00"
            className={`${inputClasses} ${isFree ? "opacity-50 cursor-not-allowed" : ""}`}
          />
        </FormFieldWrapper>
      </div>

      {/* Quantity */}
      <div>
        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={formData.quantity?.isUnlimited || false}
            onChange={(e) =>
              handleChange({
                quantity: {
                  ...formData.quantity,
                  isUnlimited: e.target.checked,
                },
              })
            }
            className="rounded"
          />
          <span className={`text-sm font-medium ${textSecondary}`}>
            {t("unlimited_stock")}
          </span>
        </label>

        {!formData.quantity?.isUnlimited && (
          <FormFieldWrapper
            label={t("stock_quantity")}
            required
            error={errors.quantity}
          >
            <input
              type="number"
              min={0}
              value={formData.quantity?.initial ?? ""}
              onChange={(e) =>
                handleChange({
                  quantity: {
                    ...formData.quantity,
                    initial: Number(e.target.value),
                  },
                })
              }
              placeholder="0"
              className={inputClasses}
            />
          </FormFieldWrapper>
        )}
      </div>

      {/* Expiry (months) */}
      <FormFieldWrapper
        label={t("expiry_months")}
        hint={t("expiry_months_hint")}
      >
        <input
          type="number"
          min={1}
          value={formData.expiryDate ?? 60}
          onChange={(e) => handleChange({ expiryDate: Number(e.target.value) })}
          placeholder="60"
          className={inputClasses}
        />
      </FormFieldWrapper>
    </div>
  );
};

export default PunchPassBasicInfo;
