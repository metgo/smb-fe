import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useCommon } from "@/hooks/useCommon";
import FormFieldWrapper from "@/components/form-fields/FormFieldWrapper";
import { useInitBusinessCreateMutation } from "@/store/api/businessMutationApi";
import { Check, ExternalLink, Info, Mail, Phone } from "lucide-react";
import { ModalWrapper } from "@/components/wrapper";
import RichTextEditor, {
  getPlainText,
} from "@/components/shared/RichTextEditor";

interface ArticleContentFormProps {
  formData: Record<string, any>;
  onChange: (updates: Record<string, any>) => void;
  onBusinessCreated?: (businessId: string) => void;
  dmoId?: string;
  authorityId?: string;
  isBusinessContext?: boolean;
  isEditMode?: boolean;
  onAvailabilityStatusChange?: (
    status: "available" | "unavailable" | null,
  ) => void;
}

export const BusinessContentForm = ({
  formData,
  onChange,
  // onBusinessCreated,
  dmoId,
  authorityId,
  isBusinessContext = false,
  isEditMode = false,
  onAvailabilityStatusChange,
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

  const titleField = "name";
  const shortDescField = "shortDescription";
  const fullDescField = "fullDescription";

  // Reset availability status when name changes
  const handleNameChange = (value: string) => {
    onChange({ [titleField]: value });
    setAvailabilityStatus(null);
    onAvailabilityStatusChange?.(null);
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
          onAvailabilityStatusChange?.("available");
        } else {
          setAvailabilityStatus("unavailable");
          setCheckResponse({
            associatedWebsiteIds: res?.associatedWebsiteIds || [],
            slug: res?.slug || "",
          });
          onAvailabilityStatusChange?.("unavailable");
        }
      } catch (error: any) {
        console.log("Check availability error:", error);
        setAvailabilityStatus("unavailable");
        setCheckResponse(null);
        onAvailabilityStatusChange?.("unavailable");
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
    onAvailabilityStatusChange?.(null);
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
        onAvailabilityStatusChange?.("available");
      } else {
        setAvailabilityStatus("unavailable");
        setCheckResponse({
          associatedWebsiteIds: res?.associatedWebsiteIds || [],
          slug: res?.slug || "",
        });
        onAvailabilityStatusChange?.("unavailable");
      }
    } catch (error: any) {
      console.log("Check availability error:", error);
      setAvailabilityStatus("unavailable");
      setCheckResponse(null);
      onAvailabilityStatusChange?.("unavailable");
    }
  };

  const isRtl = language === "he" || language === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  // Calculate modal height based on number of websites

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
          getPlainText(formData[fullDescField] || "").length > 500
            ? t("exceeds_char_limit", { limit: 500 })
            : undefined
        }
      >
        <RichTextEditor
          value={formData[fullDescField] || ""}
          onChange={(html) => onChange({ [fullDescField]: html })}
          placeholder={t("full_description_placeholder")}
          maxLength={500}
        />
      </FormFieldWrapper>

      {availabilityStatus === "unavailable" && (
        <ModalWrapper
          onClose={() => setAvailabilityStatus(null)}
          height="h-[75vh] md:h-[55vh]"
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
                <div className="w-full mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {checkResponse?.associatedWebsiteIds?.map((websiteId) => {
                      const website = allWebsites?.find(
                        (w) => w._id === websiteId,
                      );
                      if (!website) return null;
                      const businessUrl = `${website.websiteUrl}/business-details/${checkResponse.slug}`;
                      return (
                        <a
                          key={websiteId}
                          href={businessUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center gap-2 p-2 rounded-lg transition-all duration-200 hover:shadow-md ${
                            isDark
                              ? "bg-green-900/40 hover:bg-green-900/50 text-green-100"
                              : "bg-green-100 hover:bg-green-200 text-green-900"
                          }`}
                        >
                          <ExternalLink
                            className={`w-4 h-4 shrink-0 ${isDark ? "text-green-400" : "text-green-600"}`}
                          />
                          {website.logo && (
                            <img
                              src={website.logo}
                              alt={website.name}
                              className="w-6 h-6 object-contain shrink-0"
                            />
                          )}
                          <div className="text-sm font-medium text-center line-clamp-1">
                            {website.name}
                          </div>
                        </a>
                      );
                    })}
                  </div>
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
