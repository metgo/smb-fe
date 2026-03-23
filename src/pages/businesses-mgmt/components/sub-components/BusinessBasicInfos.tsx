import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState, type FC } from "react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { FormFieldWrapper } from "@/components/form-fields";
import { DmoAuthorityWebsiteSelector } from "@/components/shared";
import { useUserRoles } from "@/hooks/useUserRoles";

interface BusinessFormData {
  authority: string;
  slug: string;
  internalNotes: string;

  nameEn: string;
  nameHe: string;
  nameAr: string;

  shortDescriptionEn: string;
  shortDescriptionHe: string;
  shortDescriptionAr: string;

  fullDescriptionEn: string;
  fullDescriptionHe: string;
  fullDescriptionAr: string;
}

interface FormErrors {
  [key: string]: string;
}

interface BusinessBasicInfosProps {
  t: (key: string) => string;
  formData: BusinessFormData;
  setFormData: (data: BusinessFormData) => void;
  errors: FormErrors;
  selectedDmoId: string;
  setSelectDmoId: React.Dispatch<React.SetStateAction<string>>;
  businessId: string;
  selectedAuthorityId: string;
  setSelectAuthorityId: React.Dispatch<React.SetStateAction<string>>;
  markDirty: (step: number) => void;
  websiteVisibilityIds: IWebsiteVisibilityIds;
  setWebsiteVisibilityIds: (v: any) => void;
  businessAssociatedWebsites?: IAssociatedWebsiteIds[];
  selectedFormLanguage: Language;
  setSelectedFormLanguage: (v: Language) => void;
}

const BusinessBasicInfos: FC<BusinessBasicInfosProps> = ({
  t,
  formData,
  setFormData,
  markDirty,
  errors,
  selectedDmoId,
  setSelectDmoId,
  selectedAuthorityId,
  setSelectAuthorityId,
  businessId,
  websiteVisibilityIds,
  setWebsiteVisibilityIds,
  businessAssociatedWebsites = [],
  selectedFormLanguage,
  setSelectedFormLanguage,
}) => {
  const { isSuperadmin } = useUserRoles();
  const { t: tc } = useTranslation("common");
  const { borderColor, isDark, bgTertiary, textPrimary } = useThemeClasses();

  const dmoSectionRef = useRef<HTMLDivElement | null>(null);

  /* -------- Helpers -------- */

  const getFieldName = (base: string) => {
    if (selectedFormLanguage === "en") return `${base}En`;
    if (selectedFormLanguage === "he") return `${base}He`;
    return `${base}Ar`;
  };

  const getPlaceholder = (type: "name" | "short" | "full") => {
    if (selectedFormLanguage === "en") {
      if (type === "name") return t("business_name");
      if (type === "short") return t("brief_description");
      return t("full_description");
    }

    if (selectedFormLanguage === "he") {
      if (type === "name") return "הזן שם העסק";
      if (type === "short") return "תיאור קצר";
      return "תיאור מלא";
    }

    if (type === "name") return "أدخل اسم العمل";
    if (type === "short") return "وصف مختصر";
    return "وصف كامل";
  };

  useEffect(() => {
    markDirty(1);
  }, [formData, selectedDmoId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg ${isDark ? "text-gray-200" : "text-gray-800"}`}>
          {t("basic_information")}
        </h3>

        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <Globe
            className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          />
          <select
            value={selectedFormLanguage}
            onChange={(e) =>
              setSelectedFormLanguage(e.target.value as Language)
            }
            className={`px-3 py-1.5 rounded-lg border ${
              isDark
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white border-gray-300 text-gray-900"
            } text-sm focus:outline-none focus:ring-2 focus:ring-teal-500`}
          >
            <option value="he">עברית</option>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </div>

      <DmoAuthorityWebsiteSelector
        errors={errors}
        isEdit={!!businessId}
        keyId="externalApiId"
        selectedDmoId={selectedDmoId}
        setSelectDmoId={setSelectDmoId}
        selectedAuthorityId={selectedAuthorityId}
        setSelectAuthorityId={setSelectAuthorityId}
        dmoSectionRef={dmoSectionRef}
        websiteVisibilityIds={websiteVisibilityIds}
        setWebsiteVisibilityIds={setWebsiteVisibilityIds}
        itemAssociatedWebsites={businessAssociatedWebsites}
      />
      <div
        className="space-y-4"
        dir={selectedFormLanguage === "en" ? "ltr" : "rtl"}
      >
        {/* Business Name */}
        <div>
          <FormFieldWrapper
            required
            label={t("business_name")}
            error={errors?.name}
            inputHintText={`${formData.nameEn?.length ?? 0}/50 ${tc("max_characters")}`}
          >
            <input
              type="text"
              maxLength={50}
              value={formData[getFieldName("name") as keyof BusinessFormData]}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [getFieldName("name")]: e.target.value,
                })
              }
              placeholder={getPlaceholder("name")}
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
            />
          </FormFieldWrapper>
        </div>

        {/* Short Description */}
        <div>
          <FormFieldWrapper
            required
            label={t("short_description")}
            error={errors?.shortDescription}
            inputHintText={`${formData?.shortDescriptionEn?.length ?? 0}/50 ${tc("max_characters")}`}
          >
            <textarea
              rows={3}
              maxLength={50}
              value={
                formData[
                  getFieldName("shortDescription") as keyof BusinessFormData
                ]
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [getFieldName("shortDescription")]: e.target.value,
                })
              }
              placeholder={getPlaceholder("short")}
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
            />
          </FormFieldWrapper>
        </div>

        {/* Full Description */}
        <div>
          <FormFieldWrapper
            required
            label={t("full_description")}
            error={errors?.fullDescription}
            inputHintText={`${formData.fullDescriptionEn?.length ?? 0}/500 ${tc("max_characters")}`}
          >
            <textarea
              rows={6}
              maxLength={500}
              value={
                formData[
                  getFieldName("fullDescription") as keyof BusinessFormData
                ]
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [getFieldName("fullDescription")]: e.target.value,
                })
              }
              placeholder={getPlaceholder("full")}
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary}`}
            />
          </FormFieldWrapper>
        </div>
      </div>

      {/* Internal Notes */}
      {isSuperadmin && (
        <div>
          <label
            className={`block text-sm mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {t("internal_notes")}
            <span className="text-xs ml-2 text-gray-500">
              ({t("visible_only_to_admins")})
            </span>
          </label>
          <textarea
            rows={3}
            value={formData.internalNotes}
            onChange={(e) =>
              setFormData({ ...formData, internalNotes: e.target.value })
            }
            placeholder={t("add_internal_notes")}
            className={`w-full px-4 py-4 rounded-lg border ${borderColor} focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              isDark
                ? "bg-gray-800 text-gray-200 placeholder-gray-500"
                : "bg-white text-gray-900 placeholder-gray-400"
            }`}
          />
        </div>
      )}
    </div>
  );
};

export default BusinessBasicInfos;
