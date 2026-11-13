import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import FormFieldWrapper from "@/components/form-fields/FormFieldWrapper";

interface ArticleContentFormProps {
  formData: Record<string, any>;
  onChange: (updates: Record<string, any>) => void;
}

export default function ProductContentForm({
  formData,
  onChange,
}: ArticleContentFormProps) {
  const { t } = useTranslation("article");
  const { t: tc } = useTranslation("common");
  const { bgSecondary, textPrimary, textSecondary, textTertiary, borderColor } =
    useThemeClasses();

  const titleField = "name";
  const shortDescField = "shortDescription";
  const descField = "fullDescription";

  const dir = "ltr";

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
          maxLength={150}
        />
        <p className={`text-xs ${textTertiary} mt-1`}>
          {tc("char_count", {
            count: (formData[shortDescField] || "").length,
            limit: 150,
          })}
        </p>
      </FormFieldWrapper>

      <FormFieldWrapper
        label={t("full_description")}
        required
        error={
          (formData[descField] || "").length > 500
            ? tc("exceeds_char_limit", { limit: 500 })
            : undefined
        }
      >
        <textarea
          value={formData[descField] || ""}
          onChange={(e) => onChange({ [descField]: e.target.value })}
          placeholder={t("full_description_placeholder")}
          className={`w-full ${bgSecondary} ${textPrimary} border ${borderColor} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-shadow`}
          rows={3}
          dir={dir}
          maxLength={500}
        />
        <p className={`text-xs ${textTertiary} mt-1`}>
          {tc("char_count", {
            count: (formData[descField] || "").length,
            limit: 500,
          })}
        </p>
      </FormFieldWrapper>
    </div>
  );
}
