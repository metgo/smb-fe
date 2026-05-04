import { useTranslation } from "react-i18next";
import React, { useEffect, useRef, useState } from "react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  DmoAuthorityWebsiteSelector,
  RichTextEditor,
  SelectableChips,
} from "@/components/shared";
import { useGetSubCategoriesQuery } from "@/store/api/masterDataApi";
import {
  FormFieldWrapper,
  InputField,
  ReactSelect,
  TextareaField,
} from "@/components/form-fields";
import { categoryIds } from "@/lib/utils";
import { useCommon } from "@/hooks/useCommon";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Globe } from "lucide-react";

interface EventBasicInformationProps {
  eventId: string;
  markDirty: (step: number) => void;
  selectedDmoId: string;
  setSelectDmoId: React.Dispatch<React.SetStateAction<string>>;
  selectedAuthorityId: string;
  setSelectAuthorityId: React.Dispatch<React.SetStateAction<string>>;
  eventName: string;
  eventNameHe: string;
  eventNameAr: string;

  setEventName: React.Dispatch<React.SetStateAction<string>>;
  setEventNameHe: React.Dispatch<React.SetStateAction<string>>;
  setEventNameAr: React.Dispatch<React.SetStateAction<string>>;

  // Short Description
  shortDescription: string;
  shortDescriptionHe: string;
  shortDescriptionAr: string;
  setShortDescription: React.Dispatch<React.SetStateAction<string>>;
  setShortDescriptionHe: React.Dispatch<React.SetStateAction<string>>;
  setShortDescriptionAr: React.Dispatch<React.SetStateAction<string>>;

