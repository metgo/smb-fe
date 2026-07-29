import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import FormFieldWrapper from "@/components/form-fields/FormFieldWrapper";
import { useInitBusinessCreateMutation } from "@/store/api/businessMutationApi";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ArticleContentFormProps {
  formData: Record<string, any>;
  onChange: (updates: Record<string, any>) => void;
}

export const BusinessContentForm = ({
  formData,
  onChange,
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

  const [checkAvailability, { isLoading: isChecking }] = useInitBusinessCreateMutation();
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'unavailable' | null>(null);

  const handleCheckAvailability = async () => {
    const businessName = formData[titleField];
    if (!businessName?.trim()) {
      toast.error(t("please_enter_business_name"));
      return;
    }

    setAvailabilityStatus(null);
    try {
      await checkAvailability({ name: businessName }).unwrap();
      setAvailabilityStatus('available');
      toast.success(t("business_name_available"));
    } catch (error: any) {
      setAvailabilityStatus('unavailable');
     
    }
  };

  // Reset availability status when name changes
  const handleNameChange = (value: string) => {
    onChange({ [titleField]: value });
    setAvailabilityStatus(null);
  };

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
        <div className="relative">
          <input
            type="text"
            value={formData[titleField] || ""}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder={t("title_placeholder")}
            className={`w-full text-2xl font-bold ${bgSecondary} ${textPrimary} border-2 ${
              availabilityStatus === 'available'
                ? 'border-green-500'
                : availabilityStatus === 'unavailable'
                ? 'border-red-500'
                : borderColor
            } rounded-xl px-4 py-3 pr-12 focus:outline-none transition-colors`}
            dir={dir}
          />
         
        </div>
        <div className="flex items-center justify-between mt-2">
          {availabilityStatus && (
            <p className={`text-sm flex items-center gap-1.5 ${
              availabilityStatus === 'available' ? 'text-green-500' : 'text-red-500'
            }`}>
              {availabilityStatus === 'available' ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
              {availabilityStatus === 'available' ? t("business_name_available") : t("business_name_unavailable")}
            </p>
          )}
          <button
            type="button"
            onClick={handleCheckAvailability}
            disabled={isChecking || !formData[titleField]?.trim()}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              isChecking || !formData[titleField]?.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isChecking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {t("check_availability")}
          </button>
        </div>
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
