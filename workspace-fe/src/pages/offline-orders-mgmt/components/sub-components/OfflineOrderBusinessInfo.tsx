import { useThemeClasses } from "@/hooks/useThemeClasses";

interface OfflineOrderBusinessInfoProps {
  t: (key: string) => string;
  formData: {
    companyName: string;
    employerType: string;
    leadDate: string;
    initialRequest: number | string;
    closedDealValue: number | string;
    dealClosureDate: string;
  };
  setFormData: (data: any) => void;
  errors: Record<string, string>;
}

const toDateInputValue = (value: string) => (value ? value.slice(0, 10) : "");

const OfflineOrderBusinessInfo = ({
  t,
  formData,
  setFormData,
  errors,
}: OfflineOrderBusinessInfoProps) => {
  const { textPrimary, textSecondary, bgTertiary, borderColor } =
    useThemeClasses();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            {t("business_name")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) =>
              setFormData({ ...formData, companyName: e.target.value })
            }
            className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
            placeholder={t("business_name")}
          />
          {errors.companyName && (
            <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            {t("employer_type")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.employerType}
            onChange={(e) =>
              setFormData({ ...formData, employerType: e.target.value })
            }
            className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
            placeholder={t("employer_type")}
          />
          {errors.employerType && (
            <p className="text-red-500 text-sm mt-1">{errors.employerType}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            {t("lead_date")}
          </label>
          <input
            type="date"
            value={toDateInputValue(formData.leadDate)}
            onChange={(e) =>
              setFormData({ ...formData, leadDate: e.target.value })
            }
            className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            {t("deal_closure_date")}
          </label>
          <input
            type="date"
            value={toDateInputValue(formData.dealClosureDate)}
            onChange={(e) =>
              setFormData({ ...formData, dealClosureDate: e.target.value })
            }
            className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            {t("initial_request")} (₪)
          </label>
          <input
            type="number"
            value={formData.initialRequest}
            onChange={(e) =>
              setFormData({ ...formData, initialRequest: e.target.value })
            }
            className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            {t("closed_deal_value")} (₪)
          </label>
          <input
            type="number"
            value={formData.closedDealValue}
            onChange={(e) =>
              setFormData({ ...formData, closedDealValue: e.target.value })
            }
            className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>
      </div>
    </div>
  );
};

export default OfflineOrderBusinessInfo;
