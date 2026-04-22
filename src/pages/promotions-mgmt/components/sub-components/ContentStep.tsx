import { Globe, Link as LinkIcon, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";

const LANG_META = {
  en: { label: "English", native: "EN", dir: "ltr" as const, flag: "🇺🇸" },
  he: { label: "Hebrew", native: "עב", dir: "rtl" as const, flag: "🇮🇱" },
  ar: { label: "Arabic", native: "عر", dir: "rtl" as const, flag: "🇸🇦" },
};

interface ContentStepProps {
  editingLang: Language;
  setEditingLang: (lang: Language) => void;
  title: Record<Language, string>;
  content: Record<Language, string>;
  linkUrl: string;
  langComplete: (lang: Language) => boolean;
  onTitleChange: (lang: Language, value: string) => void;
  onContentChange: (lang: Language, value: string) => void;
  onLinkUrlChange: (v: string) => void;
}

export default function ContentStep({
  editingLang,
  setEditingLang,
  title,
  content,
  linkUrl,
  langComplete,
  onTitleChange,
  onContentChange,
  onLinkUrlChange,
}: ContentStepProps) {
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

  const isRTLLang = editingLang === "he" || editingLang === "ar";
  const anyLangComplete = (Object.keys(LANG_META) as Language[]).some((lang) =>
    langComplete(lang),
  );

  return (
    <div
      className={`space-y-6 rounded-md p-4 ${isDark ? "bg-gray-900" : "bg-white"}`}
    >
      {/* Language selector */}
      <div
        className={`flex items-center gap-3 p-3 rounded-xl ${bgSecondary} border ${borderColor}`}
      >
        <Globe className={`w-4 h-4 ${textTertiary} shrink-0`} />
        <span className={`text-xs font-medium ${textSecondary}`}>
          {t("language")}
        </span>
        <div className="flex gap-1.5">
          {(Object.keys(LANG_META) as Language[]).map((lang) => {
            const m = LANG_META[lang];
            const complete = langComplete(lang);
            return (
              <button
                key={lang}
                onClick={() => setEditingLang(lang)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  editingLang === lang
                    ? "bg-green-600 text-white shadow-sm"
                    : `${bgPrimary} ${textSecondary} dark:hover:bg-gray-700 border ${borderColor}`
                }`}
              >
                <span>{m.flag}</span>
                <span>{m.native}</span>
                {complete && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      editingLang === lang ? "bg-green-300" : "bg-green-500"
                    }`}
                  />
                )}
                {!complete && !anyLangComplete && editingLang === lang && (
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-red-300" />
                )}
                {!complete && !anyLangComplete && editingLang !== lang && (
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-red-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Title + Description */}
      <div dir={isRTLLang ? "rtl" : "ltr"} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={`text-sm font-semibold ${textPrimary}`}>
              {t("title")}{" "}
              {!anyLangComplete && <span className="text-red-500">*</span>}
            </label>
            <span className={`text-xs ${textTertiary}`}>
              {title[editingLang].length}/80
            </span>
          </div>
          <input
            type="text"
            maxLength={80}
            value={title[editingLang]}
            onChange={(e) => onTitleChange(editingLang, e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition`}
            placeholder={t("title_placeholder", {
              lang: LANG_META[editingLang].label,
            })}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={`text-sm font-semibold ${textPrimary}`}>
              {t("description")}{" "}
              {!anyLangComplete && <span className="text-red-500">*</span>}
            </label>
            <span className={`text-xs ${textTertiary}`}>
              {content[editingLang].length}/300
            </span>
          </div>
          <textarea
            rows={4}
            maxLength={300}
            value={content[editingLang]}
            onChange={(e) => onContentChange(editingLang, e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none`}
            placeholder={t("description_placeholder", {
              lang: LANG_META[editingLang].label,
            })}
          />
        </div>
      </div>

      {/* URL */}
      <div>
        <label
          className={`flex items-center gap-2 text-sm font-semibold ${textPrimary} mb-1.5`}
        >
          <LinkIcon className="w-4 h-4" />
          {t("destination_url")}
          <span className={`text-xs font-normal ${textTertiary}`}>
            ({t("optional")})
          </span>
        </label>
        <div className="relative">
          <ExternalLink
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textTertiary}`}
          />
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => onLinkUrlChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${borderColor} ${bgPrimary} ${textPrimary} text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition`}
            placeholder={t("url_placeholder")}
          />
        </div>
        <p className={`text-xs ${textTertiary} mt-1.5`}>
          {t("destination_hint")}
        </p>
      </div>
    </div>
  );
}
