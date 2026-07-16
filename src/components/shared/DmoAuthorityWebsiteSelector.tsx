import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useCallback, useMemo } from "react";

import { useCommon } from "@/hooks/useCommon";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { FormFieldWrapper, ReactSelect } from "@/components/form-fields";
import ImageWithFallback from "./ImageWithFallback";
import { useAppSelector } from "@/hooks/hooks";
import { useUserRoles } from "@/hooks/useUserRoles";

type Props = {
  keyId: keyof IAssociatedWebsiteIds;
  isEdit: boolean;
  selectedDmoId: string;
  selectedAuthorityId: string;
  errors: Record<string, string>;
  setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  dmoSectionRef: React.RefObject<HTMLDivElement | null>;
  setSelectDmoId: React.Dispatch<React.SetStateAction<string>>;
  setSelectAuthorityId: React.Dispatch<React.SetStateAction<string>>;
  websiteVisibilityIds: IWebsiteVisibilityIds | string[];
  setWebsiteVisibilityIds: (
    v:
      | IWebsiteVisibilityIds
      | string[]
      | ((
          prev: IWebsiteVisibilityIds | string[],
        ) => IWebsiteVisibilityIds | string[]),
  ) => void;
  itemAssociatedWebsites: IAssociatedWebsiteIds[] | string[];
};

