import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  DmoAuthorityWebsiteSelector,
  SelectableChips,
} from "@/components/shared";
import { useGetSubCategoriesQuery } from "@/store/api/masterDataApi";
import {
  FormFieldWrapper,
  InputField,
  RadioGroupField,
  TextareaField,
} from "@/components/form-fields";
import { categoryIds } from "@/lib/utils";
import { useAppSelector } from "@/hooks/hooks";
import { UserRole } from "@/enums/user.types";
import { useCommon } from "@/hooks/useCommon";

interface EventBasicInformationProps {
  eventId: string;
  markDirty: (step: number) => void;
  selectedDmoId: string;
  setSelectDmoId: React.Dispatch<React.SetStateAction<string>>;
  selectedAuthorityId: string;
  setSelectAuthorityId: React.Dispatch<React.SetStateAction<string>>;
  eventName: string;
  setEventName: React.Dispatch<React.SetStateAction<string>>;
  shortDescription: string;
  setShortDescription: React.Dispatch<React.SetStateAction<string>>;
  fullDescription: string;
  setFullDescription: React.Dispatch<React.SetStateAction<string>>;
  eventStatus: "draft" | "pending" | "approved";
  setEventStatus: React.Dispatch<
    React.SetStateAction<"draft" | "pending" | "approved">
  >;
  internalNotes: string;
  setInternalNotes: React.Dispatch<React.SetStateAction<string>>;
  selectedSubCategoriesId: string[];
  setSubCategoriesId: (v: string[]) => void;
  selectedGroupTypesId: string[];
  setGroupTypesId: (v: string[]) => void;
  selectedAccessiblitiesId: string[];
  setAccessiblitiesId: (v: string[]) => void;
  errors: Record<string, string>;

  websiteVisibilityIds: IWebsiteVisibilityIds;
  setWebsiteVisibilityIds: (v: any) => void;
  eventAssociatedWebsites?: IAssociatedWebsiteIds[];
}

