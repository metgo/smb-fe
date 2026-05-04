import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Image as ImageIcon } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ReactSelect } from "@/components/form-fields";
import { useCommon } from "@/hooks/useCommon";

interface Props {
  isEdit: boolean;
  formData: SiteSettingsFormData;
  errors: SiteSettingsErrors;
  onChange: (field: keyof SiteSettingsFormData, value: string) => void;
}


const Step01Generals = ({
  isEdit = false,
  formData,
  errors,
  onChange,
}: Props) => {
  const { t } = useTranslation("website_settings");
  const { dmosAuthorities } = useCommon()
  const { inputClasses, textPrimary } =
    useThemeClasses();
  const selectedParent = dmosAuthorities?.find((item) => item._id === formData.dmoId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <ImageIcon className="w-5 h-5 text-teal-500" />
        <h2 className={clsx("text-lg font-semibold", textPrimary)}>
          {t("branding_title")}
        </h2>
      </div>

      <div className={clsx("grid grid-cols-2 items-center gap-6")}>
        <div className="flex flex-col gap-2">
          <label className={clsx("text-sm font-medium", textPrimary)}>
            {t("select_dmo")}
          </label>
          <ReactSelect
            isDisabled={isEdit}
            value={formData.dmoId}
            onChange={(value) => onChange("dmoId", value)}
            placeholder={t("select_dmo")}
            items={dmosAuthorities?.map((item) => ({
              _id: item._id,
              name: item.name,
              logo: item?.logoPath || "",
            }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className={clsx("text-sm font-medium", textPrimary)}>
            {t("select_authority")} 
          </label>
          <ReactSelect
            isClearable
            value={formData.authorityId}
            isDisabled={isEdit}
            onChange={(value) => onChange("authorityId", value)}
            placeholder={t("select_authority")}
            items={selectedParent?.authorities?.map((item) => ({
              _id: item._id,
              name: item.name,
              logo: item?.logoPath,
            }))}
          />
        </div>
      </div>

      {/* Website Name & Slogan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className={clsx("text-sm font-medium", textPrimary)}>
            {t("website_name")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.websiteName}
            onChange={(e) => onChange("websiteName", e.target.value)}
            placeholder={t("website_name_placeholder")}
            className={clsx(
              "px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20 text-sm",
              inputClasses,
              errors.websiteName && "border-red-500",
            )}
          />
          {errors.websiteName && (
            <p className="text-xs text-red-500">{errors.websiteName}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className={clsx("text-sm font-medium", textPrimary)}>
            {t("slogan")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.slogan}
            onChange={(e) => onChange("slogan", e.target.value)}
            placeholder={t("slogan_placeholder")}
            className={clsx(
              "px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20 text-sm",
              inputClasses,
              errors.slogan && "border-red-500",
            )}
          />
          {errors.slogan && (
            <p className="text-xs text-red-500">{errors.slogan}</p>
          )}
        </div>
      </div>

      {/* Purpose & Website Url */}
      <div className="grid grid-cols-12 gap-6">
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
            <option value="OTHER">{t("purpose_other")}</option>
          </select>
        </div>
      </div>

      {/* Identifier ID & Camp Code */}
      <div className="grid grid-cols-12 gap-6">
        <div className="flex flex-col gap-2 col-span-8">
          <label className={clsx("text-sm font-medium", textPrimary)}>
            {t("identifier_id")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.identifierId}
            onChange={(e) => onChange("identifierId", e.target.value)}
            placeholder={t("identifier_id_placeholder")}
            className={clsx(
              "px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20 text-sm",
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
            {t("camp_code")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.campCode}
            onChange={(e) => onChange("campCode", e.target.value)}
            placeholder={t("camp_code_placeholder")}
            className={clsx(
              "px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20 text-sm",
              inputClasses,
              errors.campCode && "border-red-500",
            )}
          />
          {errors.campCode && (
            <p className="text-xs text-red-500">{errors.campCode}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Step01Generals
