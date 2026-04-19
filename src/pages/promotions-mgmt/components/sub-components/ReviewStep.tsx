import { Globe, Layers, ExternalLink, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";

const LANG_META = {
  en: { label: "English", native: "EN", dir: "ltr" as const, flag: "🇺🇸" },
  he: { label: "Hebrew", native: "עב", dir: "rtl" as const, flag: "🇮🇱" },
  ar: { label: "Arabic", native: "عر", dir: "rtl" as const, flag: "🇸🇦" },
};

interface ReviewStepProps {
  placement: string;
  active: boolean;
  mediaType: "image" | "video";
  desktopMediaUrl: string;
  title: Record<Language, string>;
  content: Record<Language, string>;
  linkUrl: string;
  langComplete: (lang: Language) => boolean;
}

export default function ReviewStep({
  placement,
  active,
  mediaType,
  desktopMediaUrl,
  title,
  content,
  linkUrl,
  langComplete,
}: ReviewStepProps) {
  const { t } = useTranslation("promotions");
  const {
    isDark,
    textPrimary,
    textSecondary,
    textTertiary,
    bgPrimary,
    bgSecondary,
    borderColor,
  } = useThemeClasses();

  const missingLangs = (["he", "ar"] as Language[]).filter(
    (l) => !langComplete(l),
  );

  return (
    <div className="space-y-5">
      {/* Summary grid */}
      <div className={`rounded-xl border ${borderColor} overflow-hidden`}>
        <div className={`px-4 py-3 ${bgSecondary} border-b ${borderColor}`}>
          <h4 className={`text-sm font-semibold ${textPrimary}`}>
            {t("promotion_summary")}
          </h4>
        </div>
        <div className={`${bgPrimary} divide-y ${borderColor}`}>
          {[
            { label: t("placement"), value: placement },
            { label: t("status"), value: active ? "🟢 Active" : "⚫ Draft" },
            {
              label: t("media_type"),
              value: mediaType === "image" ? "🖼 Image" : "🎥 Video",
            },
            { label: t("title_en"), value: title.en || "—" },
            ...(linkUrl ? [{ label: t("link"), value: linkUrl }] : []),
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-start justify-between gap-4 px-4 py-2.5"
            >
              <span className={`text-sm ${textSecondary} shrink-0`}>
                {label}
              </span>
              <span
                className={`text-sm font-medium ${textPrimary} text-right truncate`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Live preview */}
      {desktopMediaUrl && (
        <div>
          <h4 className={`text-sm font-semibold ${textPrimary} mb-2`}>
            {t("live_preview")}
          </h4>
          <div className="relative rounded-xl overflow-hidden shadow-lg">
            <img
              src={desktopMediaUrl}
              alt="Preview"
              className="w-full h-52 object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-600 rounded-full text-[10px] font-semibold mb-2 uppercase tracking-wider">
                <Layers className="w-3 h-3" />
                {placement}
              </div>
              <h3 className="text-xl font-bold leading-tight drop-shadow">
                {title.en || t("untitled_promotion")}
              </h3>
              {content.en && (
                <p className="text-sm mt-1 opacity-90 line-clamp-2 drop-shadow-sm">
                  {content.en}
                </p>
              )}
              {linkUrl && (
                <div className="mt-2 flex items-center gap-1 text-xs text-blue-200">
                  <ExternalLink className="w-3 h-3" />
                  {linkUrl}
                </div>
              )}
            </div>
            {!active && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-gray-900/70 text-white text-[10px] font-semibold backdrop-blur-sm">
                {t("draft")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Missing translations notice */}
      {missingLangs.length > 0 && (
        <div
          className={clsx(
            "flex gap-3 p-3.5 rounded-xl border",
            isDark
              ? "bg-gray-800/60 border-gray-700"
              : "bg-gray-50 border-gray-200",
          )}
        >
          <Globe className={clsx("w-4 h-4 mt-0.5 shrink-0", textTertiary)} />
          <p className={clsx("text-xs leading-relaxed", textSecondary)}>
            {t("missing_translations_prefix")}{" "}
            {missingLangs.map((l) => LANG_META[l].label).join(" and ")}.{" "}
            {t("missing_translations_suffix")}
          </p>
        </div>
      )}

      {/* Success message */}
      <div
        className={clsx(
          "flex gap-3 p-3.5 rounded-xl border",
          isDark
            ? "bg-green-950/20 border-green-800"
            : "bg-green-50 border-green-200",
        )}
      >
        <Sparkles
          className={clsx(
            "w-4 h-4 mt-0.5 shrink-0",
            isDark ? "text-green-400" : "text-green-600",
          )}
        />
        <p
          className={clsx(
            "text-xs leading-relaxed",
            isDark ? "text-green-200" : "text-green-800",
          )}
        >
          <strong>{t("ready_to_publish")}</strong> {t("publish_instruction")}
        </p>
      </div>
    </div>
  );
}
