import clsx from "clsx";
import { BarChart2 } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";

interface Props {
  formData: ISiteSettingsFormData;
  errors: SiteSettingsErrors;
  onChange: (field: keyof ISiteSettingsFormData, value: string) => void;
}

const Step08Analytics = ({ formData, errors, onChange }: Props) => {
  const { t } = useTranslation("website_settings");
  const { textPrimary, textSecondary, inputClasses, borderColor } =
    useThemeClasses();

  const inputCls = clsx(
    "px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20 text-sm",
    inputClasses,
  );

  const fields: {
    field: keyof ISiteSettingsFormData;
    label: string;
    placeholder: string;
    hint?: string;
  }[] = [
    {
      field: "googleAnalyticsId",
      label: t("google_analytics_id"),
      placeholder: "G-XXXXXXXXXX",
      hint: t("google_analytics_hint"),
    },
    {
      field: "googleAdsConvTrackId",
      label: t("google_ads_conversion_tracking_id"),
      placeholder: "AW-XXXXXXX",
    },
    {
      field: "enableWidgetId",
      label: t("enable_widget_id"),
      placeholder: "XX-XXXXXXX",
    },
    {
      field: "hotjarId",
      label: t("hotjar_id"),
      placeholder: "1234567",
    },
    {
      field: "facebookPixelId",
      label: t("facebook_pixel_id"),
      placeholder: "123456789012345",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <BarChart2 className="w-5 h-5 text-teal-500" />
        <h2 className={clsx("text-lg font-semibold", textPrimary)}>
          {t("analytics_title")}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {fields.map(({ field, label, placeholder, hint }) => (
          <div key={field} className="flex flex-col gap-2">
            <label className={clsx("text-sm font-medium", textPrimary)}>
              {label}
            </label>
            <input
              type="text"
              value={formData[field] as string}
              onChange={(e) => onChange(field, e.target.value)}
              placeholder={placeholder}
              className={clsx(inputCls, errors[field] && "border-red-500")}
            />
            {hint && (
              <span className={clsx("text-xs", textSecondary)}>{hint}</span>
            )}
            {errors[field] && (
              <span className="text-xs text-red-500">{errors[field]}</span>
            )}
          </div>
        ))}
      </div>

      <div className={clsx("flex flex-col gap-5 pt-4 border-t", borderColor)}>
        <h3
          className={clsx(
            "text-sm font-semibold uppercase tracking-wide",
            textSecondary,
          )}
        >
          {t("custom_scripts")}
        </h3>

        <div className="flex flex-col gap-2">
          <label className={clsx("text-sm font-medium", textPrimary)}>
            {t("header_scripts")}
          </label>
          <p className={clsx("text-xs", textSecondary)}>
            {t("header_scripts_hint")}
          </p>
          <textarea
            rows={6}
            value={formData.headerScripts}
            onChange={(e) => onChange("headerScripts", e.target.value)}
            placeholder={"<!-- Custom head scripts -->\n<script>...</script>"}
            className={clsx(inputCls, "resize-y font-mono text-xs")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={clsx("text-sm font-medium", textPrimary)}>
            {t("footer_scripts")}
          </label>
          <p className={clsx("text-xs", textSecondary)}>
            {t("footer_scripts_hint")}
          </p>
          <textarea
            rows={6}
            value={formData.footerScripts}
            onChange={(e) => onChange("footerScripts", e.target.value)}
            placeholder={"<!-- Custom footer scripts -->\n<script>...</script>"}
            className={clsx(inputCls, "resize-y font-mono text-xs")}
          />
        </div>
      </div>
    </div>
  );
};
export default Step08Analytics;
