import { useThemeClasses } from "@/hooks/useThemeClasses";
import { FormFieldWrapper } from "@/components/form-fields";
import { DmoAuthorityWebsiteSelector } from "@/components/shared";
import { useRef } from "react";

interface TripBasicInfoProps {
  isEdit: boolean;
  t: (key: string) => string;
  formData: {
    name: string | null;
    estimatedDuration: number | null;
    status: string;
  };
  errors: Record<string, string>;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  description: string;
  setDescription: (v: string) => void;
  shortDescription: string;
  setshortDescription: (v: string) => void;

  // errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  selectedDmoId: string;
  setSelectDmoId: React.Dispatch<React.SetStateAction<string>>;
  selectedAuthorityId: string;
  setSelectAuthorityId: React.Dispatch<React.SetStateAction<string>>;
  websiteVisibilityIds: string[];
  setWebsiteVisibilityIds: (v: any) => void;
  associatedWebsiteIds?: string[];
}

const TripBasicInfo = ({
  t,
  isEdit,
  formData,
  errors,
  handleInputChange,
  description,
  setDescription,
  shortDescription,
  setshortDescription,

  setErrors,
  setSelectDmoId,
  selectedDmoId,
  setSelectAuthorityId,
  selectedAuthorityId,
  websiteVisibilityIds,
  setWebsiteVisibilityIds,
  associatedWebsiteIds = [],
}: TripBasicInfoProps) => {
  const { borderColor, bgTertiary, textPrimary } = useThemeClasses();
  const dmoSectionRef = useRef<HTMLDivElement | null>(null);

  const inputClass = `w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-teal-500`;

  return (
    <div className="space-y-6">
      <DmoAuthorityWebsiteSelector
        errors={errors}
        setErrors={setErrors}
        isEdit={isEdit}
        keyId="externalApiId"
        selectedDmoId={selectedDmoId}
        setSelectDmoId={setSelectDmoId}
        selectedAuthorityId={selectedAuthorityId}
        setSelectAuthorityId={setSelectAuthorityId}
        dmoSectionRef={dmoSectionRef}
        websiteVisibilityIds={websiteVisibilityIds}
        setWebsiteVisibilityIds={setWebsiteVisibilityIds}
        itemAssociatedWebsites={associatedWebsiteIds}
      />

      <FormFieldWrapper label={t("trip_name")} required error={errors.name}>
        <input
          type="text"
          name="name"
          value={formData.name ?? ""}
          onChange={handleInputChange}
          placeholder={t("trip_name")}
          className={inputClass}
        />
      </FormFieldWrapper>

      <FormFieldWrapper
        label={t("short_description")}
        error={errors.shortDescription}
      >
        <textarea
          value={shortDescription}
          onChange={(e) => setshortDescription(e.target.value)}
          placeholder={t("short_description")}
          rows={2}
          className={inputClass}
        />
      </FormFieldWrapper>

      <FormFieldWrapper label={t("description")} error={errors.description}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("description")}
          rows={4}
          className={inputClass}
        />
      </FormFieldWrapper>

      <div className="grid grid-cols-2 gap-4">
        <FormFieldWrapper
          label={t("estimated_duration")}
          required
          error={errors.estimatedDuration}
        >
          <input
            type="number"
            name="estimatedDuration"
            min={0}
            value={formData.estimatedDuration ?? ""}
            onChange={handleInputChange}
            placeholder={t("estimated_duration")}
            className={inputClass}
          />
        </FormFieldWrapper>

        <FormFieldWrapper label={t("status")} required error={errors.status}>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className={inputClass}
          >
            <option value="DRAFT">{t("draft")}</option>
            <option value="PENDING">{t("pending")}</option>
            <option value="APPROVED">{t("approved")}</option>
            <option value="REJECTED">{t("rejected")}</option>
          </select>
        </FormFieldWrapper>
      </div>
    </div>
  );
};

export default TripBasicInfo;
