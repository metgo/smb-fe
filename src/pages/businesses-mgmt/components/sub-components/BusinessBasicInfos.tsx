import { useEffect, useRef, type FC } from "react";

import { useUserRoles } from "@/hooks/useUserRoles";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { DmoAuthorityWebsiteIdsSelector } from "@/components/shared";
import { BusinessContentForm } from "./BusinesscontentForm";

interface BusinessFormData {
  authority: string;
  slug: string;
  internalNotes: string;

  name: string;
  nameHe: string;
  nameAr: string;

  shortDescription: string;
  shortDescriptionHe: string;
  shortDescriptionAr: string;

  fullDescription: string;
  fullDescriptionHe: string;
  fullDescriptionAr: string;
}

interface FormErrors {
  [key: string]: string;
}

interface BusinessBasicInfosProps {
  t: (key: string) => string;
  formData: BusinessFormData;
  setFormData: (
    data: BusinessFormData | ((prev: BusinessFormData) => BusinessFormData),
  ) => void;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  selectedDmoId: string;
  setSelectDmoId: React.Dispatch<React.SetStateAction<string>>;
  selectedAuthorityId: string;
  setSelectAuthorityId: React.Dispatch<React.SetStateAction<string>>;
  markDirty: (step: number) => void;
  websiteVisibilityIds: string[];
  setWebsiteVisibilityIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const BusinessBasicInfos: FC<BusinessBasicInfosProps> = ({
  t,
  formData,
  setFormData,
  markDirty,
  errors,
  setErrors,
  selectedDmoId,
  setSelectDmoId,
  selectedAuthorityId,
  setSelectAuthorityId,
  websiteVisibilityIds,
  setWebsiteVisibilityIds,
}) => {
  const { isSuperadmin } = useUserRoles();
  const { borderColor, isDark } = useThemeClasses();
  const handleChange = (updates: Partial<BusinessFormData>) => {
    setFormData((prev: any) => ({ ...prev, ...updates }));
  };

  const dmoSectionRef = useRef<HTMLDivElement | null>(null);

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
      </div>

      <DmoAuthorityWebsiteIdsSelector
        errors={errors}
        setErrors={setErrors}
        selectedDmoId={selectedDmoId}
        setSelectDmoId={setSelectDmoId}
        selectedAuthorityId={selectedAuthorityId}
        setSelectAuthorityId={setSelectAuthorityId}
        selectedWebsiteIds={websiteVisibilityIds}
        setSelectWebsiteIds={setWebsiteVisibilityIds}
        dmoSectionRef={dmoSectionRef}
      />

      <BusinessContentForm formData={formData} onChange={handleChange} />

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
