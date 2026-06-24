import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import RichTextEditor from "./RichTextEditor";
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
  syncKey,
  editingLanguage,
}: ArticleContentFormProps) {
  const { t } = useTranslation("article");
  const { t: tc } = useTranslation("common");
  const {
    bgSecondary,
    bgPrimary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
  } = useThemeClasses();
  // Detect which language actually has content, prioritize that
  const detectPrimaryLang = (): "en" | "he" | "ar" => {
    if (
      formData.title?.trim() ||
      formData.shortDescription?.trim() ||
      formData.content?.trim()
    )
      return "en";
    if (
      formData.titleHe?.trim() ||
      formData.shortDescriptionHe?.trim() ||
      formData.contentHe?.trim()
    )
      return "he";
    if (
      formData.titleAr?.trim() ||
      formData.shortDescriptionAr?.trim() ||
      formData.contentAr?.trim()
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

      <FormFieldWrapper
        label={t("short_description")}
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
          placeholder={t("short_description_placeholder")}
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

      <RichTextEditor
        content={formData[contentField] || ""}
        onChange={(html) => onChange({ [contentField]: html })}
        bgPrimary={bgPrimary}
        bgSecondary={bgSecondary}
        textPrimary={textPrimary}
        textTertiary={textTertiary}
        borderColor={borderColor}
        syncKey={syncKey}
        editingLanguage={editingLanguage}
      />
    </div>
  );
}
