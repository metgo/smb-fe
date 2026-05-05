import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGenerateBlogNameMutation } from "@/store/api/blogQueryApi";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface PoiTranslateButtonProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  sourceLang: Language;
}

type LangKey = "en" | "he" | "ar";

const LANG_LABELS: Record<LangKey, string> = {
  en: "English",
  he: "Hebrew",
  ar: "Arabic",
};

// POI form field names per language
const POI_FIELDS: Record<
  LangKey,
  {
    name: string;
    shortDescription: string;
    fullDescription: string;
    dir: "ltr" | "rtl";
  }
> = {
  en: {
    name: "nameEn",
    shortDescription: "shortDescriptionEn",
    fullDescription: "fullDescriptionEn",
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

// API response key for each language
const LANG_RESPONSE_KEYS: Record<
  LangKey,
  { title: string; shortDescription: string; description: string }
> = {
  en: {
    title: "title",
    shortDescription: "shortDescription",
    description: "description",
  },
  he: {
    title: "titleHe",
    shortDescription: "shortDescriptionHe",
    description: "descriptionHe",
  },
  ar: {
    title: "titleAr",
    shortDescription: "shortDescriptionAr",
    description: "descriptionAr",
  },
};

const PoiTranslateButton = ({
  formData,
  setFormData,
  sourceLang,
}: PoiTranslateButtonProps) => {
  const { t } = useTranslation("poi");
  const { bgSecondary, textPrimary, textSecondary, textTertiary, borderColor } =
    useThemeClasses();
  const [generateBlogName, { isLoading: isTranslating }] =
    useGenerateBlogNameMutation();

  const onChange = (updates: Record<string, any>) => {
    setFormData((prev: any) => ({ ...prev, ...updates }));
  };

  const handleTranslate = async () => {
    const src = POI_FIELDS[sourceLang as LangKey];
    try {
      // Always call with fixed keys regardless of source language
      const result = await generateBlogName({
        title: formData[src.name],
        shortDescription: formData[src.shortDescription],
        description: formData[src.fullDescription],
      }).unwrap();

      // Map response to the two target languages, only fill empty fields
      const targetLangs = (["en", "he", "ar"] as LangKey[]).filter(
        (l) => l !== sourceLang,
      );
      const updates: Record<string, any> = {};

      targetLangs.forEach((lang) => {
        const f = POI_FIELDS[lang];
        const rk = LANG_RESPONSE_KEYS[lang];

        if (!formData[f.name]?.trim() && result[rk.title])
          updates[f.name] = result[rk.title];
        if (
          !formData[f.shortDescription]?.trim() &&
          result[rk.shortDescription]
        )
          updates[f.shortDescription] = result[rk.shortDescription];
        if (!formData[f.fullDescription]?.trim() && result[rk.description])
          updates[f.fullDescription] = result[rk.description];
      });

      if (Object.keys(updates).length > 0) onChange(updates);
    } catch (error) {
      console.warn("POI translation failed", error);
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
            {t("step_translation")}
          </h3>
          <p className={`text-sm ${textTertiary}`}>{t("translate_hint")}</p>
        </div>
        <button
          onClick={handleTranslate}
          disabled={isTranslating}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-60 transition-colors text-sm font-medium"
        >
          <Languages className="w-4 h-4 animate-pulse" />
          {isTranslating ? t("translating") : t("auto_translate")}
        </button>
      </div>

      {targetLangs.map((lang) => {
        const { name, shortDescription, fullDescription, dir } =
          POI_FIELDS[lang];
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
                  {t("poi_name")}
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
                  {t("full_description")}
                </label>
                <textarea
                  dir={dir}
                  rows={6}
                  value={formData[fullDescription] || ""}
                  onChange={(e) =>
                    onChange({ [fullDescription]: e.target.value })
                  }
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

export default PoiTranslateButton;
