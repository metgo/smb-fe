import clsx from "clsx";
import React, { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import { SelectableChips } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetAccessibilityQuery, useGetGroupTypesQuery, useGetSubCategoriesQuery } from "@/store/api/masterDataApi";
import { useCommon } from "@/hooks/useCommon";

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
  const { textSecondary, textTertiary, inputClasses, selectInputClasses } = useThemeClasses();
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

  /* ------------------------------------------------------------------ */
  /* 🔹 REFS FOR ERROR SCROLLING */
  /* ------------------------------------------------------------------ */
  const fieldRefs = {
    dmoId: useRef<HTMLDivElement>(null),
    authorityId: useRef<HTMLDivElement>(null),
    eventName: useRef<HTMLInputElement>(null),
    shortDescription: useRef<HTMLInputElement>(null),
  };

  /* ------------------------------------------------------------------ */
  /* 🔹 AUTO SCROLL TO FIRST ERROR */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return;

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

      <div className="flex items-center justify-between gap-4">
        {/* Dmos Dropdown */}
        <div className="flex-1" ref={fieldRefs.dmoId}>
          <label className={`block text-sm font-medium mb-3 ${textSecondary}`}>
            {t("select_dmo")} <span className="text-red-500">*</span>
          </label>
          <div className=" flex gap-2 relative">
            <select
              value={selectedDmoId}
              onChange={(e) => {
                setSelectDmoId(e.target.value);
                setSelectAuthorityId("");
              }}
              className={clsx(
                "appearance-none h-12 w-full border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-45",
                // selectInputClasses
              )}
            >
              <option value="">Select DMO</option>
              {dmosAuthorities?.map((parent) => (
                <option key={parent._id} value={parent._id}>
                  {parent.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute top-1/2 ltr:right-3 rtl:left-3 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          {errors.dmoId && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              {errors.dmoId}
            </p>
          )}
        </div>

        {/* Authorities Dropdown */}
        <div className="flex-1" ref={fieldRefs.authorityId}>
          <label className={`block text-sm font-medium mb-3 ${textSecondary}`}>
            {t("select_authority")} <span className="text-red-500">*</span>
          </label>
          <div className=" w-full relative">
            <select
              value={selectedAuthorityId}
              onChange={(e) => setSelectAuthorityId(e.target.value)}
              className={clsx(
                "appearance-none h-12 w-full border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-45",
                selectInputClasses
              )}
            >
              <option value="">Select Authority</option>
              {selectedDmos?.authorities?.map((child) => (
                <option key={child._id} value={child._id}>
                  {child.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute top-1/2 ltr:right-3 rtl:left-3 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          {errors.authorityId && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              {errors.authorityId}
            </p>
          )}
        </div>
      </div>

      {/* Event Name */}
      <div>
        <label className={`block text-sm font-medium mb-3 ${textSecondary}`}>
          {t("event_name")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={eventName}
          ref={fieldRefs.eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder={t("enter_event_name")}
          className={`w-full px-5 py-3 rounded-xl border text-lg ${inputClasses} transition-all focus:ring-2 focus:ring-teal-500/20 ${errors.eventName ? "border-red-500" : ""
            }`}
        />
        {errors.eventName && (
          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
            {errors.eventName}
          </p>
        )}
      </div>

      {/* Short Description */}
      <div>
        <label className={`block text-sm font-medium mb-3 ${textSecondary}`}>
          {t("short_description")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          ref={fieldRefs.shortDescription}
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder={t("brief_description")}
          maxLength={200}
          className={`w-full px-5 py-3 rounded-xl border text-base ${inputClasses} transition-all focus:ring-2 focus:ring-teal-500/20`}
        />
        <p className={`text-xs mt-2 text-right ${textTertiary}`}>
          {shortDescription?.length}/200 {t("max_characters")}
        </p>
      </div>

      {/* Full Description */}
      <div>
        <label className={`block text-sm font-medium mb-3 ${textSecondary}`}>
          {t("full_description")}
        </label>
        <textarea
          value={fullDescription}
          onChange={(e) => setFullDescription(e.target.value)}
          placeholder={t("full_event_description")}
          rows={8}
          className={`w-full px-5 py-4 rounded-xl border resize-none text-base ${inputClasses} transition-all focus:ring-2 focus:ring-teal-500/20`}
        />
      </div>

      {/* Event Status */}
      <div>
        <label className={`block text-sm font-medium mb-4 ${textSecondary}`}>
          {t("event_status")}
        </label>
        <div className="flex flex-wrap gap-6">
          {(["draft", "pending", "approved"] as const).map((status) => (
            <label
              key={status}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                name="eventStatus"
                value={status}
                checked={eventStatus === status}
                onChange={(e) => setEventStatus(e.target.value as any)}
                className="w-5 h-5 text-teal-500 focus:ring-teal-500 focus:ring-2"
              />
              <span className={`text-base capitalize font-medium ${textSecondary} group-hover:text-teal-500 transition-colors`}>
                {t(status)}
              </span>
            </label>
          ))}
        </div>
      </div>

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
      <div>
        <label className={`block text-sm font-medium mb-3 ${textSecondary}`}>
          {t("internal_notes")}
          <span className={`text-xs ml-2 ${textTertiary}`}>({t("visible_only_to_admins")})</span>
        </label>
        <textarea
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder={t("add_internal_notes")}
          rows={4}
          className={`w-full px-5 py-4 rounded-xl border resize-none text-base ${inputClasses} transition-all focus:ring-2 focus:ring-teal-500/20`}
        />
      </div>
    </div >
  );
};

export default EventBasicInformation;