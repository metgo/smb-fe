import { useThemeClasses } from "@/hooks/useThemeClasses";
import { FormFieldWrapper } from "@/components/form-fields";
import { DmoAuthorityWebsiteIdsSelector } from "@/components/shared";
import { useRef } from "react";

interface TripBasicInfoProps {
  isEdit: boolean;
  t: (key: string) => string;
  formData: {
    name: string | null;
    estimatedDuration: number | null;
    status: string;
    totalDistanceCovered: number | null;
    contactName: string;
    contactPhoneNumber: string;
    contactEmail: string;
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
}

const TripBasicInfo = ({
  t,
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
}: TripBasicInfoProps) => {
  const { borderColor, bgTertiary, textPrimary } = useThemeClasses();
  const dmoSectionRef = useRef<HTMLDivElement | null>(null);

  const inputClass = `w-full px-4 py-3 rounded-lg border ${borderColor} ${bgTertiary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-teal-500`;

  return (
    <div className="space-y-4">
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
        isAuthorityRequired={false}
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
        required
        error={errors.shortDescription}
      >
        <textarea
          value={shortDescription}
          onChange={(e) => setshortDescription(e.target.value.slice(0, 150))}
          placeholder={t("short_description")}
          rows={2}
          maxLength={150}
          className={inputClass}
        />
        <p className={`text-xs mt-1 text-right ${textPrimary}`}>
          {shortDescription.length}/150
        </p>
      </FormFieldWrapper>

      <FormFieldWrapper label={t("description")} error={errors.description}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 500))}
          placeholder={t("description")}
          rows={4}
          maxLength={500}
          className={inputClass}
        />
        <p className={`text-xs mt-1 text-right ${textPrimary}`}>
          {description.length}/500
        </p>
      </FormFieldWrapper>

      <FormFieldWrapper
        label={t("estimated_duration")}
        hint={t("hours")}
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

      <div className="grid grid-cols-3 gap-4">
        <FormFieldWrapper label={t("contact_name")} error={errors.contactName}>
          <input
            type="text"
            name="contactName"
            value={formData.contactName}
            onChange={handleInputChange}
            placeholder={t("contact_name")}
            className={inputClass}
          />
        </FormFieldWrapper>

        <FormFieldWrapper
          label={t("contact_phone_number")}
          error={errors.contactPhoneNumber}
        >
          <input
            type="text"
            name="contactPhoneNumber"
            value={formData.contactPhoneNumber}
            onChange={handleInputChange}
            placeholder={t("contact_phone_number")}
            className={inputClass}
          />
        </FormFieldWrapper>

        <FormFieldWrapper
          label={t("contact_email")}
          error={errors.contactEmail}
        >
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleInputChange}
            placeholder={t("contact_email")}
            className={inputClass}
          />
        </FormFieldWrapper>
      </div>
    </div>
  );
};

export default TripBasicInfo;
