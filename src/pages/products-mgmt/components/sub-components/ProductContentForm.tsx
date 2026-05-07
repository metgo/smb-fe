import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ArticleContentFormProps {
  formData: Record<string, any>;
  onChange: (updates: Record<string, any>) => void;

}

export default function ProductContentForm({
  formData,
  onChange,
 
}: ArticleContentFormProps) {
  const { t } = useTranslation("article");
  const {
    bgSecondary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
  } = useThemeClasses();
  // Detect which language actually has content, prioritize that
  const detectPrimaryLang = (): "en" | "he" | "ar" => {
    if (
      formData.name?.trim() ||
      formData.shortDescription?.trim() ||
      formData.fullDescription?.trim()
    )
      return "en";
    if (
      formData.nameHe?.trim() ||
      formData.shortDescriptionHe?.trim() ||
      formData.fullDescriptionHe?.trim()
    )
      return "he";
    if (
      formData.nameAr?.trim() ||
      formData.shortDescriptionAr?.trim() ||
      formData.fullDescriptionAr?.trim()
    )
      return "ar";
    return "en";
  };

  const primaryLang = detectPrimaryLang();

  const FIELD_MAP = {
    en: { name: "name", shortDesc: "shortDescription", fullDescription: "fullDescription" },
    he: {
      name: "nameHe",
      shortDesc: "shortDescriptionHe",
      fullDescription: "fullDescriptionHe",
    },
    ar: {
      name: "nameAr",
      shortDesc: "shortDescriptionAr",
      fullDescription: "fullDescriptionAr",
    },
  };

  const fields = FIELD_MAP[primaryLang];
  const titleField = fields.name;
  const shortDescField = fields.shortDesc;
  const descField = fields.fullDescription;

  const dir = primaryLang === "he" || primaryLang === "ar" ? "rtl" : "ltr";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("title")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData[titleField] || ""}
          onChange={(e) => onChange({ [titleField]: e.target.value })}
          placeholder={t("title_placeholder")}
          className={`w-full text-2xl font-bold ${bgSecondary} ${textPrimary} border ${borderColor} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow`}
          dir={dir}
        />
        <p className={`text-xs ${textTertiary} mt-1`}>
          {(formData[titleField] || "").length} {t("characters")}
        </p>
      </div>

      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("short_description")} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[shortDescField] || ""}
          onChange={(e) => onChange({ [shortDescField]: e.target.value })}
          placeholder={t("short_description_placeholder")}
          className={`w-full ${bgSecondary} ${textPrimary} border ${borderColor} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-shadow`}
          rows={3}
          dir={dir}
        />
        <p className={`text-xs ${textTertiary} mt-1`}>
          {(formData[shortDescField] || "").length} {t("characters")}
        </p>
      </div>

      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("full_description")} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[descField] || ""}
          onChange={(e) => onChange({ [descField]: e.target.value })}
          placeholder={t("full_description_placeholder")}
          className={`w-full ${bgSecondary} ${textPrimary} border ${borderColor} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-shadow`}
          rows={3}
          dir={dir}
        />
        <p className={`text-xs ${textTertiary} mt-1`}>
          {(formData[descField] || "").length} {t("characters")}
        </p>
      </div>
    </div>
  );
}