export default function DmoAuthorityWebsiteSelector({
  errors,
  setErrors,
  isEdit,
  selectedDmoId,
  setSelectDmoId,
  selectedAuthorityId,
  setSelectAuthorityId,
  dmoSectionRef,
  websiteVisibilityIds,
  setWebsiteVisibilityIds,
  itemAssociatedWebsites,
  keyId,
}: Props) {
  const { t } = useTranslation("common");
  const { dmosAuthorities, allWebsites } = useCommon();
  const { isDark } = useThemeClasses();
  const { dmoId } = useAppSelector((state) => state.auth);
  const { isSuperadmin, isDMO, isAuthority } = useUserRoles();

  // Auto-select DMO user's own DMO on mount
  useEffect(() => {
    if (isDMO && dmoId && !selectedDmoId) {
      setSelectDmoId(dmoId);
    }
  }, [isDMO, dmoId, selectedDmoId, setSelectDmoId]);

  const selectedDmos = dmosAuthorities?.find(
    (item) => item?._id === selectedDmoId,
  );

  const isSimpleArray = Array.isArray(websiteVisibilityIds);

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
    if (isSimpleArray) return;

    // Only skip if BOTH are empty (no data at all)
    if (!associatedWebsites.length && !unAssociatedWebsites.length) return;

    const allBlacklistIds = associatedWebsites?.map((w) => w?._id);
    const allWhitelistIds = unAssociatedWebsites?.map((w) => w?._id);

    const itemAssociatedIds = new Set(
      itemAssociatedWebsites
        ?.map((w) => (typeof w === "string" ? w : w?.[keyId]))
        .filter((id): id is string => Boolean(id)) || [],
    );

    const selectedBlacklistIds = isEdit
      ? Array.from(itemAssociatedIds).filter((id) =>
          allBlacklistIds?.includes(id),
        )
      : allBlacklistIds;

    const selectedWhitelistIds = Array.from(itemAssociatedIds).filter((id) =>
      allWhitelistIds?.includes(id),
    );

    setWebsiteVisibilityIds((prev) => ({
      ...(prev as IWebsiteVisibilityIds),
      allBlacklistIds,
      selectedBlacklistIds,
      allWhitelistIds,
      selectedWhitelistIds,
    }));
  }, [associatedWebsites, unAssociatedWebsites, isSimpleArray]);

  /* ----------------------------
   Helpers
  -----------------------------*/
  const toggleId = useCallback(
    (id: string, key: "selectedBlacklistIds" | "selectedWhitelistIds") => {
      setWebsiteVisibilityIds((prev) => {
        if (Array.isArray(prev)) {
          return prev.includes(id)
            ? prev.filter((x) => x !== id)
            : [...prev, id];
        }

        return {
          ...prev,
          [key]: prev[key].includes(id)
            ? prev[key].filter((x) => x !== id)
            : [...prev[key], id],
        };
      });
    },
    [setWebsiteVisibilityIds],
  );

  const toggleAll = useCallback(
    (
      allKey: "allBlacklistIds" | "allWhitelistIds",
      selectedKey: "selectedBlacklistIds" | "selectedWhitelistIds",
      allIds: string[],
    ) => {
      setWebsiteVisibilityIds((prev) => {
        if (Array.isArray(prev)) {
          const isAllSelected = prev.length === allIds.length;
          return isAllSelected ? [] : [...allIds];
        }

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

    const allIds = websites.map((w) => w._id);
    const selectedIds = isSimpleArray
      ? (websiteVisibilityIds as string[])
      : websiteVisibilityIds[selectedKey];

    const allSelected = isSimpleArray
      ? selectedIds.length === allIds.length
      : websiteVisibilityIds[selectedKey].length ===
        websiteVisibilityIds[allKey].length;

    return (
      <div>
        <label
          className={`block text-sm mb-2 ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {title}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
          {/* Select All */}
          <label
            className={`flex items-center gap-2 cursor-pointer border rounded p-2
            ${
              isDark
                ? "border-gray-700 bg-gray-900 text-gray-300"
                : "border-gray-300 bg-white text-gray-700"
            }
          `}
          >
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => toggleAll(allKey, selectedKey, allIds)}
              className={`rounded
                ${
                  isDark
                    ? "bg-gray-900 border-gray-700 accent-teal-500"
                    : "bg-white border-gray-300 accent-teal-600"
                }
              `}
            />
            <Globe className="h-6 w-6" />
            <span>{t("all")}</span>
          </label>

          {/* Individual Websites */}
          {websites?.map((item) => (
            <label
              key={item._id}
              className={`flex items-center gap-2 cursor-pointer border rounded p-2
      ${
        isDark
          ? "border-gray-700 bg-gray-900 text-gray-300"
          : "border-gray-300 bg-white text-gray-700"
      }
    `}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(item._id)}
                onChange={() => toggleId(item._id, selectedKey)}
                className={`rounded
                ${
                  isDark
                    ? "bg-gray-900 border-gray-700 accent-teal-500"
                    : "bg-white border-gray-300 accent-teal-600"
                }
              `}
              />
              <ImageWithFallback
                src={item?.logo}
                alt={item?.name}
                className="w-8 h-8 object-contain"
              />
              <span>{item.name}</span>
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
        <div className="flex-1 w-full relative" ref={dmoSectionRef}>
          <FormFieldWrapper
            required
            label={t("select_dmo")}
            hint={t("your_geographic_location")}
            error={errors.dmoId}
          >
            <ReactSelect
              isDisabled={isAuthority}
              value={selectedDmoId}
              onChange={(v) => {
                setSelectDmoId(v);
                setSelectAuthorityId("");
                if (setErrors && v) {
                  setErrors((prev: Record<string, string>) => {
                    const updated = { ...prev };
                    delete updated.dmoId;
                    return updated;
                  });
                }
              }}
              placeholder={t("select_dmo")}
              items={
                dmosAuthorities?.map((d) => ({
                  name: d.name,
                  _id: d._id,
                  logo: d.logoPath,
                })) ?? []
              }
            />
          </FormFieldWrapper>
        </div>

        <div className="flex-1 w-full">
          <FormFieldWrapper required label={t("select_authority")}>
            <ReactSelect
              value={selectedAuthorityId}
              isDisabled={isAuthority}
              onChange={(v) => {
                setSelectAuthorityId(v);
                if (setErrors && v) {
                  setErrors((prev: Record<string, string>) => {
                    const updated = { ...prev };
                    delete updated.authorityId;
                    return updated;
                  });
                }
              }}
              placeholder={t("select_authority")}
              items={
                selectedDmos?.authorities?.map((a: any) => ({
                  name: a.name,
                  _id: a._id,
                  logo: a.logoPath,
                })) ?? []
              }
            />
          </FormFieldWrapper>
        </div>
      </div>

      {/* Websites */}
      {(selectedDmoId || selectedAuthorityId) && (
        <div className="space-y-4">
          <label
            className={`block text-sm mb-2 ${
              isDark ? "text-gray-300" : "text-gray-800"
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

          {isSuperadmin &&
            renderSection(
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
