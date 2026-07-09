import { useEffect, useRef, type FC } from "react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { DmoAuthorityWebsiteSelector } from "@/components/shared";

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
}

const PoiBasicInfo: FC<PoiBasicInfoProps> = ({
  t,
  formData,
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
}) => {
  const { isDark } = useThemeClasses();

  const dmoSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    markDirty(1);
  }, [formData, selectedDmoId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg ${isDark ? "text-gray-200" : "text-gray-800"}`}>
          {t("basic_information")}
        </h3>
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
    </div>
  );
};

export default PoiBasicInfo;
