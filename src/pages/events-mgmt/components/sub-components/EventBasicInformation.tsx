import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { SelectableChips } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetAccessibilityQuery, useGetGroupTypesQuery, useGetSubCategoriesQuery } from "@/store/api/masterDataApi";
import { useCommon } from "@/hooks/useCommon";
import { FormFieldWrapper, InputField, RadioGroupField, SelectField, TextareaField } from "@/components/form-fields";

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
  setEventStatus: React.Dispatch<React.SetStateAction<"draft" | "pending" | "approved">>;
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
  errors,
  selectedSubCategoriesId, setSubCategoriesId,
  selectedAccessiblitiesId, setAccessiblitiesId,
  selectedGroupTypesId, setGroupTypesId,
  selectedDmoId, setSelectDmoId,
  selectedAuthorityId, setSelectAuthorityId,
}) => {

  const { t, i18n } = useTranslation("events");
  const { dmosAuthorities } = useCommon()
  const { textSecondary, inputClasses, selectInputClasses } = useThemeClasses();
  const locale = i18n.language as Language;

  const { data: subCategories } = useGetSubCategoriesQuery({ bussCategoryId: "6566fcd4a77d2a477266d3b9", locale });
  const { data: accessibility } = useGetAccessibilityQuery({ locale });
  const { data: groupTypes } = useGetGroupTypesQuery({ locale });


  const selectedDmos = dmosAuthorities?.find((item) => item?._id === selectedDmoId);


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
  ]);

  const fieldRefs = {
    dmoId: useRef<HTMLDivElement>(null),
    authorityId: useRef<HTMLDivElement>(null),
    eventName: useRef<HTMLInputElement>(null),
    shortDescription: useRef<HTMLInputElement>(null),
  };


  useEffect(() => {
    const errorKeys = Object.keys(errors);
    if (errorKeys?.length === 0) return;

    const firstErrorKey = errorKeys[0];
    const ref = fieldRefs[firstErrorKey as keyof typeof fieldRefs];

    if (ref?.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      if ("focus" in ref.current) {
        (ref.current as HTMLElement).focus();
      }
    }
  }, [errors]);


  const handleSubcategorySelect = (itemId: string) => {
    const exists = selectedSubCategoriesId?.some((id) => id === itemId);

    if (exists) {
      const updated = selectedSubCategoriesId?.filter((id) => id !== itemId);
      setSubCategoriesId(updated);
    } else {
      setSubCategoriesId([...selectedSubCategoriesId, itemId]);
    }
  }

  const handleGroupTypeSelect = (itemId: string) => {
    const exists = selectedGroupTypesId?.some((id) => id === itemId);

    if (exists) {
      const updated = selectedGroupTypesId?.filter((id) => id !== itemId);
      setGroupTypesId(updated);
    } else {
      setGroupTypesId([...selectedGroupTypesId, itemId]);
    }
  }

  const handleAccessibilitySelect = (itemId: string) => {
    const exists = selectedAccessiblitiesId?.some((id) => id === itemId);

    if (exists) {
      const updated = selectedAccessiblitiesId?.filter((id) => id !== itemId);
      setAccessiblitiesId(updated);
    } else {
      setAccessiblitiesId([...selectedAccessiblitiesId, itemId]);
    }
  }



  return (
    <div className="space-y-4 max-w-3xl mx-auto">

      <div className="flex items-start justify-between gap-4">
        {/* DMO */}
        <div className="flex-1">
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
              options={dmosAuthorities?.map(d => ({
                label: d.name,
                value: d._id
              })) ?? []}
              error={errors.dmoId}
              fieldRef={fieldRefs.dmoId}
              selectInputClasses={selectInputClasses}
            />
          </FormFieldWrapper>
        </div>

        {/* Authority */}
        <div className="flex-1">
          <FormFieldWrapper
            required
            label={t("select_authority")}
            error={errors.authorityId}
          >
            <SelectField
              value={selectedAuthorityId}
              onChange={setSelectAuthorityId}
              placeholder={t("select_authority")}
              options={selectedDmos?.authorities?.map(a => ({
                label: a.name,
                value: a._id
              })) ?? []}
              error={errors.authorityId}
              fieldRef={fieldRefs.authorityId}
              selectInputClasses={selectInputClasses}
            />
          </FormFieldWrapper>
        </div>
      </div>


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
          fieldRef={fieldRefs.eventName}
        />
      </FormFieldWrapper>


      {/* Short Description */}
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
          fieldRef={fieldRefs.shortDescription}
          maxLength={200}
        />
      </FormFieldWrapper>


      {/* Full Description */}
      <FormFieldWrapper
        label={t("full_description")}
      >
        <TextareaField
          value={fullDescription}
          onChange={setFullDescription}
          placeholder={t("full_event_description")}
          rows={8}
          inputClasses={`${inputClasses} text-base`}
        />
      </FormFieldWrapper>


      {/* Event Status */}
      <FormFieldWrapper
        label={t("event_status")}
      >
        <RadioGroupField
          value={eventStatus}
          options={["draft", "pending", "approved"]}
          onChange={setEventStatus}
          labelMapper={(v) => t(v)}
          textSecondary={textSecondary}
        />
      </FormFieldWrapper>


      <SelectableChips
        label="Sub Categories"
        items={subCategories?.datas?.data}
        selectedIds={selectedSubCategoriesId}
        onSelect={handleSubcategorySelect}
        textSecondary={textSecondary}
      />
      <SelectableChips
        label="Accessiblities"
        items={accessibility?.datas?.data}
        selectedIds={selectedAccessiblitiesId}
        onSelect={handleAccessibilitySelect}
        textSecondary={textSecondary}
      />
      <SelectableChips
        label="Group Types"
        items={groupTypes?.datas?.data}
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

    </div >
  );
};

export default EventBasicInformation;