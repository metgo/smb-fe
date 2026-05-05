import { Globe } from "lucide-react";
import { useEffect, useRef, type FC } from "react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { FormFieldWrapper } from "@/components/form-fields";
import { DmoAuthorityWebsiteSelector } from "@/components/shared";
import { useUserRoles } from "@/hooks/useUserRoles";

interface PoiFormData {
  nameEn: string;
  nameHe: string;
  nameAr: string;
  shortDescriptionEn: string;
  shortDescriptionHe: string;
  shortDescriptionAr: string;
  fullDescriptionEn: string;
  fullDescriptionHe: string;
  fullDescriptionAr: string;
  internalNotes: string;
}

interface PoiBasicInfoProps {
  t: (key: string) => string;
  formData: PoiFormData;
  setFormData: (data: any) => void;
  errors: Record<string, string>;
  poiId: string;
  selectedDmoId: string;
  setSelectDmoId: React.Dispatch<React.SetStateAction<string>>;
  selectedAuthorityId: string;
  setSelectAuthorityId: React.Dispatch<React.SetStateAction<string>>;
  markDirty: (step: number) => void;
  websiteVisibilityIds: IWebsiteVisibilityIds;
  setWebsiteVisibilityIds: (v: any) => void;
  poiAssociatedWebsites?: IAssociatedWebsiteIds[];
  selectedFormLanguage: Language;
  setSelectedFormLanguage: (v: Language) => void;
}

const PoiBasicInfo: FC<PoiBasicInfoProps> = ({
  t,
  formData,
  setFormData,
  markDirty,
  errors,
  poiId,
  selectedDmoId,
  setSelectDmoId,
  selectedAuthorityId,
  setSelectAuthorityId,
  websiteVisibilityIds,
  setWebsiteVisibilityIds,
  poiAssociatedWebsites = [],
  selectedFormLanguage,
  setSelectedFormLanguage,
}) => {
  const { isSuperadmin } = useUserRoles();
  const { t: tc } = useTranslation("common");
  const { borderColor, isDark, bgTertiary, textPrimary } = useThemeClasses();

  const dmoSectionRef = useRef<HTMLDivElement | null>(null);

  const getFieldName = (base: string) => {
    if (selectedFormLanguage === "en") return `${base}En`;
    if (selectedFormLanguage === "he") return `${base}He`;
    return `${base}Ar`;
  };

  const getPlaceholder = (type: "name" | "short" | "full") => {
    if (selectedFormLanguage === "en") {
      if (type === "name") return t("poi_name");
      if (type === "short") return t("brief_description");
      return t("full_description");
    }
    if (selectedFormLanguage === "he") {
      if (type === "name") return "הזן שם נקודת עניין";
      if (type === "short") return "תיאור קצר";
      return "תיאור מלא";
    }
    if (type === "name") return "أدخل اسم نقطة الاهتمام";
    if (type === "short") return "وصف مختصر";
    return "وصف كامل";
  };

  useEffect(() => {
    markDirty(1);
  }, [formData, selectedDmoId]);

  const activeNameField = getFieldName("name") as keyof PoiFormData;
  const activeShortField = getFieldName(
    "shortDescription",
  ) as keyof PoiFormData;
  const activeFullField = getFieldName("fullDescription") as keyof PoiFormData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg ${isDark ? "text-gray-200" : "text-gray-800"}`}>
          {t("basic_information")}
        </h3>
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
        isEdit={!!poiId}
        keyId="externalApiId"
        selectedDmoId={selectedDmoId}
        setSelectDmoId={setSelectDmoId}
        selectedAuthorityId={selectedAuthorityId}
        setSelectAuthorityId={setSelectAuthorityId}
        dmoSectionRef={dmoSectionRef}
        websiteVisibilityIds={websiteVisibilityIds}
        setWebsiteVisibilityIds={setWebsiteVisibilityIds}
        itemAssociatedWebsites={poiAssociatedWebsites}
      />

      <div
        className="space-y-4"
        dir={selectedFormLanguage === "en" ? "ltr" : "rtl"}
      >
        <FormFieldWrapper
          required
          label={t("poi_name")}
          error={errors?.name}
          inputHintText={`${(formData[activeNameField] as string)?.length ?? 0}/50 ${tc("max_characters")}`}
        >
          <input
            type="text"
            maxLength={50}
            value={formData[activeNameField] as string}
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

        <FormFieldWrapper
          required
          label={t("short_description")}
          error={errors?.shortDescription}
          inputHintText={`${(formData[activeShortField] as string)?.length ?? 0}/50 ${tc("max_characters")}`}
        >
          <textarea
            rows={3}
            maxLength={50}
            value={formData[activeShortField] as string}
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

        <FormFieldWrapper
          required
          label={t("full_description")}
          error={errors?.fullDescription}
          inputHintText={`${(formData[activeFullField] as string)?.length ?? 0}/500 ${tc("max_characters")}`}
        >
          <textarea
            rows={6}
            maxLength={500}
            value={formData[activeFullField] as string}
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

export default PoiBasicInfo;
