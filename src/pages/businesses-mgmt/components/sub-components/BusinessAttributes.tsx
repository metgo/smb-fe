import type { FC } from "react";
import { X } from "lucide-react";

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
}

/* ---------------- Constants ---------------- */

const PRIMARY_CATEGORIES = [
  { value: "food", label: "Food & Dining" },
  { value: "accommodation", label: "Accommodation" },
  { value: "tourism", label: "Tourism" },
  { value: "shopping", label: "Shopping" },
  { value: "culture", label: "Culture" },
];

const ACCESSIBILITY_OPTIONS = [
  "Wheelchair Accessible",
  "Accessible Parking",
  "Accessible Restrooms",
  "Sign Language",
];

const GROUP_TYPES = [
  "Families",
  "Couples",
  "Groups",
  "Individuals",
  "Seniors",
  "Corporate",
];

/* ---------------- Component ---------------- */

const BusinessAttributes: FC<BusinessAttributesProps> = ({
  t,
  theme,
  formData,
  setFormData,
  errors,
}) => {
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
          {PRIMARY_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        {errors.primaryCategory && (
          <p className="text-red-500 text-sm mt-1">{errors.primaryCategory}</p>
        )}
      </div>

      {/* Service Type */}
      <div>
        <label
          className={`block text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("service_type")}
        </label>
        <select
          value={formData.serviceType}
          onChange={(e) =>
            setFormData({ ...formData, serviceType: e.target.value })
          }
          className={`w-full px-4 py-2 rounded-lg border ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700 text-gray-200"
              : "bg-white border-gray-300 text-gray-900"
          } focus:outline-none focus:ring-2 focus:ring-teal-500`}
        >
          <option value="">{t("select")}</option>
          <option value="B2C">B2C</option>
          <option value="B2B">B2B</option>
          <option value="Both">Both</option>
        </select>
      </div>

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

      {/* Accessibility */}
      <div>
        <label
          className={`block text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("accessibility")}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {ACCESSIBILITY_OPTIONS.map((option) => {
            const isChecked = formData.accessibility.includes(option);

            return (
              <label
                key={option}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
                  isChecked
                    ? theme === "dark"
                      ? "bg-teal-900/30 border-teal-600"
                      : "bg-teal-50 border-teal-600"
                    : theme === "dark"
                      ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                      : "bg-white border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      accessibility: isChecked
                        ? formData.accessibility.filter((a) => a !== option)
                        : [...formData.accessibility, option],
                    })
                  }
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span
                  className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                >
                  {option}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Group Types */}
      <div>
        <label
          className={`block text-sm mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("group_types")}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {GROUP_TYPES.map((type) => {
            const isChecked = formData.groupTypes.includes(type);

            return (
              <label
                key={type}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
                  isChecked
                    ? theme === "dark"
                      ? "bg-purple-900/30 border-purple-600"
                      : "bg-purple-50 border-purple-600"
                    : theme === "dark"
                      ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                      : "bg-white border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      groupTypes: isChecked
                        ? formData.groupTypes.filter((g) => g !== type)
                        : [...formData.groupTypes, type],
                    })
                  }
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span
                  className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                >
                  {type}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BusinessAttributes;
