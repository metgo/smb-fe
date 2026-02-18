import { useState, type FC } from "react";
import { X } from "lucide-react";
import { SelectableChips } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useCommon } from "@/hooks/useCommon";

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
  formData: BusinessAttributesFormData;
  setFormData: (data: BusinessAttributesFormData) => void;
  errors: FormErrors;
  selectedGroupTypesId: string[];
  setGroupTypesId: (v: string[]) => void;
  selectedAccessiblitiesId: string[];
  setAccessiblitiesId: (v: string[]) => void;
}

/* ---------------- Component ---------------- */

const BusinessAttributes: FC<BusinessAttributesProps> = ({
  t,
  errors,
  formData,
  setFormData,
  setGroupTypesId,
  selectedGroupTypesId,
  selectedAccessiblitiesId,
  setAccessiblitiesId,
}) => {
  const { isDark } = useThemeClasses();
  const { categories, accessibility, groupTypes, subCategories } = useCommon();

  // Tag autocomplete states
  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [selectedTagIndex, setSelectedTagIndex] = useState(0);

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

  return (
    <div className="space-y-6">
      {/* Primary Category */}
      <div>
        <label
          className={`block text-sm mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("primary_category")} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.primaryCategory}
          onChange={(e) =>
            setFormData({ ...formData, primaryCategory: e.target.value })
          }
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.primaryCategory
              ? "border-red-500"
              : isDark
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white border-gray-300 text-gray-900"
          } focus:outline-none focus:ring-2 focus:ring-teal-500`}
        >
          <option value="">{t("select")}</option>
          {categories?.map((cat: any) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.primaryCategory && (
          <p className="text-red-500 text-sm mt-1">{errors.primaryCategory}</p>
        )}
      </div>

      <SelectableChips
        label="Accessiblities"
        items={accessibility}
        selectedIds={selectedAccessiblitiesId}
        onSelect={handleAccessibilitySelect}
      />
      <SelectableChips
        label="Group Types"
        items={groupTypes}
        selectedIds={selectedGroupTypesId}
        onSelect={handleGroupTypeSelect}
      />

      {/* Tags */}
      <div>
        <label
          className={`block text-sm mb-1 ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {t("tags")}
        </label>

        {/* Info text */}
        <p
          className={`text-xs mb-2 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Type a tag and press <span className="font-medium">comma (,)</span> to
          add
        </p>

        <div
          className={`relative p-3 rounded-lg border min-h-14 ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
          }`}
        >
          <div className="flex flex-wrap gap-2 items-center">
            {/* Existing tags */}
            {formData.tags.map((tag: string, idx: number) => (
              <span
                key={`${tag}-${idx}`}
                className="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-400 rounded flex items-center gap-1 text-sm"
              >
                {tag}
                <button
                  type="button"
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

            {/* Input */}
            <input
              type="text"
              placeholder="Add tag..."
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                setShowTagSuggestions(e.target.value.trim().length > 0);
                setSelectedTagIndex(0);
              }}
              onKeyDown={(e) => {
                const filteredSuggestions = subCategories?.filter(
                  (item: any) =>
                    item.name.toLowerCase().includes(tagInput.toLowerCase()) &&
                    !formData.tags.includes(item.name),
                );

                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setSelectedTagIndex((prev) =>
                    prev < filteredSuggestions.length - 1 ? prev + 1 : prev,
                  );
                  return;
                }

                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setSelectedTagIndex((prev) => (prev > 0 ? prev - 1 : 0));
                  return;
                }

                if (e.key === "Enter") {
                  e.preventDefault();

                  if (showTagSuggestions && filteredSuggestions.length > 0) {
                    const selected = filteredSuggestions[selectedTagIndex].name;

                    setFormData({
                      ...formData,
                      tags: [...formData.tags, selected],
                    });
                  } else if (tagInput.trim()) {
                    setFormData({
                      ...formData,
                      tags: [...formData.tags, tagInput.trim()],
                    });
                  }

                  setTagInput("");
                  setShowTagSuggestions(false);
                  setSelectedTagIndex(0);
                  return;
                }

                if (e.key === ",") {
                  e.preventDefault();
                  if (tagInput.trim()) {
                    setFormData({
                      ...formData,
                      tags: [...formData.tags, tagInput.trim()],
                    });
                    setTagInput("");
                    setShowTagSuggestions(false);
                    setSelectedTagIndex(0);
                  }
                }

                if (e.key === "Escape") {
                  setShowTagSuggestions(false);
                }
              }}
              onBlur={() => setTimeout(() => setShowTagSuggestions(false), 150)}
              onFocus={() => tagInput.trim() && setShowTagSuggestions(true)}
              className={`flex-1 min-w-30 px-2 py-1 bg-transparent outline-none text-sm ${
                isDark ? "text-gray-200" : "text-gray-900"
              }`}
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showTagSuggestions &&
            (() => {
              const filteredSuggestions = subCategories?.filter(
                (item: any) =>
                  item.name.toLowerCase().includes(tagInput.toLowerCase()) &&
                  !formData.tags.includes(item.name),
              );

              if (!filteredSuggestions || filteredSuggestions.length === 0)
                return null;

              return (
                <div
                  className={`absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto rounded-lg border shadow-lg z-50 ${
                    isDark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-300"
                  }`}
                >
                  {filteredSuggestions?.map((item: any, idx: number) => (
                    <button
                      key={item._id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setFormData({
                          ...formData,
                          tags: [...formData.tags, item.name],
                        });
                        setTagInput("");
                        setShowTagSuggestions(false);
                        setSelectedTagIndex(0);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        idx === selectedTagIndex
                          ? isDark
                            ? "bg-teal-900/30 text-teal-400"
                            : "bg-teal-50 text-teal-800"
                          : isDark
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              );
            })()}
        </div>
      </div>
    </div>
  );
};

export default BusinessAttributes;
