import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import FormFieldWrapper from "@/components/form-fields/FormFieldWrapper";
import { useInitBusinessCreateMutation } from "@/store/api/businessMutationApi";
import { Check, Info} from "lucide-react";

interface ArticleContentFormProps {
  formData: Record<string, any>;
  onChange: (updates: Record<string, any>) => void;
  onBusinessCreated?: (businessId: string) => void;
  dmoId?: string;
  authorityId?: string;
  isBusinessContext?: boolean;
  isEditMode?: boolean;
}

export const BusinessContentForm = ({
  formData,
  onChange,
  onBusinessCreated,
  dmoId,
  authorityId,
  isBusinessContext = false,
  isEditMode = false,
}: ArticleContentFormProps) => {
  const { t } = useTranslation("common");
  const {
    bgSecondary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    language,
  } = useThemeClasses();

  const [checkAvailability] = useInitBusinessCreateMutation();
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'unavailable' | null>(null);

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

  // Reset availability status when name changes
  const handleNameChange = (value: string) => {
    onChange({ [titleField]: value });
    setAvailabilityStatus(null);
  };

  // Check availability on blur (when user leaves the field)
  const handleNameBlur = async () => {
    if (!isBusinessContext || isEditMode) return;

    const businessName = formData[titleField];
    if (!businessName?.trim()) {
      setAvailabilityStatus(null);
      return;
    }
    if (!dmoId?.trim() || !authorityId?.trim()) {
      setAvailabilityStatus(null);
      return;
    }

    setAvailabilityStatus(null);
    try {
      const res = await checkAvailability({ name: businessName, dmoId, authorityId }).unwrap();
      setAvailabilityStatus('available');
      // Notify parent that business was created during availability check
      if (res?.id && onBusinessCreated) {
        onBusinessCreated(res.id);
      }
    } catch (error: any) {
      setAvailabilityStatus('unavailable');
    }
  };

  const isRtl = language === "he" || language === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("title")} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData[titleField] || ""}
            onChange={(e) => handleNameChange(e.target.value)}
            onBlur={handleNameBlur}
            placeholder={t("title_placeholder")}
            disabled={isBusinessContext && isEditMode}
            className={`w-full text-2xl font-bold ${bgSecondary} ${textPrimary} border-2 ${
              availabilityStatus === 'available'
                ? 'border-green-500'
                : availabilityStatus === 'unavailable'
                ? 'border-red-500'
                : borderColor
            } rounded-xl px-4 py-3 pr-12 focus:outline-none transition-colors ${
              isBusinessContext && isEditMode ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            dir={dir}
          />
        </div>
        {isBusinessContext && !isEditMode && availabilityStatus && (
          <p className={`text-sm mt-2 flex items-center gap-1.5 ${
            availabilityStatus === 'available' ? 'text-green-500' : 'text-red-500'
          }`}>
            {availabilityStatus === 'available' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Info className="w-4 h-4" />
            )}
            {availabilityStatus === 'available' ? t("business_name_available") : t("business_name_unavailable")}
          </p>
        )}
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
