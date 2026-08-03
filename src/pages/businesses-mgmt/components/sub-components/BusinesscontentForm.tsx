import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useCommon } from "@/hooks/useCommon";
import FormFieldWrapper from "@/components/form-fields/FormFieldWrapper";
import { useInitBusinessCreateMutation } from "@/store/api/businessMutationApi";
import { Check, ExternalLink, Info, Mail, Phone } from "lucide-react";
import { ModalWrapper } from "@/components/wrapper";

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
  // onBusinessCreated,
  dmoId,
  authorityId,
  isBusinessContext = false,
  isEditMode = false,
}: ArticleContentFormProps) => {
  const { t } = useTranslation("common");
  const { isDark } = useThemeClasses();
  const {
    bgSecondary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    language,
  } = useThemeClasses();

  const { allWebsites } = useCommon();
  const [checkAvailability] = useInitBusinessCreateMutation();
  const [availabilityStatus, setAvailabilityStatus] = useState<
    "available" | "unavailable" | null
  >(null);
  const [checkResponse, setCheckResponse] = useState<{
    associatedWebsiteIds: string[];
    slug: string;
  } | null>(null);
  console.log("🚀 ~ BusinessContentForm ~ checkResponse:", checkResponse);

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

  // Auto-trigger availability check when all three fields become available
  useEffect(() => {
    if (!isBusinessContext || isEditMode) return;

    const businessName = formData[titleField];
    const hasAllRequiredFields =
      businessName?.trim() && dmoId?.trim() && authorityId?.trim();

    if (!hasAllRequiredFields) {
      return;
    }

    const checkAvailabilityAsync = async () => {
      try {
        const res = await checkAvailability({
          name: businessName,
          dmoId,
          authorityId,
          checkOnly: true,
        }).unwrap();
        if (res?.isAvailable) {
          setAvailabilityStatus("available");
          setCheckResponse(null);
        } else {
          setAvailabilityStatus("unavailable");
          setCheckResponse({
            associatedWebsiteIds: res?.associatedWebsiteIds || [],
            slug: res?.slug || "",
          });
        }
      } catch (error: any) {
        console.log("Check availability error:", error);
        setAvailabilityStatus("unavailable");
        setCheckResponse(null);
      }
    };

    checkAvailabilityAsync();
  }, [dmoId, authorityId, isBusinessContext, isEditMode, checkAvailability]);

  // Check availability on blur (when user leaves the field)
  const handleNameBlur = async () => {
    if (!isBusinessContext || isEditMode) return;

    const businessName = formData[titleField];

    // Only fire API when all three fields are available
    if (!businessName?.trim() || !dmoId?.trim() || !authorityId?.trim()) {
      setAvailabilityStatus(null);
      return;
    }

    setAvailabilityStatus(null);
    try {
      const res = await checkAvailability({
        name: businessName,
        dmoId,
        authorityId,
        checkOnly: true,
      }).unwrap();
      if (res?.isAvailable) {
        setAvailabilityStatus("available");
        setCheckResponse(null);
      } else {
        setAvailabilityStatus("unavailable");
        setCheckResponse({
          associatedWebsiteIds: res?.associatedWebsiteIds || [],
          slug: res?.slug || "",
        });
      }
    } catch (error: any) {
      console.log("Check availability error:", error);
      setAvailabilityStatus("unavailable");
      setCheckResponse(null);
    }
  };

  const isRtl = language === "he" || language === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  // Calculate modal height based on number of websites
  const getModalHeight = () => {
    const websiteCount = checkResponse?.associatedWebsiteIds?.length || 0;
    if (websiteCount === 1) return "h-[45vh]";
    if (websiteCount <= 3) return "h-[55vh]";
    return "h-[70vh]";
  };

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
              availabilityStatus === "available"
                ? "border-green-500"
                : availabilityStatus === "unavailable"
                  ? "border-red-500"
                  : borderColor
            } rounded-xl px-4 py-3 pr-12 focus:outline-none transition-colors ${
              isBusinessContext && isEditMode
                ? "opacity-60 cursor-not-allowed"
                : ""
            }`}
            dir={dir}
          />
        </div>
        {isBusinessContext && !isEditMode && availabilityStatus && (
          <p
            className={`text-sm mt-2 flex items-center gap-1.5 ${
              availabilityStatus === "available"
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {availabilityStatus === "available" ? (
              <Check className="w-4 h-4" />
            ) : (
              <Info className="w-4 h-4" />
            )}
            {availabilityStatus === "available"
              ? t("business_name_available")
              : t("business_name_unavailable")}
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

      {availabilityStatus === "unavailable" && (
        <ModalWrapper
          onClose={() => setAvailabilityStatus(null)}
          height={getModalHeight()}
          maxWidth="max-w-lg"
        >
          <div className="flex flex-col items-center text-center px-6 py-4 h-full justify-center">
            {/* Icon */}
            <div
              className={`flex items-center justify-center w-14 h-14 rounded-full mb-4 ${
                isDark ? "bg-amber-500/20" : "bg-amber-50"
              }`}
            >
              <Info className="w-7 h-7 text-amber-500" />
            </div>

            {/* Heading */}
            <h3 className={`text-lg font-semibold ${textSecondary} mb-2`}>
              {t(
                "business_already_exists_title",
                "We've already built this business for you",
              )}
            </h3>

            {/* Body */}
            <p className={`text-sm ${textSecondary} max-w-sm mb-5`}>
              {t(
                "business_already_exists_body",
                "Please contact our support team below, or take a look at the business we've already set up.",
              )}
            </p>

            {/* Website links */}
            {checkResponse?.associatedWebsiteIds &&
              checkResponse?.associatedWebsiteIds?.length > 0 && (
                <div className="w-full mb-4 space-y-2">
                  {checkResponse?.associatedWebsiteIds?.map((websiteId) => {
                    const website = allWebsites?.find(
                      (w) => w._id === websiteId,
                    );
                    if (!website) return null;
                    const businessUrl = `${website.websiteUrl}/business-details/${checkResponse.slug}`;
                    const domain = new URL(businessUrl).hostname;
                    return (
                      <a
                        key={websiteId}
                        href={businessUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg   text-gray-700 text-sm font-medium transition-all duration-200 hover:shadow-md hover:shadow-green-600/30 w-full"
                      >
                        {website.logo && (
                          <img
                            src={website.logo}
                            alt={website.name}
                            className="w-6 h-6 object-contain shrink-0"
                          />
                        )}
                        <ExternalLink className="w-4 h-4 shrink-0" />
                        <div className="flex-1 text-left">
                          <div className="text-xs opacity-90">
                            {website.name}
                          </div>
                          <div className="text-sm">{domain}</div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}

            {/* Contact support */}
            <div className={`w-full max-w-xs pt-4 border-t ${borderColor}`}>
              <p className={`text-xs ${textTertiary} mb-2`}>
                {t("contact_support_label", "Or contact our support team")}
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href={`mailto:${t("support_email")}`}
                  className="flex items-center justify-center gap-1.5 text-sm text-green-500 hover:underline"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {t("support_email")}
                </a>
                <a
                  href={`tel:${t("support_phone").replace(/\s/g, "")}`}
                  className="flex items-center justify-center gap-1.5 text-sm text-green-500 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {t("support_phone")}
                </a>
              </div>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};
