import clsx from "clsx";
import { useEffect, useRef, useState, type FC } from "react";
import { ChevronDown } from "lucide-react";
import { Globe, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

import { useCommon } from "@/hooks/useCommon";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { DmoAuthorityWebsiteSelector } from "@/components/shared";
interface BusinessFormData {
  authority: string;
  slug: string;
  internalNotes: string;

  nameEn: string;
  nameHe: string;
  nameAr: string;

  shortDescriptionEn: string;
  shortDescriptionHe: string;
  shortDescriptionAr: string;

  fullDescriptionEn: string;
  fullDescriptionHe: string;
  fullDescriptionAr: string;
}

interface FormErrors {
  [key: string]: string;
}
type View = "list" | "details" | "create" | "edit" | undefined;

interface BusinessBasicInfosProps {
  theme: Theme;
  t: (key: string) => string;
  formData: BusinessFormData;
  setFormData: (data: BusinessFormData) => void;
  errors: FormErrors;
  canApprove: boolean;
  selectedDmoId?: string;
  setSelectDmoId: React.Dispatch<React.SetStateAction<string>>;
  businessId: string;
  selectedAuthorityId?: string;
  setSelectAuthorityId: React.Dispatch<React.SetStateAction<string>>;
  markDirty: (step: number) => void;
  currentView: View;
  websiteVisibilityIds: IWebsiteVisibilityIds;
  setWebsiteVisibilityIds: (v: any) => void;
  businessAssociatedWebsites?: IAssociatedWebsiteIds[];
}

const BusinessBasicInfos: FC<BusinessBasicInfosProps> = ({
  t,
  theme,
  formData,
  setFormData,
  markDirty,
  errors,
  canApprove,
  selectedDmoId,
  setSelectDmoId,
  selectedAuthorityId,
  setSelectAuthorityId,
  businessId,
  websiteVisibilityIds,
  setWebsiteVisibilityIds,
  businessAssociatedWebsites = [],
}) => {
  //   if (!business || currentView !== "edit") return;

  //   setFormData({
  //     authority: business.authorityId?._id || "",
  //     nameEn: business.name || "",
  //     nameHe: business.nameHe || "",
  //     nameAr: business.nameAr || "",
  //     shortDescriptionEn: business.shortDescription || "",
  //     shortDescriptionHe: "",
  //     shortDescriptionAr: "",
  //     fullDescriptionEn: business.description || "",
  //     fullDescriptionHe: "",
  //     fullDescriptionAr: "",
  //     internalNotes: business.internalNotes || "",
  //     slug: business.slug || "",
  //   });
  //   setSelectDmoId(business.dmoId?._id || "");
  // }, [business]);
  const { dmosAuthorities } = useCommon();
  const [selectedFormLanguage, setSelectedFormLanguage] =
    useState<Language>("en");
  const { selectInputClasses, borderColor } = useThemeClasses();
  const dmoSectionRef = useRef<HTMLDivElement | null>(null);

  /* -------- Helpers -------- */

  const getFieldName = (base: string) => {
    if (selectedFormLanguage === "en") return `${base}En`;
    if (selectedFormLanguage === "he") return `${base}He`;
    return `${base}Ar`;
  };

  const getPlaceholder = (type: "name" | "short" | "full") => {
    if (selectedFormLanguage === "en") {
      if (type === "name") return t("business_name");
      if (type === "short") return t("brief_description");
      return t("full_description");
    }

    if (selectedFormLanguage === "he") {
      if (type === "name") return "הזן שם העסק";
      if (type === "short") return "תיאור קצר";
      return "תיאור מלא";
    }

    if (type === "name") return "أدخل اسم العمل";
    if (type === "short") return "وصف مختصر";
    return "وصف كامل";
  };
  const selectedDmos = dmosAuthorities?.find(
    (item) => item?._id === selectedDmoId,
  );

  //websites
  const [allWebsites, setAllWebsites] = useState(false);
  const [selectedWebsites, setSelectedWebsites] = useState<any>([]);
  const websites = [
    { name: "Facebook", icon: <Facebook size={18} /> },
    { name: "Twitter", icon: <Twitter size={18} /> },
    { name: "Instagram", icon: <Instagram size={18} /> },
    { name: "LinkedIn", icon: <Linkedin size={18} /> },
  ];
  const toggleWebsite = (site: any) => {
    if (selectedWebsites.includes(site)) {
      setSelectedWebsites(selectedWebsites.filter((w: any) => w !== site));
    } else {
      setSelectedWebsites([...selectedWebsites, site]);
    }
  };

  const handleAllWebsitesChange = () => {
    setAllWebsites(!allWebsites);
    if (!allWebsites) {
      setSelectedWebsites([]); // clear individual selections when all websites checked
    }
  };

  useEffect(() => {
    markDirty(1);
  }, [formData, selectedWebsites, selectedDmoId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`text-lg ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}
        >
          {t("basic_information")}
        </h3>

        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <Globe
            className={`w-4 h-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
          />
          <select
            value={selectedFormLanguage}
            onChange={(e) =>
              setSelectedFormLanguage(e.target.value as Language)
            }
            className={`px-3 py-1.5 rounded-lg border ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white border-gray-300 text-gray-900"
            } text-sm focus:outline-none focus:ring-2 focus:ring-teal-500`}
          >
            <option value="en">English</option>
            <option value="he">עברית</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </div>

      {/* All Websites
      <div className="">
        <label
          className={`block text-sm mb-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {t("website_visibility")} <span className="text-red-500">*</span>
        </label>

        <div className="mb-4">
          <label
            htmlFor="all-websites"
            className="flex items-center cursor-pointer border rounded p-2 w-full"
            style={{ gap: "0.5rem" }}
          >
            <input
              type="checkbox"
              id="all-websites"
              checked={allWebsites}
              onChange={handleAllWebsitesChange}
              className="flex-shrink-0"
            />
            <Globe className="mr-2" />
            <span>All Websites</span>
          </label>
        </div>

        {!allWebsites && (
          <div className="grid grid-cols-2 gap-4">
            {websites.map(({ name, icon }) => (
              <label
                key={name}
                htmlFor={name}
                className="flex items-center cursor-pointer border rounded p-2 w-full"
                style={{ gap: "0.5rem" }}
              >
                <input
                  type="checkbox"
                  id={name}
                  checked={selectedWebsites.includes(name)}
                  onChange={() => toggleWebsite(name)}
                  className="shrink-0"
                />
                <span className="text-blue-600">{icon}</span> {name}
              </label>
            ))}
          </div>
        )}
      </div> */}
      <DmoAuthorityWebsiteSelector
        errors={errors}
        isEdit={!!businessId}
        selectedDmoId={selectedDmoId ?? ""}
        setSelectDmoId={setSelectDmoId}
        selectedAuthorityId={selectedAuthorityId ?? ""}
        setSelectAuthorityId={setSelectAuthorityId}
        dmoSectionRef={dmoSectionRef}
        websiteVisibilityIds={websiteVisibilityIds}
        setWebsiteVisibilityIds={setWebsiteVisibilityIds}
        itemAssociatedWebsites={businessAssociatedWebsites}
      />
      {/* Business Name */}
      <div>
        <label
          className={`block text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("business_name")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData[getFieldName("name") as keyof BusinessFormData]}
          onChange={(e) =>
            setFormData({
              ...formData,
              [getFieldName("name")]: e.target.value,
            })
          }
          placeholder={getPlaceholder("name")}
          dir={selectedFormLanguage === "en" ? "ltr" : "rtl"}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors[getFieldName("name")]
              ? "border-red-500"
              : theme === "dark"
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white border-gray-300 text-gray-900"
          } focus:outline-none focus:ring-2 focus:ring-teal-500`}
        />
        {errors[getFieldName("name")] && (
          <p className="text-red-500 text-sm mt-1">
            {errors[getFieldName("name")]}
          </p>
        )}
      </div>

      {/* Short Description */}
      <div>
        <label
          className={`block text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("short_description")} <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={3}
          value={
            formData[getFieldName("shortDescription") as keyof BusinessFormData]
          }
          onChange={(e) =>
            setFormData({
              ...formData,
              [getFieldName("shortDescription")]: e.target.value,
            })
          }
          placeholder={getPlaceholder("short")}
          dir={selectedFormLanguage === "en" ? "ltr" : "rtl"}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors[getFieldName("shortDescription")]
              ? "border-red-500"
              : theme === "dark"
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white border-gray-300 text-gray-900"
          } focus:outline-none focus:ring-2 focus:ring-teal-500`}
        />
      </div>

      {/* Full Description */}
      <div>
        <label
          className={`block text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("full_description")} <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={6}
          value={
            formData[getFieldName("fullDescription") as keyof BusinessFormData]
          }
          onChange={(e) =>
            setFormData({
              ...formData,
              [getFieldName("fullDescription")]: e.target.value,
            })
          }
          placeholder={getPlaceholder("full")}
          dir={selectedFormLanguage === "en" ? "ltr" : "rtl"}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors[getFieldName("fullDescription")]
              ? "border-red-500"
              : theme === "dark"
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white border-gray-300 text-gray-900"
          } focus:outline-none focus:ring-2 focus:ring-teal-500`}
        />
      </div>

      {/* Internal Notes */}
      {canApprove && (
        <div>
          <label
            className={`block text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
          >
            {t("internal_notes")}
            <span className="text-xs ml-2 text-gray-500">
              ({t("visible_only_to_admins")})
            </span>
          </label>
          <textarea
            rows={3}
            value={formData.internalNotes}
            onChange={(e) =>
              setFormData({ ...formData, internalNotes: e.target.value })
            }
            placeholder={t("add_internal_notes")}
            className={`w-full px-4 py-2 rounded-lg border ${borderColor} focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>
      )}
    </div>
  );
};

export default BusinessBasicInfos;
