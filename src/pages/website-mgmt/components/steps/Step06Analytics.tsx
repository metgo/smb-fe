import clsx from "clsx";
import { BarChart2 } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface Props {
  formData: SiteSettingsFormData;
  errors: SiteSettingsErrors;
  onChange: (field: keyof SiteSettingsFormData, value: string) => void;
}

export default function Step06Analytics({ formData, errors, onChange }: Props) {
  const { textPrimary, textSecondary, inputClasses, borderColor } =
    useThemeClasses();

  const inputCls = clsx(
    "px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20 text-sm",
    inputClasses,
  );

  const fields: {
    field: keyof SiteSettingsFormData;
    label: string;
    placeholder: string;
    hint?: string;
  }[] = [
    {
      field: "googleAnalyticsId",
      label: "Google Analytics ID (GA4)",
      placeholder: "G-XXXXXXXXXX",
      hint: "Found in Google Analytics → Admin → Data Streams",
    },
    {
      field: "googleTagManagerId",
      label: "Google Tag Manager ID",
      placeholder: "GTM-XXXXXXX",
    },
    {
      field: "facebookPixelId",
      label: "Facebook Pixel ID",
      placeholder: "123456789012345",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <BarChart2 className="w-5 h-5 text-teal-500" />
        <h2 className={clsx("text-lg font-semibold", textPrimary)}>
          Tracking & Scripts
        </h2>
      </div>

      <div className="flex flex-col gap-5">
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
          Custom Scripts
        </h3>

        <div className="flex flex-col gap-2">
          <label className={clsx("text-sm font-medium", textPrimary)}>
            Header Scripts
          </label>
          <p className={clsx("text-xs", textSecondary)}>
            Injected inside &lt;head&gt; — avoid render-blocking scripts
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
            Footer Scripts
          </label>
          <p className={clsx("text-xs", textSecondary)}>
            Injected before &lt;/body&gt;
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
}
