import { Languages } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { detectLanguage } from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGenerateBlogNameMutation } from "@/store/api/blogQueryApi";
import FormFieldWrapper from "@/components/form-fields/FormFieldWrapper";

interface PoiTranslateButtonProps {
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

const PoiTranslateButton = ({
  formData,
  onChange,
}: PoiTranslateButtonProps) => {
  const { t } = useTranslation("poi");
  const { t: tc } = useTranslation("common");
  const { bgSecondary, textPrimary, textSecondary, textTertiary, borderColor } =
    useThemeClasses();
  const [generateBlogName, { isLoading: isTranslating }] =
    useGenerateBlogNameMutation();

  const [sourceLang, setSourceLang] = useState<LangKey>("en");
  const initialFormData = useRef(formData);
  initialFormData.current = formData;

  const normalizedRef = useRef(false);

  // On first render: detect source language from base fields.
  // If non-English content is in base fields, move it to the correct
  // language-specific fields so base (English) fields are free for translation.
  useEffect(() => {
    if (normalizedRef.current) return;

    const data = initialFormData.current;

    // Check which language bucket actually has content
    const enSample =
      data?.title?.trim() ||
      data?.shortDescription?.trim() ||
      data?.content?.trim();
    const heSample =
      data?.titleHe?.trim() ||
      data?.shortDescriptionHe?.trim() ||
      data?.contentHe?.trim();
    const arSample =
      data?.titleAr?.trim() ||
      data?.shortDescriptionAr?.trim() ||
      data?.contentAr?.trim();

    // If no content at all, wait (prod latency guard)
    if (!enSample && !heSample && !arSample) return;

    normalizedRef.current = true;

    // Determine source language by which bucket has content
    // (don't rely on detectLanguage on base fields alone)
    let detected: LangKey = "en";
    if (heSample && !enSample) detected = "he";
    else if (arSample && !enSample) detected = "ar";
    else if (enSample) detected = detectLanguage(enSample) as LangKey;

    setSourceLang(detected);

    // Only migrate if non-english content is sitting in base English fields
    // (this was the original intent — handle mis-filed content)
    if ((detected === "he" || detected === "ar") && enSample) {
      const f = LANG_FIELDS[detected];
      const updates: Record<string, any> = {};
      if (data?.title?.trim()) {
        updates[f.title] = data.title;
        updates.title = "";
      }
      if (data?.shortDescription?.trim()) {
        updates[f.shortDescription] = data.shortDescription;
        updates.shortDescription = "";
      }
      if (data?.content?.trim()) {
        updates[f.content] = data.content;
        updates.content = "";
      }
      if (Object.keys(updates).length > 0) onChange(updates);
    }
    // No migration needed if content is already in the right language bucket
  }, [formData]);

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
              <FormFieldWrapper
                label={t("short_description")}
                error={
                  (formData[shortDescription] || "").length > 150
                    ? tc("exceeds_char_limit", { limit: 150 })
                    : undefined
                }
              >
                <textarea
                  dir={dir}
                  rows={3}
                  value={formData[shortDescription] || ""}
                  onChange={(e) =>
                    onChange({ [shortDescription]: e.target.value })
                  }
                  className={`w-full ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none transition-shadow`}
                />
                <p className={`text-xs ${textTertiary} mt-1`}>
                  {tc("char_count", {
                    count: (formData[shortDescription] || "").length,
                    limit: 150,
                  })}
                </p>
              </FormFieldWrapper>
              <FormFieldWrapper
                label={t("description")}
                error={
                  (formData[content] || "").length > 500
                    ? tc("exceeds_char_limit", { limit: 500 })
                    : undefined
                }
              >
                <textarea
                  dir={dir}
                  rows={6}
                  value={formData[content] || ""}
                  onChange={(e) => onChange({ [content]: e.target.value })}
                  className={`w-full ${bgSecondary} ${textPrimary} border ${borderColor} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none transition-shadow`}
                />
                <p className={`text-xs ${textTertiary} mt-1`}>
                  {tc("char_count", {
                    count: (formData[content] || "").length,
                    limit: 500,
                  })}
                </p>
              </FormFieldWrapper>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PoiTranslateButton;
