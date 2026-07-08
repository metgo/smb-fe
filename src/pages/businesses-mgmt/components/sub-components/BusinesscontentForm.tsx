import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import FormFieldWrapper from "@/components/form-fields/FormFieldWrapper";

interface ArticleContentFormProps {
  formData: Record<string, any>;
  onChange: (updates: Record<string, any>) => void;
}

export const BusinessContentForm = ({
  formData,
  onChange,
}: ArticleContentFormProps) => {
  console.log("🚀 ~ BusinessContentForm ~ formData:", formData)
  const { t } = useTranslation("common");
  const { bgSecondary, textPrimary, textSecondary, textTertiary, borderColor, language } =
    useThemeClasses();

  // Get correct field name based on current global language
  const getFieldName = (baseField: string): string => {
    if (language === "en") {
      return baseField; // name, shortDescription, fullDescription
    }
    // For he → nameHe, shortDescriptionHe, etc.
    const suffix = language.charAt(0).toUpperCase() + language.slice(1);
    return `${baseField}${suffix}`;
  };

  const titleField = getFieldName("name");
  const shortDescField = getFieldName("shortDescription");
  const fullDescField = getFieldName("fullDescription");

  const isRtl = language === "he" || language === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("title")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData[titleField] || ""}          //  uses correct field
          onChange={(e) => onChange({ [titleField]: e.target.value })}
          placeholder={t("title_placeholder")}
          className={`w-full text-2xl font-bold ${bgSecondary} ${textPrimary} border ${borderColor} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow`}
          dir={dir}
        />
        <p className={`text-xs ${textTertiary} mt-1`}>
          {(formData[titleField] || "").length} {t("characters")}
        </p>
      </div>

      {/* Short Description */}
      <FormFieldWrapper
        label={t("short_description")}
        required
        error={
          (formData[shortDescField] || "").length > 150
            ? t("exceeds_char_limit", { limit: 150 })
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
          maxLength={150}
        />
        <p className={`text-xs ${textTertiary} mt-1`}>
          {t("char_count", {
            count: (formData[shortDescField] || "").length,
            limit: 150,
          })}
        </p>
      </FormFieldWrapper>

      {/* Full Description */}
      <FormFieldWrapper
        label={t("full_description")}
        required
        error={
          (formData[fullDescField] || "").length > 500
            ? t("exceeds_char_limit", { limit: 500 })
            : undefined
        }
      >
        <textarea
          value={formData[fullDescField] || ""}     
          onChange={(e) => onChange({ [fullDescField]: e.target.value })}
          placeholder={t("full_description_placeholder")}
          className={`w-full ${bgSecondary} ${textPrimary} border ${borderColor} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-shadow`}
          rows={3}
          dir={dir}
          maxLength={500}
        />
        <p className={`text-xs ${textTertiary} mt-1`}>
          {t("char_count", {
            count: (formData[fullDescField] || "").length,
            limit: 500,
          })}
        </p>
      </FormFieldWrapper>
    </div>
  );
};