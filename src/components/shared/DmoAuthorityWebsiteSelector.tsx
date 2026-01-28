import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useCallback } from "react";

import { useCommon } from "@/hooks/useCommon";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGetAllWebsitesQuery } from "@/store/api/masterDataApi";
import { FormFieldWrapper, SelectField } from "@/components/form-fields";

type Props = {
  selectedDmoId: string;
  selectedAuthorityId: string;
  errors: Record<string, string>;
  dmoSectionRef: React.RefObject<HTMLDivElement | null>;
  authoritySectionRef: React.RefObject<HTMLDivElement | null>;
  setSelectDmoId: React.Dispatch<React.SetStateAction<string>>;
  setSelectAuthorityId: React.Dispatch<React.SetStateAction<string>>;
};

export default function DmoAuthorityWebsiteSelector({
  errors,
  selectedDmoId,
  setSelectDmoId,
  selectedAuthorityId,
  setSelectAuthorityId,
  authoritySectionRef,
  dmoSectionRef,
}: Props) {
  const { t } = useTranslation("common");
  const { theme, selectInputClasses } = useThemeClasses();
  const { dmosAuthorities } = useCommon();

  const { data: allWebsites } = useGetAllWebsitesQuery({
    authorityId: selectedAuthorityId,
    dmoId: selectedDmoId,
  });

  const [websiteVisibilityIds, setWebsiteVisibilityIds] = useState({
    allBlacklistIds: [] as string[],
    selectedBlacklistIds: [] as string[],
    allWhitelistIds: [] as string[],
    selectedWhitelistIds: [] as string[],
  });

  const selectedDmos = dmosAuthorities?.find(
    (item) => item?._id === selectedDmoId,
  );
  /* ----------------------------
   Initialize ALL IDs (once data arrives)
  -----------------------------*/
  useEffect(() => {
    if (!allWebsites) return;

    setWebsiteVisibilityIds((prev) => ({
      ...prev,
      allBlacklistIds: allWebsites.associatedWebsites?.map((w) => w._id) || [],
      allWhitelistIds:
        allWebsites.unAssociatedWebsites?.map((w) => w._id) || [],
    }));
  }, [allWebsites]);

  /* ----------------------------
   Helpers
  -----------------------------*/
  const toggleId = useCallback(
    (id: string, key: "selectedBlacklistIds" | "selectedWhitelistIds") => {
      setWebsiteVisibilityIds((prev) => ({
        ...prev,
        [key]: prev[key].includes(id)
          ? prev[key].filter((x) => x !== id)
          : [...prev[key], id],
      }));
    },
    [],
  );

  const toggleAll = useCallback(
    (
      allKey: "allBlacklistIds" | "allWhitelistIds",
      selectedKey: "selectedBlacklistIds" | "selectedWhitelistIds",
    ) => {
      setWebsiteVisibilityIds((prev) => {
        const isAllSelected = prev[selectedKey].length === prev[allKey].length;

        return {
          ...prev,
          [selectedKey]: isAllSelected ? [] : [...prev[allKey]],
        };
      });
    },
    [],
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
    if (!websites || websites.length === 0) return null;

    const allSelected =
      websiteVisibilityIds[selectedKey].length ===
      websiteVisibilityIds[allKey].length;

    return (
      <div>
        <label className="block mb-1 font-medium">{title}</label>

        <div className="grid grid-cols-2 gap-4 mt-2">
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
          {websites.map((item) => (
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
      {(selectedDmoId || selectedAuthorityId) && (
        <div className="space-y-4">
          <label
            className={`block text-sm mb-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {t("website_visibility")} *
          </label>

          {/* Associated → Blacklist */}
          {renderSection(
            t("select_associated_websites"),
            allWebsites?.associatedWebsites,
            "allBlacklistIds",
            "selectedBlacklistIds",
          )}

          {/* Unassociated → Whitelist */}
          {renderSection(
            t("select_unassociated_websites"),
            allWebsites?.unAssociatedWebsites,
            "allWhitelistIds",
            "selectedWhitelistIds",
          )}
        </div>
      )}
    </section>
  );
}
