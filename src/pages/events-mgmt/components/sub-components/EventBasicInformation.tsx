import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { ImageWithFallback, SelectableChips } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  useGetAccessibilityQuery,
  useGetAllWebsitesQuery,
  useGetGroupTypesQuery,
  useGetSubCategoriesQuery,
} from "@/store/api/masterDataApi";
import { useCommon } from "@/hooks/useCommon";
import {
  FormFieldWrapper,
  InputField,
  RadioGroupField,
  SelectField,
  TextareaField,
} from "@/components/form-fields";
import { Globe } from "lucide-react";

interface EventBasicInformationProps {
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
}

const EventBasicInformation: React.FC<EventBasicInformationProps> = ({
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
}) => {
  const { t, i18n } = useTranslation("events");
  const { dmosAuthorities } = useCommon();
  const { textSecondary, inputClasses, selectInputClasses, theme } =
    useThemeClasses();
  const locale = i18n.language as Language;

  const { data: allWebsites } = useGetAllWebsitesQuery({
    authorityId: selectedAuthorityId,
    dmoId: selectedDmoId,
  });
  const { data: subCategories } = useGetSubCategoriesQuery({
    bussCategoryId: "6566fcd4a77d2a477266d3b9",
    locale,
  });
  const { data: accessibility } = useGetAccessibilityQuery({ locale });
  const { data: groupTypes } = useGetGroupTypesQuery({ locale });

  const [websiteVisibilityIds, setWebsiteVisibilityIds] = useState({
    allBlacklistIds: [],
    selectedBlacklistIds: [],
    allWhitelistIds: [],
    selectedWhitelistIds: [],
  });

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

  const selectedDmos = dmosAuthorities?.find(
    (item) => item?._id === selectedDmoId,
  );

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
      {/* DMO + Authority */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-1 w-full" ref={dmoSectionRef}>
          <FormFieldWrapper
            required
            label={t("select_dmo")}
            error={errors.dmoId}
          >
            <SelectField
              value={selectedDmoId}
              onChange={(v) => {
                setSelectDmoId(v);
                setSelectAuthorityId("");
              }}
              placeholder={t("select_dmo")}
              options={
                dmosAuthorities?.map((d) => ({
                  label: d.name,
                  value: d._id,
                })) ?? []
              }
              error={errors.dmoId}
              selectInputClasses={selectInputClasses}
            />
          </FormFieldWrapper>
        </div>

        <div className="flex-1 w-full" ref={authoritySectionRef}>
          <FormFieldWrapper
            required
            label={t("select_authority")}
            error={errors.authorityId}
          >
            <SelectField
              value={selectedAuthorityId}
              onChange={setSelectAuthorityId}
              placeholder={t("select_authority")}
              options={
                selectedDmos?.authorities?.map((a) => ({
                  label: a.name,
                  value: a._id,
                })) ?? []
              }
              error={errors.authorityId}
              selectInputClasses={selectInputClasses}
            />
          </FormFieldWrapper>
        </div>
      </div>

      {/* Websites */}
      <div className=" space-y-4">
        <label
          className={`block text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("website_visibility")} *
        </label>

        {/* Associated Websites */}
        <div>
          {(allWebsites?.associatedWebsites?.length || 0) > 0 && (
            <div>
              <label htmlFor="">{t("select_associated_websites")}</label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <label
                  htmlFor="all-associated-websites"
                  className="flex items-center cursor-pointer border rounded p-2 w-full"
                  style={{ gap: "0.5rem" }}
                >
                  <input
                    type="checkbox"
                    id="all-associated-websites"
                    // checked={allWebsites}
                    // onChange={handleAllWebsitesChange}
                    className="shrink-0"
                  />
                  <Globe className="mr-2" />
                  <span>All</span>
                </label>
                {allWebsites?.associatedWebsites?.map((item) => (
                  <label
                    key={item._id}
                    htmlFor={item.name}
                    className="flex items-center cursor-pointer border rounded p-2 w-full"
                    style={{ gap: "0.5rem" }}
                  >
                    <input
                      type="checkbox"
                      id={item.name}
                      // checked={selectedWebsites.includes(name)}
                      // onChange={() => toggleWebsite(name)}
                      className="shrink-0"
                    />
                    <ImageWithFallback
                      src={item.logo}
                      alt={item.logo}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-600">{item.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Un Associated Websites */}
        <div>
          {(allWebsites?.unAssociatedWebsites?.length || 0) > 0 && (
            <div>
              <label htmlFor="">{t("select_unassociated_websites")}</label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <label
                  htmlFor="all-unassociated-websites"
                  className="flex items-center cursor-pointer border rounded-md p-2 w-full"
                  style={{ gap: "0.5rem" }}
                >
                  <input
                    type="checkbox"
                    id="all-unassociated-websites"
                    // checked={allWebsites}
                    // onChange={handleAllWebsitesChange}
                    className="shrink-0"
                  />
                  <Globe className="mr-2" />
                  <span>All</span>
                </label>
                {allWebsites?.unAssociatedWebsites?.map((item) => (
                  <label
                    key={item._id}
                    htmlFor={item.name}
                    className="flex items-center cursor-pointer border rounded-md p-2 w-full"
                    style={{ gap: "0.5rem" }}
                  >
                    <input
                      type="checkbox"
                      id={item.name}
                      // checked={selectedWebsites.includes(name)}
                      // onChange={() => toggleWebsite(name)}
                      className="shrink-0"
                    />
                    <ImageWithFallback
                      src={item.logo}
                      alt={item.logo}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-600">{item.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event Name */}
      <div ref={nameSectionRef}>
        <FormFieldWrapper
          required
          label={t("event_name")}
          error={errors.eventName}
        >
          <InputField
            value={eventName}
            onChange={setEventName}
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
          inputHintText={`${shortDescription?.length ?? 0}/200 ${t("max_characters")}`}
        >
          <InputField
            value={shortDescription}
            onChange={setShortDescription}
            placeholder={t("brief_description")}
            inputClasses={inputClasses}
            maxLength={200}
          />
        </FormFieldWrapper>
      </div>

      {/* Full Description */}
      <FormFieldWrapper label={t("full_description")}>
        <TextareaField
          value={fullDescription}
          onChange={setFullDescription}
          placeholder={t("full_event_description")}
          rows={8}
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
        textSecondary={textSecondary}
      />

      <SelectableChips
        label="Accessiblities"
        items={accessibility?.datas?.data ?? []}
        selectedIds={selectedAccessiblitiesId}
        onSelect={handleAccessibilitySelect}
        textSecondary={textSecondary}
      />

      <SelectableChips
        label="Group Types"
        items={groupTypes?.datas?.data ?? []}
        selectedIds={selectedGroupTypesId}
        onSelect={handleGroupTypeSelect}
        textSecondary={textSecondary}
      />

      {/* Internal Notes */}
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
    </div>
  );
};

export default EventBasicInformation;
