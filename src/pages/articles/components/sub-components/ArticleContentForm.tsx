import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import RichTextEditor from "./RichTextEditor";

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

  const isRtl = language === "he" || language === "ar";
  const dir = isRtl ? "rtl" : "ltr";

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

      <RichTextEditor
        content={formData[shortDescField] || ""}
        onChange={(html) => onChange({ [shortDescField]: html })}
        bgPrimary={bgPrimary}
        bgSecondary={bgSecondary}
        textPrimary={textPrimary}
        textTertiary={textTertiary}
        borderColor={borderColor}
        syncKey={syncKey}
        editingLanguage={editingLanguage}
        label={t("short_description")}
        placeholder={t("short_description_placeholder")}
        minHeight="min-h-[120px]"
        maxLength={150}
        charCountLabel={(count, limit) => tc("char_count", { count, limit })}
        exceedsLimitLabel={(limit) => tc("exceeds_char_limit", { limit })}
      />

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
        label={t("content")}
        placeholder={t("full_description_placeholder")}
      />
    </div>
  );
}