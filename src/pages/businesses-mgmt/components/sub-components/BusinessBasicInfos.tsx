import { useState, type FC } from "react";
import { ChevronDown } from "lucide-react";
import { useCommon } from "@/hooks/useCommon";
import clsx from "clsx";
import { Globe, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

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

interface BusinessBasicInfosProps {
  theme: Theme;
  t: (key: string) => string;
  formData: BusinessFormData;
  setFormData: (data: BusinessFormData) => void;

  errors: FormErrors;
  canApprove: boolean;
  selectedDmoId?: string;
  setSelectDmoId: React.Dispatch<React.SetStateAction<string>>;

  selectedAuthorityId?: string;
  setSelectAuthorityId: React.Dispatch<React.SetStateAction<string>>;
  eventName?: string;
}

/* ---------------- Component ---------------- */
// // Authority options for the Western Negev region
// const AUTHORITIES = [
//   "Be'er Sheva",
//   "Sderot",
//   "Netivot",
//   "Ofakim",
//   "Arad",
//   "Dimona",
//   "Yeruham",
//   "Rahat",
//   "Regional Council - Sha'ar HaNegev",
//   "Regional Council - Eshkol",
//   "Regional Council - Sdot Negev",
//   "Regional Council - Merhavim",
//   "Regional Council - Bnei Shimon",
// ];

const BusinessBasicInfos: FC<BusinessBasicInfosProps> = ({
  t,
  theme,
  formData,
  setFormData,
  errors,
  canApprove,
  selectedDmoId,
  setSelectDmoId,
  setSelectAuthorityId,
}) => {
  const [selectedFormLanguage, setSelectedFormLanguage] = useState<
    "en" | "he" | "ar"
  >("en");
  const { dmosAuthorities } = useCommon();

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
      setSelectedWebsites(selectedWebsites.filter((w:any) => w !== site));
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
      <div className="flex-1">
        <label className={`block text-sm  mb-3 `}>
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
      </div>
      {/* Authority */}
      <div className="flex-1">
        <label className={`block text-sm  mb-3 `}>
          {t("select_authority")} <span className="text-red-500">*</span>
        </label>
        <div className=" w-full relative">
          <select
            value={formData.authority}
            onChange={(e) =>
              setFormData({ ...formData, authority: e.target.value })
            }
            className={clsx(
              "appearance-none h-12 w-full border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-45",
              // selectInputClasses
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
      </div>

      {/* All Websites */}
      <div className="">
        <label
          className={`block text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("website_visibility")} *
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
                  className="flex-shrink-0"
                />
                <span className="text-blue-600">{icon}</span> {name}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Business Name */}
      <div>
        <label
          className={`block text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("business_name")} *
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

      {/* Slug */}
      <div>
        <label
          className={`block text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("slug")} ({t("auto_generated")})
        </label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className={`w-full px-4 py-2 rounded-lg border ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700 text-gray-200"
              : "bg-white border-gray-300 text-gray-900"
          } focus:outline-none focus:ring-2 focus:ring-teal-500`}
        />
      </div>

      {/* Short Description */}
      <div>
        <label
          className={`block text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("short_description")} *
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
          {t("full_description")} *
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
            className={`w-full px-4 py-2 rounded-lg border ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white border-gray-300 text-gray-900"
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>
      )}
    </div>
  );
};

export default BusinessBasicInfos;
