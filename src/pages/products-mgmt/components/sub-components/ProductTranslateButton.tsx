import { Languages } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { detectLanguage } from "@/helpers";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGenerateBlogNameMutation } from "@/store/api/blogQueryApi";

interface ProductTranslateButtonProps {
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
    name: string;
    shortDescription: string;
    fullDescription: string;
    dir: "ltr" | "rtl";
  }
> = {
  en: {
    name: "name", // ← Changed
    shortDescription: "shortDescription",
    fullDescription: "fullDescription", // ← Changed
    dir: "ltr",
  },
  he: {
    name: "nameHe",
    shortDescription: "shortDescriptionHe",
    fullDescription: "fullDescriptionHe",
    dir: "rtl",
  },
  ar: {
    name: "nameAr",
    shortDescription: "shortDescriptionAr",
    fullDescription: "fullDescriptionAr",
    dir: "rtl",
  },
};

const ProductTranslateButton = ({
  formData,
  onChange,
}: ProductTranslateButtonProps) => {
  const { t } = useTranslation("products");
  const { bgSecondary, textPrimary, textSecondary, textTertiary, borderColor } =
    useThemeClasses();
  const [generateBlogName, { isLoading: isTranslating }] =
    useGenerateBlogNameMutation();

  const [sourceLang, setSourceLang] = useState<LangKey>("he");
  const initialFormData = useRef(formData);
  initialFormData.current = formData;

  const normalizedRef = useRef(false);

  // On first render: detect source language from base fields.
  // If non-English content is in base fields, move it to the correct
  // language-specific fields so base (English) fields are free for translation.
  useEffect(() => {
    if (normalizedRef.current) return;

    const data = initialFormData.current;

    // More accurate sampling
    const enSample =
      data.name?.trim() ||
      data.shortDescription?.trim() ||
      data.fullDescription?.trim();

    const heSample =
      data.nameHe?.trim() ||
      data.shortDescriptionHe?.trim() ||
      data.fullDescriptionHe?.trim();

    const arSample =
      data.nameAr?.trim() ||
      data.shortDescriptionAr?.trim() ||
      data.fullDescriptionAr?.trim();

    if (!enSample && !heSample && !arSample) return;

    normalizedRef.current = true;

    let detected: LangKey = "en";

    if (heSample) detected = "he";
    else if (arSample) detected = "ar";
    else if (enSample) {
      detected = detectLanguage(enSample) as LangKey;
    }

    setSourceLang(detected);

    // Migrate only if non-English content is in English base fields
    if ((detected === "he" || detected === "ar") && enSample) {
      const f = LANG_FIELDS[detected];
      const updates: Record<string, any> = {};

      if (data.name?.trim()) {
        updates[f.name] = data.name;
        updates.name = "";
      }
      if (data.shortDescription?.trim()) {
        updates[f.shortDescription] = data.shortDescription;
        updates.shortDescription = "";
      }
      if (data.fullDescription?.trim()) {
        updates[f.fullDescription] = data.fullDescription;
        updates.fullDescription = "";
      }

      if (Object.keys(updates).length > 0) onChange(updates);
    }
  }, [formData, onChange]); // Added onChange for safety

  const handleTranslate = async () => {
    const srcFields = LANG_FIELDS[sourceLang];

    console.log("Source Fields:", srcFields);

    try {
      const result = await generateBlogName({
        title: formData[srcFields.name],
        shortDescription: formData[srcFields.shortDescription],
        description: formData[srcFields.fullDescription],
      }).unwrap();

      const targetLangs = (["en", "he", "ar"] as LangKey[]).filter(
        (l) => l !== sourceLang,
      );

      const updates: Record<string, any> = {};

      targetLangs.forEach((lang) => {
        const targetFields = LANG_FIELDS[lang];

        // Map API response keys → actual form field names
        if (result.title && !formData[targetFields.name]?.trim()) {
          updates[targetFields.name] = result.title;
        }
        if (
          result.shortDescription &&
          !formData[targetFields.shortDescription]?.trim()
        ) {
          updates[targetFields.shortDescription] = result.shortDescription;
        }
        if (result.content && !formData[targetFields.fullDescription]?.trim()) {
          updates[targetFields.fullDescription] = result.content;
        }
      });

      if (Object.keys(updates).length > 0) {
        onChange(updates);
      }
    } catch (err) {
      console.error("Translation failed:", err);
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
        const { name, shortDescription, fullDescription, dir } = LANG_FIELDS[lang];
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
                  value={formData[name] || ""}
                  onChange={(e) => onChange({ [name]: e.target.value })}
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
                  value={formData[fullDescription] || ""}
                  onChange={(e) => onChange({ [fullDescription]: e.target.value })}
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

export default ProductTranslateButton;
