import { Languages } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { detectLanguage } from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGenerateBlogNameMutation } from "@/store/api/blogQueryApi";

interface ArticleTranslateButtonProps {
  formData: any;
  onChange: (updates: Record<string, any>) => void;
}

type LangKey = "en" | "he" | "ar";

const LANG_LABELS: Record<LangKey, string> = {
  en: "English",
  he: "Hebrew",
  ar: "Arabic",
};

const LANG_FIELDS: Record<
  LangKey,
  {
    title: string;
    shortDescription: string;
    content: string;
    dir: "ltr" | "rtl";
  }
> = {
  en: {
    title: "title",
    shortDescription: "shortDescription",
    content: "content",
    dir: "ltr",
  },
  he: {
    title: "titleHe",
    shortDescription: "shortDescriptionHe",
    content: "contentHe",
    dir: "rtl",
  },
  ar: {
    title: "titleAr",
    shortDescription: "shortDescriptionAr",
    content: "contentAr",
    dir: "rtl",
  },
};

const ArticleTranslateButton = ({
  formData,
  onChange,
}: ArticleTranslateButtonProps) => {
  const { t } = useTranslation("article");
  const { bgSecondary, textPrimary, textSecondary, textTertiary, borderColor } =
    useThemeClasses();
  const [generateBlogName, { isLoading: isTranslating }] =
    useGenerateBlogNameMutation();

  const [sourceLang, setSourceLang] = useState<LangKey>("en");
  const initialFormData = useRef(formData);
  const normalizedRef = useRef(false);

  // On first render: detect source language from base fields.
  // If non-English content is in base fields, move it to the correct
  // language-specific fields so base (English) fields are free for translation.
  useEffect(() => {
    if (normalizedRef.current) return;
    normalizedRef.current = true;

    const data = initialFormData.current;
    const baseTitle = data.title?.trim() || "";
    const baseDesc = data.shortDescription?.trim() || "";
    const baseContent = data.content?.trim() || "";

    const sample = baseTitle || baseDesc || baseContent;
    const detected = (sample ? detectLanguage(sample) : "en") as LangKey;
    setSourceLang(detected);

    if (detected === "he" || detected === "ar") {
      const f = LANG_FIELDS[detected];
      const updates: Record<string, any> = {};
      if (baseTitle) {
        updates[f.title] = baseTitle;
        updates.title = "";
      }
      if (baseDesc) {
        updates[f.shortDescription] = baseDesc;
        updates.shortDescription = "";
      }
      if (baseContent) {
        updates[f.content] = baseContent;
        updates.content = "";
      }
      if (Object.keys(updates).length > 0) onChange(updates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTranslate = async () => {
    const srcFields = LANG_FIELDS[sourceLang];
    try {
      const result = await generateBlogName({
        title: formData[srcFields.title],
        shortDescription: formData[srcFields.shortDescription],
        content: formData[srcFields.content],
      }).unwrap();

      // response keys match formData keys exactly (titleHe, titleAr, etc.)
      // only fill fields the user hasn't typed
      const targetLangs = (["en", "he", "ar"] as LangKey[]).filter(
        (l) => l !== sourceLang,
      );
      const updates: Record<string, any> = {};
      targetLangs.forEach((lang) => {
        const f = LANG_FIELDS[lang];
        [f.title, f.shortDescription, f.content].forEach((key) => {
          if (!formData[key]?.trim() && result[key]) {
            updates[key] = result[key];
          }
        });
      });

      if (Object.keys(updates).length > 0) onChange(updates);
    } catch {
      // errors surfaced via toast in parent
    }
  };

  const targetLangs = (["en", "he", "ar"] as LangKey[]).filter(
    (l) => l !== sourceLang,
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-semibold ${textPrimary}`}>
            {t("translation")}
          </h3>
          <p className={`text-sm ${textTertiary}`}>{t("translate_hint")}</p>
        </div>
        <button
          onClick={handleTranslate}
          disabled={isTranslating}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-60 transition-colors text-sm font-medium "
        >
          <Languages className="w-4 h-4 animate-pulse" />
          {isTranslating ? t("translating") : t("auto_translate")}
        </button>
      </div>

      {targetLangs.map((lang) => {
        const { title, shortDescription, content, dir } = LANG_FIELDS[lang];
        return (
          <div
            key={lang}
            className={`rounded-xl border ${borderColor} overflow-hidden`}
          >
            <div className={`px-4 py-3 ${bgSecondary} border-b ${borderColor}`}>
              <span className={`text-sm font-semibold ${textSecondary}`}>
                {LANG_LABELS[lang]}
              </span>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium ${textSecondary} mb-1`}
                >
                  {t("title")}
                </label>
                <input
                  type="text"
                  dir={dir}
                  value={formData[title] || ""}
                  onChange={(e) => onChange({ [title]: e.target.value })}
                  className={`w-full ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${textSecondary} mb-1`}
                >
                  {t("short_description")}
                </label>
                <textarea
                  dir={dir}
                  rows={3}
                  value={formData[shortDescription] || ""}
                  onChange={(e) =>
                    onChange({ [shortDescription]: e.target.value })
                  }
                  className={`w-full ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none transition-shadow`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${textSecondary} mb-1`}
                >
                  {t("content")}
                </label>
                <textarea
                  dir={dir}
                  rows={6}
                  value={formData[content] || ""}
                  onChange={(e) => onChange({ [content]: e.target.value })}
                  className={`w-full ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none transition-shadow`}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ArticleTranslateButton;