const EventBasicInformation: React.FC<EventBasicInformationProps> = ({
  eventId,
  markDirty,
  selectedDmoId,
  setSelectDmoId,
  selectedAuthorityId,
  setSelectAuthorityId,
  eventName,
  setEventName,
  shortDescription,
  setShortDescription,
  fullDescription,
  setFullDescription,
  eventStatus,
  setEventStatus,
  internalNotes,
  setInternalNotes,
  selectedSubCategoriesId,
  setSubCategoriesId,
  selectedGroupTypesId,
  setGroupTypesId,
  selectedAccessiblitiesId,
  setAccessiblitiesId,
  errors,
  websiteVisibilityIds,
  setWebsiteVisibilityIds,
  eventAssociatedWebsites = [],
}) => {
  const { t, i18n } = useTranslation("events");
  const { userRole } = useAppSelector((state) => state.auth);
  const { textSecondary, inputClasses } = useThemeClasses();
  const locale = i18n.language as Language;

  const { data: subCategories } = useGetSubCategoriesQuery({
    bussCategoryId: categoryIds.event,
    locale,
  });
  console.log("🚀 ~ EventBasicInformation ~ subCategories:", subCategories);
  const { groupTypes, accessibility } = useCommon();

  // Individual refs for scroll targets
  const dmoSectionRef = useRef<HTMLDivElement | null>(null);
  const authoritySectionRef = useRef<HTMLDivElement | null>(null);
  const nameSectionRef = useRef<HTMLDivElement | null>(null);
  const shortDescSectionRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to first error field
  useEffect(() => {
    if (Object.keys(errors).length === 0) return;

    const firstErrorKey = Object.keys(errors)[0];

    let targetRef: React.RefObject<HTMLDivElement | null> | null = null;

    switch (firstErrorKey) {
      case "dmoId":
        targetRef = dmoSectionRef;
        break;
      case "authorityId":
        targetRef = authoritySectionRef;
        break;
      case "eventName":
        targetRef = nameSectionRef;
        break;
      case "shortDescription":
        targetRef = shortDescSectionRef;
        break;
      default:
        break;
    }

    if (targetRef?.current) {
      targetRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // Try to focus the first focusable element inside
      const focusable = targetRef.current.querySelector(
        "input, select, textarea, button",
      ) as HTMLElement | null;
      focusable?.focus?.();
    }
  }, [errors]);

  useEffect(() => {
    markDirty(1);
  }, [
    eventName,
    shortDescription,
    fullDescription,
    selectedAuthorityId,
    selectedDmoId,
    selectedAccessiblitiesId,
    selectedGroupTypesId,
    selectedSubCategoriesId,
    internalNotes,
    markDirty,
  ]);

  const handleSubcategorySelect = (itemId: string) => {
    setSubCategoriesId(
      selectedSubCategoriesId.includes(itemId)
        ? selectedSubCategoriesId.filter((id) => id !== itemId)
        : [...selectedSubCategoriesId, itemId],
    );
  };

  const handleGroupTypeSelect = (itemId: string) => {
    setGroupTypesId(
      selectedGroupTypesId.includes(itemId)
        ? selectedGroupTypesId.filter((id) => id !== itemId)
        : [...selectedGroupTypesId, itemId],
    );
  };

  const handleAccessibilitySelect = (itemId: string) => {
    setAccessiblitiesId(
      selectedAccessiblitiesId.includes(itemId)
        ? selectedAccessiblitiesId.filter((id) => id !== itemId)
        : [...selectedAccessiblitiesId, itemId],
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <DmoAuthorityWebsiteSelector
        errors={errors}
        isEdit={!!eventId}
        selectedDmoId={selectedDmoId}
        setSelectDmoId={setSelectDmoId}
        selectedAuthorityId={selectedAuthorityId}
        setSelectAuthorityId={setSelectAuthorityId}
        dmoSectionRef={dmoSectionRef}
        websiteVisibilityIds={websiteVisibilityIds}
        setWebsiteVisibilityIds={setWebsiteVisibilityIds}
        itemAssociatedWebsites={eventAssociatedWebsites}
      />

      {/* Event Name */}
      <div ref={nameSectionRef}>
        <FormFieldWrapper
          required
          label={t("event_name")}
          error={errors.eventName}
          inputHintText={`${eventName?.length ?? 0}/50 ${t("max_characters")}`}
        >
          <InputField
            value={eventName}
            onChange={setEventName}
            maxLength={50}
            placeholder={t("enter_event_name")}
            inputClasses={`${inputClasses} text-lg`}
          />
        </FormFieldWrapper>
      </div>

      {/* Short Description */}
      <div ref={shortDescSectionRef}>
        <FormFieldWrapper
          required
          label={t("short_description")}
          error={errors.shortDescription}
          inputHintText={`${shortDescription?.length ?? 0}/50 ${t("max_characters")}`}
        >
          <InputField
            maxLength={50}
            value={shortDescription}
            onChange={setShortDescription}
            placeholder={t("brief_description")}
            inputClasses={inputClasses}
          />
        </FormFieldWrapper>
      </div>

      {/* Full Description */}
      <FormFieldWrapper
        label={t("full_description")}
        inputHintText={`${fullDescription?.length ?? 0}/500 ${t("max_characters")}`}
      >
        <TextareaField
          rows={8}
          value={fullDescription}
          onChange={setFullDescription}
          placeholder={t("full_event_description")}
          maxLength={500}
          inputClasses={`${inputClasses} text-base`}
        />
      </FormFieldWrapper>

      {/* Event Status */}
      <FormFieldWrapper label={t("event_status")}>
        <RadioGroupField
          value={eventStatus}
          options={["draft", "pending", "approved"]}
          onChange={setEventStatus}
          labelMapper={(v) => t(v)}
          textSecondary={textSecondary}
        />
      </FormFieldWrapper>

      {/* Chips */}
      <SelectableChips
        label="Sub Categories"
        items={subCategories?.datas?.data ?? []}
        selectedIds={selectedSubCategoriesId}
        onSelect={handleSubcategorySelect}
      />

      <SelectableChips
        label="Accessiblities"
        items={accessibility ?? []}
        selectedIds={selectedAccessiblitiesId}
        onSelect={handleAccessibilitySelect}
      />

      <SelectableChips
        label="Group Types"
        items={groupTypes ?? []}
        selectedIds={selectedGroupTypesId}
        onSelect={handleGroupTypeSelect}
      />

      {/* Internal Notes */}
      {userRole === UserRole.SUPERADMIN && (
        <FormFieldWrapper
          label={t("internal_notes")}
          hint={t("visible_only_to_admins")}
        >
          <TextareaField
            rows={4}
            value={internalNotes}
            onChange={setInternalNotes}
            placeholder={t("add_internal_notes")}
            inputClasses={`${inputClasses} text-base`}
          />
        </FormFieldWrapper>
      )}
    </div>
  );
};

export default EventBasicInformation;
