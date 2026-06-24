import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import FormFieldWrapper from "@/components/form-fields/FormFieldWrapper";
interface ArticleContentFormProps {
  formData: Record<string, any>;
  onChange: (updates: Record<string, any>) => void;
  syncKey?: string | number;
  editingLanguage: "en" | "he" | "ar";
}

export default function PoiContentForm({
  formData,
  onChange,
}: ArticleContentFormProps) {
  const { t } = useTranslation("article");
  const { t: tc } = useTranslation("common");

  const { bgSecondary, textPrimary, textSecondary, textTertiary, borderColor } =
    useThemeClasses();
  // Detect which language actually has content, prioritize that
  const detectPrimaryLang = (): "en" | "he" | "ar" => {
    if (
      formData?.title?.trim() ||
      formData?.shortDescription?.trim() ||
      formData?.content?.trim()
    )
      return "en";
    if (
      formData?.titleHe?.trim() ||
      formData?.shortDescriptionHe?.trim() ||
      formData?.contentHe?.trim()
    )
      return "he";
    if (
      formData?.titleAr?.trim() ||
      formData?.shortDescriptionAr?.trim() ||
      formData?.contentAr?.trim()
    )
      return "ar";
    return "en";
  };

  const primaryLang = detectPrimaryLang();

  const FIELD_MAP = {
    en: { title: "title", shortDesc: "shortDescription", content: "content" },
    he: {
      title: "titleHe",
      shortDesc: "shortDescriptionHe",
      content: "contentHe",
    },
    ar: {
      title: "titleAr",
      shortDesc: "shortDescriptionAr",
      content: "contentAr",
    },
  };

  const fields = FIELD_MAP[primaryLang];
  const titleField = fields.title;
  const shortDescField = fields.shortDesc;
  const contentField = fields.content;

  const dir = primaryLang === "he" || primaryLang === "ar" ? "rtl" : "ltr";

  return (
    <div className="max-w-7xl mx-auto space-y-6 mt-6">
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {tc("title")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData[titleField] || ""}
          onChange={(e) => onChange({ [titleField]: e.target.value })}
          placeholder={tc("title_placeholder")}
          className={`w-full text-2xl font-bold ${bgSecondary} ${textPrimary} border ${borderColor} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow`}
          dir={dir}
        />
        <p className={`text-xs ${textTertiary} mt-1`}>
          {(formData[titleField] || "").length} {t("characters")}
        </p>
      </div>

      <FormFieldWrapper
        label={tc("short_description")}
        required
        error={
          (formData[shortDescField] || "").length > 150
            ? tc("exceeds_char_limit", { limit: 150 })
            : undefined
        }
      >
        <textarea
          value={formData[shortDescField] || ""}
          onChange={(e) => onChange({ [shortDescField]: e.target.value })}
          placeholder={tc("short_description_placeholder")}
          className={`w-full ${bgSecondary} ${textPrimary} border ${borderColor} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-shadow`}
          rows={3}
          dir={dir}
        />
        <p className={`text-xs ${textTertiary} mt-1`}>
          {tc("char_count", {
            count: (formData[shortDescField] || "").length,
            limit: 150,
          })}
        </p>
      </FormFieldWrapper>
      <FormFieldWrapper
        label={tc("full_description")}
        required
        error={
          (formData[contentField] || "").length > 500
            ? tc("exceeds_char_limit", { limit: 500 })
            : undefined
        }
      >
        <textarea
          value={formData[contentField] || ""}
          onChange={(e) => onChange({ [contentField]: e.target.value })}
          placeholder={tc("full_description_placeholder")}
          className={`w-full ${bgSecondary} ${textPrimary} border ${borderColor} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-shadow`}
          rows={3}
          dir={dir}
        />
        <p className={`text-xs ${textTertiary} mt-1`}>
          {tc("char_count", {
            count: (formData[contentField] || "").length,
            limit: 500,
          })}
        </p>
      </FormFieldWrapper>
    </div>
  );
}
