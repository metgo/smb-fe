import clsx from "clsx";
import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface Props {
  isEdit: boolean;
  formData: ISiteSettingsFormData;
  errors: SiteSettingsErrors;
  onChange: (
    field: keyof ISiteSettingsFormData,
    value: string | number | boolean,
  ) => void;
}

const Step01Generals = ({
  isEdit = false,
  formData,
  errors,
  onChange,
}: Props) => {
  const { t } = useTranslation("website_settings");
  const { inputClasses, textPrimary, textSecondary, borderColor } =
    useThemeClasses();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Settings className="w-5 h-5 text-teal-500" />
        <h2 className={clsx("text-lg font-semibold", textPrimary)}>
          {t("generals_title")}
        </h2>
      </div>

      {/* Website Name & Slogan */}
      <div className="flex flex-col gap-2">
        <label className={clsx("text-sm font-medium", textPrimary)}>
          {t("website_name")} <span className="text-red-500">*</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
          <input
            type="text"
            value={formData.websiteNameEn}
            onChange={(e) => onChange("websiteNameEn", e.target.value)}
            placeholder={t("website_name_en_placeholder")}
            className={clsx(
              "px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20 text-sm",
              inputClasses,
              errors.websiteNameEn && "border-red-500",
            )}
          />
          <input
            type="text"
            value={formData.websiteNameHe}
            onChange={(e) => onChange("websiteNameHe", e.target.value)}
            placeholder={t("website_name_he_placeholder")}
            className={clsx(
              "px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20 text-sm",
              inputClasses,
              errors.websiteNameHe && "border-red-500",
            )}
          />
          <input
            type="text"
            value={formData.websiteNameAr}
            onChange={(e) => onChange("websiteNameAr", e.target.value)}
            placeholder={t("website_name_ar_placeholder")}
            className={clsx(
              "px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20 text-sm",
              inputClasses,
              errors.websiteNameAr && "border-red-500",
            )}
          />
        </div>
        {errors.websiteNameEn && (
          <p className="text-xs text-red-500">{errors.websiteNameEn}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className={clsx("text-sm font-medium", textPrimary)}>
          {t("slogan")} <span className="text-red-500">*</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
          <input
            type="text"
            value={formData.sloganEn}
            onChange={(e) => onChange("sloganEn", e.target.value)}
            placeholder={t("slogan_en_placeholder")}
            className={clsx(
              "px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20 text-sm",
              inputClasses,
              errors.sloganEn && "border-red-500",
            )}
          />
          <input
            type="text"
            value={formData.sloganHe}
            onChange={(e) => onChange("sloganHe", e.target.value)}
            placeholder={t("slogan_he_placeholder")}
            className={clsx(
              "px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20 text-sm",
              inputClasses,
              errors.sloganHe && "border-red-500",
            )}
          />
          <input
            type="text"
            value={formData.sloganAr}
            onChange={(e) => onChange("sloganAr", e.target.value)}
            placeholder={t("slogan_ar_placeholder")}
            className={clsx(
              "px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20 text-sm",
              inputClasses,
              errors.sloganAr && "border-red-500",
            )}
          />
        </div>
        {errors.sloganEn && (
          <p className="text-xs text-red-500">{errors.sloganEn}</p>
        )}
      </div>

      {/* Purpose & Website Url */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6">
        <div className="flex flex-col gap-2 col-span-8">
          <label className={clsx("text-sm font-medium", textPrimary)}>
            {t("website_url")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.websiteUrl}
            onChange={(e) => onChange("websiteUrl", e.target.value)}
            placeholder={t("website_url_placeholder")}
            className={clsx(
              "px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20 text-sm",
              inputClasses,
              errors.websiteUrl && "border-red-500",
            )}
          />
          {errors.websiteUrl && (
            <p className="text-xs text-red-500">{errors.websiteUrl}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 col-span-4">
          <label className={clsx("text-sm font-medium", textPrimary)}>
            {t("purpose")}
          </label>
          <select
            value={formData.purpose}
            onChange={(e) => onChange("purpose", e.target.value)}
            className={clsx(
              "px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20 text-sm",
              inputClasses,
            )}
          >
            <option value="MARKETPLACE">{t("purpose_marketplace")}</option>
            <option value="TRAVELING">{t("purpose_traveling")}</option>
            <option value="DISCOUNT">{t("purpose_discount")}</option>
            <option value="OTHER">{t("purpose_other")}</option>
          </select>
        </div>
      </div>

      {/* GA Property ID & Platform Charge */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6">
        <div className="flex flex-col gap-2 col-span-4">
          <label className={clsx("text-sm font-medium", textPrimary)}>
            {t("identifier_id")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            disabled={isEdit}
            value={formData.identifierId}
            onChange={(e) => onChange("identifierId", e.target.value)}
            placeholder={t("identifier_id_placeholder")}
            className={clsx(
              "px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20 text-sm",
              isEdit ? "cursor-not-allowed" : "",
              inputClasses,
              errors.identifierId && "border-red-500",
            )}
          />
          {errors.identifierId && (
            <p className="text-xs text-red-500">{errors.identifierId}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 col-span-4">
          <label className={clsx("text-sm font-medium", textPrimary)}>
            {t("platform_charge")}
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={formData.platformCharge}
            onChange={(e) =>
              onChange("platformCharge", parseFloat(e.target.value) || 0)
            }
            placeholder={t("platform_charge_placeholder")}
            className={clsx(
              "px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20 text-sm",
              inputClasses,
            )}
          />
        </div>
      </div>

      {/* Punch Pass Eligibility */}
      <label
        className={clsx(
          "flex items-start gap-3 p-4 rounded-xl border cursor-pointer",
          borderColor,
        )}
      >
        <input
          type="checkbox"
          checked={!!formData.isPunchpassEligible}
          onChange={(e) => onChange("isPunchpassEligible", e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded accent-teal-500 cursor-pointer"
        />
        <div className="flex flex-col gap-1">
          <span className={clsx("text-sm font-medium", textPrimary)}>
            {t("is_punch_pass_eligible")}
          </span>
          <span
            className={clsx("flex items-center gap-1.5 text-xs", textSecondary)}
          >
            {t("is_punch_pass_eligible_info")}
          </span>
        </div>
      </label>
    </div>
  );
};

export default Step01Generals;
