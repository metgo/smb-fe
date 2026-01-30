import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useCallback, useMemo } from "react";

import { useCommon } from "@/hooks/useCommon";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { FormFieldWrapper, SelectField } from "@/components/form-fields";

type Props = {
  isEdit: boolean;
  selectedDmoId: string;
  selectedAuthorityId: string;
  errors: Record<string, string>;
  dmoSectionRef: React.RefObject<HTMLDivElement | null>;
  setSelectDmoId: React.Dispatch<React.SetStateAction<string>>;
  setSelectAuthorityId: React.Dispatch<React.SetStateAction<string>>;
  websiteVisibilityIds: IWebsiteVisibilityIds;
  setWebsiteVisibilityIds: (v: any) => void;
  itemAssociatedWebsites: IAssociatedWebsiteIds[];
};

export default function DmoAuthorityWebsiteSelector({
  errors,
  isEdit,
  selectedDmoId,
  setSelectDmoId,
  selectedAuthorityId,
  setSelectAuthorityId,
  dmoSectionRef,
  websiteVisibilityIds,
  setWebsiteVisibilityIds,
  itemAssociatedWebsites,
}: Props) {
  const { t } = useTranslation("common");
  const { dmosAuthorities, allWebsites } = useCommon();
  const { theme, selectInputClasses } = useThemeClasses();

  const selectedDmos = dmosAuthorities?.find(
    (item) => item?._id === selectedDmoId,
  );

  const { associatedWebsites, unAssociatedWebsites } = useMemo(() => {
    const result = {
      associatedWebsites: [] as IWebsite[],
      unAssociatedWebsites: [] as IWebsite[],
    };

    if (!allWebsites?.length) return result;

    // If nothing selected → everything is unassociated (or change if needed)
    if (!selectedDmoId && !selectedAuthorityId) {
      result.unAssociatedWebsites = [...allWebsites];
      return result;
    }

    for (const site of allWebsites) {
      const matchDmo = selectedDmoId && site.dmoIds?.includes(selectedDmoId);

      const matchAuthority =
        selectedAuthorityId && site.authorityIds?.includes(selectedAuthorityId);

      // OR logic
      if (matchDmo || matchAuthority) {
        result.associatedWebsites.push(site);
      } else {
        result.unAssociatedWebsites.push(site);
      }
    }

    return result;
  }, [allWebsites, selectedDmoId, selectedAuthorityId]);

  /* ----------------------------
   Initialize ALL IDs (once data arrives)
  -----------------------------*/
  useEffect(() => {
    if (!associatedWebsites.length || !unAssociatedWebsites.length) return;

    const allBlacklistIds = associatedWebsites?.map((w) => w?._id);
    const allWhitelistIds = unAssociatedWebsites?.map((w) => w?._id);

    const itemAssociatedIds = new Set(
      itemAssociatedWebsites?.map((w) => w?._id) || [],
    );

    const selectedBlacklistIds = isEdit
      ? Array.from(itemAssociatedIds).filter((id) =>
          allBlacklistIds?.includes(id),
        )
      : allBlacklistIds;

    const selectedWhitelistIds = Array.from(itemAssociatedIds).filter((id) =>
      allWhitelistIds?.includes(id),
    );

    setWebsiteVisibilityIds((prev: IWebsiteVisibilityIds) => ({
      ...prev,
      allBlacklistIds,
      selectedBlacklistIds,
      allWhitelistIds,
      selectedWhitelistIds,
    }));
  }, [associatedWebsites, unAssociatedWebsites]);

  /* ----------------------------
   Helpers
  -----------------------------*/
  const toggleId = useCallback(
    (id: string, key: "selectedBlacklistIds" | "selectedWhitelistIds") => {
      setWebsiteVisibilityIds((prev: IWebsiteVisibilityIds) => ({
        ...prev,
        [key]: prev[key].includes(id)
          ? prev[key].filter((x) => x !== id)
          : [...prev[key], id],
      }));
    },
    [setWebsiteVisibilityIds],
  );

  const toggleAll = useCallback(
    (
      allKey: "allBlacklistIds" | "allWhitelistIds",
      selectedKey: "selectedBlacklistIds" | "selectedWhitelistIds",
    ) => {
      setWebsiteVisibilityIds((prev: IWebsiteVisibilityIds) => {
        const isAllSelected = prev[selectedKey].length === prev[allKey].length;

        return {
          ...prev,
          [selectedKey]: isAllSelected ? [] : [...prev[allKey]],
        };
      });
    },
    [setWebsiteVisibilityIds],
  );

  /* ----------------------------
   Render Section
  -----------------------------*/
  const renderSection = (
    title: string,
    websites: IWebsite[] | undefined,
    allKey: "allBlacklistIds" | "allWhitelistIds",
    selectedKey: "selectedBlacklistIds" | "selectedWhitelistIds",
  ) => {
    if (!websites || websites?.length === 0) return null;

    const allSelected =
      websiteVisibilityIds[selectedKey].length ===
      websiteVisibilityIds[allKey].length;

    return (
      <div>
        <label className="block mb-1 font-medium">{title}</label>

        <div className="grid grid-cols-4 gap-2 mt-2">
          {/* Select All */}
          <label className="flex items-center gap-2 cursor-pointer border rounded p-2 text-gray-600">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => toggleAll(allKey, selectedKey)}
            />
            <Globe className="h-6 w-6" />
            <span>{t("all")}</span>
          </label>

          {/* Individual Websites */}
          {websites?.map((item) => (
            <label
              key={item._id}
              className="flex items-center gap-2 cursor-pointer border rounded p-2"
            >
              <input
                type="checkbox"
                checked={websiteVisibilityIds[selectedKey].includes(item._id)}
                onChange={() => toggleId(item._id, selectedKey)}
              />
              <img
                src={item.logo}
                alt={item.name}
                className="w-8 h-8 object-contain"
              />
              <span className="text-gray-600">{item.name}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  /* ----------------------------
   UI
  -----------------------------*/
  return (
    <section className="space-y-4">
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

        <div className="flex-1 w-full">
          <FormFieldWrapper label={t("select_authority")}>
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
      {(selectedDmoId || selectedAuthorityId) && (
        <div className="space-y-4">
          <label
            className={`block text-sm mb-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-800"
            }`}
          >
            {t("website_visibility")}
          </label>

          {renderSection(
            t("select_associated_websites"),
            associatedWebsites,
            "allBlacklistIds",
            "selectedBlacklistIds",
          )}

          {renderSection(
            t("select_unassociated_websites"),
            unAssociatedWebsites,
            "allWhitelistIds",
            "selectedWhitelistIds",
          )}
        </div>
      )}
    </section>
  );
}
