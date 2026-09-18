import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface CampaignBasicInfoProps {
  formData: {
    name: string;
    code: string;
    description: string;
    slogan: string;
    status: "ACTIVE" | "INACTIVE" | "DRAFT";
    type: "CASH_IN" | "CASH_BACK";
    startDate: string;
    endDate: string;
  };
  onChange: (updates: Partial<CampaignBasicInfoProps["formData"]>) => void;
  errors: Record<string, string>;
}

export default function CampaignBasicInfo({
  formData,
  onChange,
  errors,
}: CampaignBasicInfoProps) {
  const { t } = useTranslation("campaign");
  const { inputClasses, textSecondary, textTertiary, borderColor, isDark } =
    useThemeClasses();

  const CAMPAIGN_TYPES: { value: "CASH_IN" | "CASH_BACK"; label: string }[] = [
    { value: "CASH_IN", label: t("cash_in") },
    { value: "CASH_BACK", label: t("cash_back") },
  ];

  const CAMPAIGN_STATUSES: {
    value: "ACTIVE" | "INACTIVE" | "DRAFT";
    label: string;
  }[] = [
    { value: "DRAFT", label: t("status_draft") },
    { value: "ACTIVE", label: t("status_active") },
    { value: "INACTIVE", label: t("status_inactive") },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            className={clsx("block text-sm font-medium mb-1.5", textSecondary)}
          >
            {t("campaign_name")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t("campaign_name_placeholder")}
            className={clsx(
              "w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500",
              inputClasses,
              errors.name && "border-red-500",
            )}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            className={clsx("block text-sm font-medium mb-1.5", textSecondary)}
          >
            {t("campaign_code")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => onChange({ code: e.target.value })}
            placeholder={t("campaign_code_placeholder")}
            className={clsx(
              "w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500",
              inputClasses,
              errors.code && "border-red-500",
            )}
          />
          {errors.code && (
            <p className="mt-1 text-xs text-red-500">{errors.code}</p>
          )}
        </div>
      </div>

      <div>
        <label
          className={clsx("block text-sm font-medium mb-1.5", textSecondary)}
        >
          {t("description")}
        </label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder={t("description_placeholder")}
          className={clsx(
            "w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none",
            inputClasses,
          )}
        />
      </div>

      <div>
        <label
          className={clsx("block text-sm font-medium mb-1.5", textSecondary)}
        >
          {t("slogan")}
        </label>
        <input
          type="text"
          value={formData.slogan}
          onChange={(e) => onChange({ slogan: e.target.value })}
          placeholder={t("slogan_placeholder")}
          className={clsx(
            "w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500",
            inputClasses,
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            className={clsx("block text-sm font-medium mb-1.5", textSecondary)}
          >
            {t("campaign_type")} <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {CAMPAIGN_TYPES.map((ct) => (
              <button
                key={ct.value}
                type="button"
                onClick={() => onChange({ type: ct.value })}
                className={clsx(
                  "flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all cursor-pointer",
                  formData.type === ct.value
                    ? "bg-teal-600 border-teal-600 text-white"
                    : isDark
                      ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50",
                )}
              >
                {ct.label}
              </button>
            ))}
          </div>
          {errors.type && (
            <p className="mt-1 text-xs text-red-500">{errors.type}</p>
          )}
        </div>

        <div>
          <label
            className={clsx("block text-sm font-medium mb-1.5", textSecondary)}
          >
            {t("status")} <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {CAMPAIGN_STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => onChange({ status: s.value })}
                className={clsx(
                  "flex-1 py-2 px-2 rounded-lg border text-xs font-medium transition-all cursor-pointer",
                  formData.status === s.value
                    ? s.value === "ACTIVE"
                      ? "bg-green-600 border-green-600 text-white"
                      : s.value === "INACTIVE"
                        ? "bg-red-500 border-red-500 text-white"
                        : "bg-amber-500 border-amber-500 text-white"
                    : isDark
                      ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={clsx("rounded-lg border p-4", borderColor)}>
        <p className={clsx("text-xs font-medium mb-3", textTertiary)}>
          {t("campaign_period")}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              className={clsx(
                "block text-sm font-medium mb-1.5",
                textSecondary,
              )}
            >
              {t("start_date")} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className={clsx(
                "w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500",
                inputClasses,
                errors.startDate && "border-red-500",
              )}
            />
            {errors.startDate && (
              <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>
            )}
          </div>
          <div>
            <label
              className={clsx(
                "block text-sm font-medium mb-1.5",
                textSecondary,
              )}
            >
              {t("end_date")} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.endDate}
              min={formData.startDate || undefined}
              onChange={(e) => onChange({ endDate: e.target.value })}
              className={clsx(
                "w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500",
                inputClasses,
                errors.endDate && "border-red-500",
              )}
            />
            {errors.endDate && (
              <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
