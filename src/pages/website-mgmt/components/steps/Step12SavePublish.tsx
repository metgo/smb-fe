import clsx from "clsx";
import { Globe } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";

interface Props {
  formData: SiteSettingsFormData;
}

function SummaryRow({
  label,
  value,
  textPrimary,
  textSecondary,
  borderColor,
}: {
  label: string;
  value: string;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
}) {
  return (
    <div
      className={clsx(
        "flex items-center justify-between py-2.5 border-b last:border-b-0",
        borderColor,
      )}
    >
      <span className={clsx("text-sm", textSecondary)}>{label}</span>
      <span
        className={clsx(
          "text-sm font-medium truncate max-w-[55%] text-right",
          textPrimary,
        )}
      >
        {value || "—"}
      </span>
    </div>
  );
}

export default function Step12SavePublish({ formData }: Props) {
  const { t } = useTranslation("website_settings");
  const { textPrimary, textSecondary, borderColor, cardClasses } =
    useThemeClasses();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Globe className="w-5 h-5 text-teal-500" />
        <h2 className={clsx("text-lg font-semibold", textPrimary)}>
          {t("save_publish_title")}
        </h2>
      </div>

      {/* Summary Card */}
      <div className={clsx("rounded-2xl border p-5", cardClasses, borderColor)}>
        <h3
          className={clsx(
            "text-sm font-semibold mb-4 uppercase tracking-wide",
            textSecondary,
          )}
        >
          {t("config_summary")}
        </h3>
        <SummaryRow
          label={t("summary_website_logo")}
          value={
            formData.logoUrl ? t("logo_uploaded_value") : t("logo_not_set")
          }
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          borderColor={borderColor}
        />
        <SummaryRow
          label={t("summary_primary_color")}
          value={formData.primaryColor}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          borderColor={borderColor}
        />
        <SummaryRow
          label={t("summary_secondary_color")}
          value={formData.secondaryColor}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          borderColor={borderColor}
        />
        <SummaryRow
          label={t("summary_font_family")}
          value={formData.fontFamily}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          borderColor={borderColor}
        />
        <SummaryRow
          label={t("summary_meta_title")}
          value={formData.metaTitle}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          borderColor={borderColor}
        />
        <SummaryRow
          label={t("summary_default_language")}
          value={formData.defaultLanguage}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          borderColor={borderColor}
        />
        <SummaryRow
          label={t("summary_timezone")}
          value={formData.timezone}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          borderColor={borderColor}
        />
        <SummaryRow
          label={t("summary_google_analytics")}
          value={formData.googleAnalyticsId}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          borderColor={borderColor}
        />
      </div>
    </div>
  );
}
