import clsx from "clsx";
import { Globe } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

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
  const { textPrimary, textSecondary, borderColor, cardClasses } =
    useThemeClasses();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Globe className="w-5 h-5 text-teal-500" />
        <h2 className={clsx("text-lg font-semibold", textPrimary)}>
          Save & Publish
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
          Configuration Summary
        </h3>
        <SummaryRow
          label="Website Logo"
          value={formData.logoUrl ? "Uploaded" : "Not set"}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          borderColor={borderColor}
        />
        <SummaryRow
          label="Primary Color"
          value={formData.primaryColor}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          borderColor={borderColor}
        />
        <SummaryRow
          label="Secondary Color"
          value={formData.secondaryColor}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          borderColor={borderColor}
        />
        <SummaryRow
          label="Font Family"
          value={formData.fontFamily}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          borderColor={borderColor}
        />
        <SummaryRow
          label="Meta Title"
          value={formData.metaTitle}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          borderColor={borderColor}
        />
        <SummaryRow
          label="Default Language"
          value={formData.defaultLanguage}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          borderColor={borderColor}
        />
        <SummaryRow
          label="Timezone"
          value={formData.timezone}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          borderColor={borderColor}
        />
        <SummaryRow
          label="Google Analytics"
          value={formData.googleAnalyticsId}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          borderColor={borderColor}
        />
      </div>
    </div>
  );
}