  // Full Description (for CKEditor)
  fullDescription: string;
  fullDescriptionHe: string;
  fullDescriptionAr: string;
  setFullDescription: React.Dispatch<React.SetStateAction<string>>;
  setFullDescriptionHe: React.Dispatch<React.SetStateAction<string>>;
  setFullDescriptionAr: React.Dispatch<React.SetStateAction<string>>;

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
  selectedBusinessId: string;
  setSelectedBusinessId: (id: string) => void;
  businesses: ISearchBusiness[];
  searchBusiness: (keyword: string) => void;
  isBusinessLoading: boolean;
  presetBusinessId?: string;
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
  eventNameHe,
  setEventNameHe,
  eventNameAr,
  setEventNameAr,
  shortDescription,
  setShortDescription,
  shortDescriptionHe,
  setShortDescriptionHe,
  shortDescriptionAr,
  setShortDescriptionAr,
  fullDescription,
  setFullDescription,
  fullDescriptionAr,
  setFullDescriptionAr,
  fullDescriptionHe,
  setFullDescriptionHe,
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
  selectedBusinessId,
  setSelectedBusinessId,
  businesses,
  searchBusiness,
  isBusinessLoading,
  presetBusinessId,
}) => {
  const { t, i18n } = useTranslation("events");
  const { isSuperadmin } = useUserRoles();
  const { inputClasses, isDark } = useThemeClasses();
  const locale = i18n.language as Language;

  const { data: subCategories } = useGetSubCategoriesQuery({
    bussCategoryId: categoryIds.event,
    locale,
  });
  const [selectedFormLanguage, setSelectedFormLanguage] =
    useState<Language>("he");
  /* -------- Helpers -------- */

  const getFieldValue = (field: "name" | "short" | "full"): string => {
    if (field === "name") {
      if (selectedFormLanguage === "en") return eventName;
      if (selectedFormLanguage === "he") return eventNameHe;
      return eventNameAr;
    }

    if (field === "short") {
      if (selectedFormLanguage === "en") return shortDescription;
      if (selectedFormLanguage === "he") return shortDescriptionHe;
      return shortDescriptionAr;
    }

    // full description
    if (field === "full") {
      if (selectedFormLanguage === "en") return fullDescription;
      if (selectedFormLanguage === "he") return fullDescriptionHe;
      return fullDescriptionAr;
    }
    return "";
  };

  const getPlaceholder = (type: "name" | "short" | "full"): string => {
    if (selectedFormLanguage === "en") {
      if (type === "name") return t("event_name");
      if (type === "short") return t("brief_description");
      if (type === "full") return t("full_description");
    }

    if (selectedFormLanguage === "he") {
      if (type === "name") return "הזן שם האירוע";
      if (type === "short") return "תיאור קצר";
      if (type === "full") return "תיאור מלא";
    }
    if (selectedFormLanguage === "ar") {
      if (type === "name") return "أدخل اسم الحدث";
      if (type === "short") return "وصف مختصر";
      if (type === "full") return "وصف كامل";
    }
    return "";
  };

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
    selectedBusinessId,
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

  const handleFieldChange = (
    field: "name" | "short" | "full",
    value: string,
  ) => {
    if (field === "name") {
      if (selectedFormLanguage === "en") setEventName(value);
      else if (selectedFormLanguage === "he") setEventNameHe(value);
      else setEventNameAr(value);
    } else if (field === "short") {
      if (selectedFormLanguage === "en") setShortDescription(value);
      else if (selectedFormLanguage === "he") setShortDescriptionHe(value);
      else setShortDescriptionAr(value);
    } else {
      // full description
      if (selectedFormLanguage === "en") setFullDescription(value);
      else if (selectedFormLanguage === "he") setFullDescriptionHe(value);
      else setFullDescriptionAr(value);
    }
  };
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <DmoAuthorityWebsiteSelector
        keyId="_id"
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
      {/* Select Business */}
      <FormFieldWrapper label={t("select_business")}>
        <ReactSelect
          isDisabled={!!presetBusinessId}
          value={selectedBusinessId}
          onChange={(id: string) => setSelectedBusinessId(id)}
          placeholder={t("select_business")}
          items={
            businesses?.map((biz) => ({ _id: biz._id, name: biz.name })) || []
          }
          onSearch={searchBusiness}
          isLoading={isBusinessLoading}
        />
      </FormFieldWrapper>

      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold text-md text-gray-700">
          {t("step_1_basic_information")}
        </div>
        <div className="flex justify-center items-center gap-2">
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
      {/* Event Name */}
      <div
        dir={selectedFormLanguage === "en" ? "ltr" : "rtl"}
        ref={nameSectionRef}
      >
        <FormFieldWrapper
          required
          label={t("event_name")}
          error={errors.eventName}
          inputHintText={`${getFieldValue("name")?.length ?? 0}/50 ${t("max_characters")}`}
        >
          <InputField
            value={getFieldValue("name")}
            onChange={(val) => handleFieldChange("name", val)}
            maxLength={50}
            placeholder={getPlaceholder("name")}
            inputClasses={`${inputClasses} text-lg`}
          />
        </FormFieldWrapper>
      </div>

      {/* Short Description */}
      <div
        dir={selectedFormLanguage === "en" ? "ltr" : "rtl"}
        ref={shortDescSectionRef}
      >
        <FormFieldWrapper
          required
          label={t("short_description")}
          error={errors.shortDescription}
          inputHintText={`${getFieldValue("short")?.length ?? 0}/50 ${t("max_characters")}`}
        >
          <InputField
            value={getFieldValue("short")}
            onChange={(val) => handleFieldChange("short", val)}
            maxLength={50}
            placeholder={getPlaceholder("short")}
            inputClasses={inputClasses}
          />
        </FormFieldWrapper>
      </div>

      {/* Full Description */}
      <div dir={selectedFormLanguage === "en" ? "ltr" : "rtl"}>
        <FormFieldWrapper
          label={t("full_description")}
          inputHintText={`${getFieldValue("full")?.length ?? 0}/50 ${t("max_characters")}`}
        >
          <RichTextEditor
            value={getFieldValue("full")}
            onChange={(val) => handleFieldChange("full", val)}
            placeholder={getPlaceholder("full")}
          />
        </FormFieldWrapper>
      </div>

      {/* Chips */}
      <SelectableChips
        label="subcategories"
        items={subCategories?.datas?.data ?? []}
        selectedIds={selectedSubCategoriesId}
        onSelect={handleSubcategorySelect}
      />

      <SelectableChips
        label="accessiblities"
        items={accessibility ?? []}
        selectedIds={selectedAccessiblitiesId}
        onSelect={handleAccessibilitySelect}
      />

      <SelectableChips
        label="group_types"
        items={groupTypes ?? []}
        selectedIds={selectedGroupTypesId}
        onSelect={handleGroupTypeSelect}
      />

      {/* Internal Notes */}
      {isSuperadmin && (
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
