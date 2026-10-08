import clsx from "clsx";
import { toast } from "sonner";
import { useState } from "react";
import { BarChart2, KeyRound } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";
import {
  useGetAnalyticsSecretStatusQuery,
  useRemoveAnalyticsSecretMutation,
  useSetAnalyticsSecretMutation,
} from "@/store/api/siteAnalyticsApi";

// write-only: the saved secret is never shown, only whether one is set
const AnalyticsSecretField = ({ websiteId }: { websiteId: string | null }) => {
  const { t } = useTranslation("website_settings");
  const { textPrimary, textSecondary, inputClasses, borderColor } =
    useThemeClasses();
  const [secret, setSecret] = useState("");
  const { data: status } = useGetAnalyticsSecretStatusQuery(websiteId ?? "", {
    skip: !websiteId,
  });
  const [save, { isLoading: saving }] = useSetAnalyticsSecretMutation();
  const [remove, { isLoading: removing }] = useRemoveAnalyticsSecretMutation();

  const errorText = (error: unknown) =>
    (
      error as { data?: { message?: string | string[] } }
    )?.data?.message?.toString() || t("ga_api_secret_failed");
  const button = clsx(
    "px-3 py-2 rounded-xl border text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
    borderColor,
    textSecondary,
  );

  return (
    <div className="flex flex-col gap-2 col-span-2">
      <label
        htmlFor="ga-api-secret"
        className={clsx(
          "text-sm font-medium flex items-center gap-2",
          textPrimary,
        )}
      >
        <KeyRound className="w-4 h-4" />
        {t("ga_api_secret")}
      </label>
      {!websiteId ? (
        <span className={clsx("text-xs", textSecondary)}>
          {t("ga_api_secret_save_site_first")}
        </span>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <input
              id="ga-api-secret"
              type="password"
              autoComplete="off"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder={
                status?.isSet
                  ? t("ga_api_secret_replace_placeholder")
                  : t("ga_api_secret_placeholder")
              }
              className={clsx(
                "flex-1 min-w-[14rem] px-4 py-2.5 rounded-xl border text-sm",
                inputClasses,
              )}
            />
            <button
              type="button"
              className={button}
              disabled={!secret.trim() || saving}
              onClick={async () => {
                try {
                  await save({
                    websiteId,
                    gaApiSecret: secret.trim(),
                  }).unwrap();
                  setSecret("");
                  toast.success(t("ga_api_secret_saved"));
                } catch (error) {
                  toast.error(errorText(error));
                }
              }}
            >
              {t("ga_api_secret_save")}
            </button>
            {status?.isSet && (
              <button
                type="button"
                className={button}
                disabled={removing}
                onClick={async () => {
                  try {
                    await remove(websiteId).unwrap();
                    toast.success(t("ga_api_secret_removed"));
                  } catch (error) {
                    toast.error(errorText(error));
                  }
                }}
              >
                {t("ga_api_secret_remove")}
              </button>
            )}
          </div>
          <span className={clsx("text-xs", textSecondary)}>
            {status?.isSet
              ? t("ga_api_secret_is_set", {
                  date: status.updatedAt
                    ? new Date(status.updatedAt).toLocaleDateString()
                    : "",
                })
              : t("ga_api_secret_not_set")}{" "}
            {t("ga_api_secret_hint")}
          </span>
        </>
      )}
    </div>
  );
};

interface Props {
  websiteId?: string | null;
  formData: ISiteSettingsFormData;
  errors: SiteSettingsErrors;
  onChange: (field: keyof ISiteSettingsFormData, value: string) => void;
}

const Step08Analytics = ({
  websiteId = null,
  formData,
  errors,
  onChange,
}: Props) => {
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
      field: "gaPropertyId",
      label: t("ga_property_id"),
      placeholder: "123456789",
      hint: t("ga_property_id_hint"),
    },
    {
      field: "googleAdsConvTrackId",
      label: t("google_ads_conversion_tracking_id"),
      placeholder: "AW-XXXXXXX",
    },
    {
      field: "enableWidgetId",
      label: t("enable_widget_id"),
      placeholder: "L51962c1rufewge6-1234-56789",
    },
    {
      field: "hotjarId",
      label: t("hotjar_id"),
      placeholder: "1234567",
    },
    {
      field: "facebookPixelId",
      label: t("facebook_pixel_id"),
      placeholder: "12345678901234567",
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
        <AnalyticsSecretField websiteId={websiteId} />
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
