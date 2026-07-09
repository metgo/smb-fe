import { useTranslation } from "react-i18next";
import React, { useEffect, useRef } from "react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  DmoAuthorityWebsiteSelector,
  SelectableChips,
} from "@/components/shared";
import { useGetSubCategoriesQuery } from "@/store/api/masterDataApi";
import {
  FormFieldWrapper,
  ReactSelect,
  TextareaField,
} from "@/components/form-fields";
import { categoryIds } from "@/lib/utils";
import { useCommon } from "@/hooks/useCommon";
import { useUserRoles } from "@/hooks/useUserRoles";
import { getLngWiseStr } from "@/helpers";
import ProductContentForm from "@/pages/products-mgmt/components/sub-components/ProductContentForm";

interface EventBasicInformationProps {
  formData: Record<string, any>;
  onChange: (updates: Record<string, any>) => void;
  eventId: string;
  markDirty: (step: number) => void;
  selectedDmoId: string;
  setSelectDmoId: React.Dispatch<React.SetStateAction<string>>;
  selectedAuthorityId: string;
  setSelectAuthorityId: React.Dispatch<React.SetStateAction<string>>;
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
  isBusinessLoading: boolean;
  searchBusiness: (key: string) => void;
}

const EventBasicInformation: React.FC<EventBasicInformationProps> = ({
  eventId,
  markDirty,
  selectedDmoId,
  setSelectDmoId,
  selectedAuthorityId,
  setSelectAuthorityId,
  formData,
  onChange,
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
  isBusinessLoading,
  searchBusiness,
}) => {
  const { t, i18n } = useTranslation("events");
  const { isSuperadmin } = useUserRoles();
  const { inputClasses, language } = useThemeClasses();
  const locale = i18n.language as Language;

  const { data: subCategories } = useGetSubCategoriesQuery({
    bussCategoryId: categoryIds.event,
    locale,
  });

  const { groupTypes, accessibility } = useCommon();

  const dmoSectionRef = useRef<HTMLDivElement | null>(null);
  const authoritySectionRef = useRef<HTMLDivElement | null>(null);
  const nameSectionRef = useRef<HTMLDivElement | null>(null);
  const shortDescSectionRef = useRef<HTMLDivElement | null>(null);

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
      targetRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      const focusable = targetRef.current.querySelector(
        "input, select, textarea, button",
      ) as HTMLElement | null;
      focusable?.focus?.();
    }
  }, [errors]);

  useEffect(() => {
    markDirty(1);
  }, [
    formData.nameHe,
    formData.shortDescriptionHe,
    formData.fullDescriptionHe,
    formData.nameAr,
    formData.shortDescriptionAr,
    formData.fullDescriptionAr,
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

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <FormFieldWrapper label={t("select_business")}>
        <ReactSelect
          value={selectedBusinessId}
          onChange={(id: string) => setSelectedBusinessId(id)}
          placeholder={t("select_business")}
          items={
            businesses?.map((biz) => ({
              _id: biz._id,
              name: getLngWiseStr(language, biz.name, biz.nameHe, biz.nameAr),
            })) || []
          }
          isLoading={isBusinessLoading}
          onSearch={searchBusiness}
        />
      </FormFieldWrapper>
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

      <div className="font-semibold text-md text-gray-700">
        {t("step_1_basic_information")}
      </div>

      <ProductContentForm formData={formData} onChange={onChange} />

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
