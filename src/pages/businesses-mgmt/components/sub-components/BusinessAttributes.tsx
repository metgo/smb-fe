import type { FC } from "react";
import {  X } from "lucide-react";
import {
  useGetAccessibilityQuery,
  useGetCategoriesQuery,
  useGetGroupTypesQuery,
} from "@/store/api/masterDataApi";
import { useTranslation } from "react-i18next";
import { SelectableChips } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";

/* ---------------- Types ---------------- */

type ThemeMode = "dark" | "light";

interface BusinessAttributesFormData {
  primaryCategory: string;
  serviceType: string;
  tags: string[];
  accessibility: string[];
  groupTypes: string[];
}

interface FormErrors {
  primaryCategory?: string;
}

interface BusinessAttributesProps {
  t: (key: string) => string;
  theme: ThemeMode;
  formData: BusinessAttributesFormData;
  setFormData: (data: BusinessAttributesFormData) => void;
  errors: FormErrors;

  selectedGroupTypesId: string[];
  setGroupTypesId: (v: string[]) => void;
  selectedAccessiblitiesId: string[];
  setAccessiblitiesId: (v: string[]) => void;
}

/* ---------------- Constants ---------------- */

// const PRIMARY_CATEGORIES = [
//   { value: "food", label: "Food & Dining" },
//   { value: "accommodation", label: "Accommodation" },
//   { value: "tourism", label: "Tourism" },
//   { value: "shopping", label: "Shopping" },
//   { value: "culture", label: "Culture" },
// ];

// const ACCESSIBILITY_OPTIONS = [
//   "Wheelchair Accessible",
//   "Accessible Parking",
//   "Accessible Restrooms",
//   "Sign Language",
// ];

// const GROUP_TYPES = [
//   "Families",
//   "Couples",
//   "Groups",
//   "Individuals",
//   "Seniors",
//   "Corporate",
// ];

/* ---------------- Component ---------------- */

const BusinessAttributes: FC<BusinessAttributesProps> = ({
  t,
  theme,
  formData,
  setFormData,
  errors,
  selectedGroupTypesId,
  setGroupTypesId,
  selectedAccessiblitiesId,
  setAccessiblitiesId,
}) => {
  const { i18n } = useTranslation("businesses");
  const locale = i18n.language as Language;
  const { textSecondary } = useThemeClasses();
  const { data: accessibility, isLoading: isLoadingAccessibility } =
    useGetAccessibilityQuery({ locale });
  const { data: groupTypes, isLoading: isLoadingGroupTypes } =
    useGetGroupTypesQuery({ locale });

  const { data: primaryCategories } = useGetCategoriesQuery({ locale });

  const handleGroupTypeSelect = (itemId: string) => {
    const exists = selectedGroupTypesId?.some((id) => id === itemId);

    if (exists) {
      const updated = selectedGroupTypesId?.filter((id) => id !== itemId);
      setGroupTypesId(updated);
    } else {
      setGroupTypesId([...selectedGroupTypesId, itemId]);
    }
  };

  const handleAccessibilitySelect = (itemId: string) => {
    const exists = selectedAccessiblitiesId?.some((id) => id === itemId);

    if (exists) {
      const updated = selectedAccessiblitiesId?.filter((id) => id !== itemId);
      setAccessiblitiesId(updated);
    } else {
      setAccessiblitiesId([...selectedAccessiblitiesId, itemId]);
    }
  };
  console.log("primary category", primaryCategories);
  return (
    <div className="space-y-6">
      {/* Primary Category */}
      <div>
        <label
          className={`block text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("primary_category")} *
        </label>
        <select
          value={formData.primaryCategory}
          onChange={(e) =>
            setFormData({ ...formData, primaryCategory: e.target.value })
          }
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.primaryCategory
              ? "border-red-500"
              : theme === "dark"
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white border-gray-300 text-gray-900"
          } focus:outline-none focus:ring-2 focus:ring-teal-500`}
        >
          <option value="">{t("select")}</option>
          {primaryCategories?.datas?.data.map((cat: any) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.primaryCategory && (
          <p className="text-red-500 text-sm mt-1">{errors.primaryCategory}</p>
        )}
      </div>
      {isLoadingAccessibility ? (
        <div
          style={{
            textAlign: "center",
            fontSize: "16px",
            color: "green",
            padding: "10px 0",
            fontWeight: "500",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Loading Accessibilities
        </div>
      ) : (
        <SelectableChips
          label="Accessiblities"
          items={accessibility?.datas?.data}
          selectedIds={selectedAccessiblitiesId}
          onSelect={handleAccessibilitySelect}
          textSecondary={textSecondary}
        />
      )}
      {isLoadingGroupTypes ? (
        <div
          style={{
            textAlign: "center",
            fontSize: "16px",
            color: "green",
            padding: "10px 0",
            fontWeight: "500",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Loading Group Types
        </div>
      ) : (
        <SelectableChips
          label="Group Types"
          items={groupTypes?.datas?.data}
          selectedIds={selectedGroupTypesId}
          onSelect={handleGroupTypeSelect}
          textSecondary={textSecondary}
        />
      )}

      {/* Tags */}
      <div>
        <label
          className={`block text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("tags")}
        </label>
        <div
          className={`p-3 rounded-lg border min-h-[100px] ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-300"
          }`}
        >
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-400 rounded flex items-center gap-1 text-sm"
              >
                {tag}
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      tags: formData.tags.filter((_, i) => i !== idx),
                    })
                  }
                  className="hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            <input
              type="text"
              placeholder={t("add_tag")}
              onKeyDown={(e) => {
                if (
                  (e.key === "Enter" || e.key === ",") &&
                  e.currentTarget.value.trim()
                ) {
                  e.preventDefault();
                  const newTag = e.currentTarget.value.trim();
                  setFormData({
                    ...formData,
                    tags: [...formData.tags, newTag],
                  });
                  e.currentTarget.value = "";
                }
              }}
              className={`px-2 py-1 bg-transparent outline-none text-sm ${
                theme === "dark" ? "text-gray-200" : "text-gray-900"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessAttributes;
