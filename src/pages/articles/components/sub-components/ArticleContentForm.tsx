import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import RichTextEditor from "@/components/shared/RichTextEditor";
import FormFieldWrapper from "@/components/form-fields/FormFieldWrapper";

interface ArticleContentFormProps {
  formData: Record<string, any>;
  onChange: (updates: Record<string, any>) => void;
  syncKey?: string | number;
  editingLanguage: "en" | "he" | "ar";
}

export default function ArticleContentForm({
  formData,
  onChange,
}: ArticleContentFormProps) {
  const { t } = useTranslation("article");
  const { t: tc } = useTranslation("common");
  const {
    bgSecondary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    language,
  } = useThemeClasses();

  // Get correct field name based on current global language
  const getFieldName = (baseField: string): string => {
    if (language === "en") {
      return baseField; // title, shortDescription, content
    }
    // For he → titleHe, shortDescriptionHe, etc.
    const suffix = language.charAt(0).toUpperCase() + language.slice(1);
    return `${baseField}${suffix}`;
  };

  const titleField = getFieldName("title");
  const shortDescField = getFieldName("shortDescription");
  const contentField = getFieldName("content");

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
        />
        <p className={`text-xs ${textTertiary} mt-1`}>
          {(formData[titleField] || "").length} {t("characters")}
        </p>
      </div>

      <FormFieldWrapper
        label={t("short_description")}
        required
        error={
          (formData[shortDescField] || "").length > 150
            ? tc("exceeds_char_limit", { limit: 150 })
            : undefined
        }
      >
        <RichTextEditor
          value={formData[shortDescField] || ""}
          onChange={(html) => onChange({ [shortDescField]: html })}
          placeholder={t("short_description_placeholder")}
          maxLength={150}
        />
      </FormFieldWrapper>

      <FormFieldWrapper label={t("content")} required>
        <RichTextEditor
          value={formData[contentField] || ""}
          onChange={(html) => onChange({ [contentField]: html })}
          placeholder={t("full_description_placeholder")}
        />
      </FormFieldWrapper>
    </div>
  );
}
