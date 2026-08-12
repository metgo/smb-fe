import { useEffect, useRef, type FC } from "react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { DmoAuthorityWebsiteIdsSelector } from "@/components/shared";

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
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  selectedDmoId: string;
  setSelectDmoId: React.Dispatch<React.SetStateAction<string>>;
  selectedAuthorityId: string;
  setSelectAuthorityId: React.Dispatch<React.SetStateAction<string>>;
  markDirty: (step: number) => void;
  websiteVisibilityIds: string[];
  setWebsiteVisibilityIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const PoiBasicInfo: FC<PoiBasicInfoProps> = ({
  t,
  formData,
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
  const { isDark } = useThemeClasses();

  const dmoSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    markDirty(1);
  }, [formData, selectedDmoId]);

  return (
    <div className="space-y-6 mb-4">
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
    </div>
  );
};

export default PoiBasicInfo;
