import { Globe } from "lucide-react";
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
  selectedFormLanguage: Language;
  setSelectedFormLanguage: (v: Language) => void;
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
  selectedFormLanguage,
  setSelectedFormLanguage,
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
    </div>
  );
};

export default PoiBasicInfo;
