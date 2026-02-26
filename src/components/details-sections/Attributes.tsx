import { useEffect, useState, type FC } from "react";
import { X } from "lucide-react";
import { SelectableChips } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useCommon } from "@/hooks/useCommon";
import { useTranslation } from "react-i18next";
import { useGenerateTagsMutation } from "@/store/api/masterDataApi";

interface Tag {
  en: string;
  he: string;
  ar: string;
}

interface AttributesFormData {
  primaryCategory: string;
  serviceType: string;
  tags: Tag[];
  accessibility: string[];
  groupTypes: string[];
}

interface FormErrors {
  primaryCategory?: string;
}
type View = "list" | "details" | "create" | "edit" | undefined;

interface AttributesProps {
  name: string;
  description: string;
  formData: AttributesFormData;
  setFormData: (data: AttributesFormData) => void;
  errors: FormErrors;
  selectedGroupTypesId: string[];
  setGroupTypesId: (v: string[]) => void;
  selectedAccessiblitiesId: string[];
  setAccessiblitiesId: (v: string[]) => void;
  currentView?: View;
  productId?: any;
}

const Attributes: FC<AttributesProps> = ({
  errors,
  name,
  description,
  formData,
  setFormData,
  setGroupTypesId,
  selectedGroupTypesId,
  selectedAccessiblitiesId,
  setAccessiblitiesId,
  currentView,
  productId,
}) => {
  const { t } = useTranslation("common");
  const { isDark } = useThemeClasses();
  const { categories, accessibility, groupTypes, subCategories } = useCommon();

  const [getGeneratedTags] = useGenerateTagsMutation();

  const [tagInput, setTagInput] = useState<string>("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [selectedTagIndex, setSelectedTagIndex] = useState(0);

  useEffect(() => {
    if (currentView === "edit" || productId) return;
    if (!name && !description) return;

    getGeneratedTags({ name, description }).then((res: any) => {
      if (res?.data?.length) {
        const newTags: Tag[] = res.data
          .filter((tag: Tag) => {
            return !formData.tags.some((existing) => existing.en === tag.en);
          })
          .map((tag: any) => ({
            en: tag.en || "",
            he: tag.he || "",
            ar: tag.ar || "",
          }));

        if (newTags.length > 0) {
          setFormData({
            ...formData,
            tags: [...formData.tags, ...newTags],
          });
        }
      }
    });
  }, [name, description, setFormData]);
  console.log("🚀 ~ Attributes ~ formData:", formData.tags);

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
        label="accessiblities"
        items={accessibility}
        selectedIds={selectedAccessiblitiesId}
        onSelect={handleAccessibilitySelect}
      />
      <SelectableChips
        label="group_types"
        items={groupTypes}
        selectedIds={selectedGroupTypesId}
        onSelect={handleGroupTypeSelect}
      />

      {/* Tags */}
      <div>
        <label
          className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("tags")}
        </label>

        <p
          className={`text-xs mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
        >
          {t("tag_input_hint")}
        </p>

        <div
          className={`relative p-3 rounded-lg border min-h-14 ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
          }`}
        >
          <div className="flex flex-wrap gap-2 items-center">
            {/* Render existing tags */}
            {formData.tags.map((tag, idx) => (
              <span
                key={`${tag.en}-${idx}`}
                className="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-400 rounded flex items-center gap-1 text-sm"
              >
                {tag.en}
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
              placeholder={t("add_tag_placeholder")}
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                setShowTagSuggestions(e.target.value.trim().length > 0);
                setSelectedTagIndex(0);
              }}
              onKeyDown={(e) => {
                const filteredSuggestions =
                  subCategories?.filter(
                    (item: any) =>
                      item.name
                        ?.toLowerCase()
                        .includes(tagInput.toLowerCase()) &&
                      !formData.tags.some((t) => t.en === item.name),
                  ) ?? [];

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
                      tags: [
                        ...formData.tags,
                        { en: selected, he: "", ar: "" },
                      ],
                    });
                  } else if (tagInput.trim()) {
                    setFormData({
                      ...formData,
                      tags: [
                        ...formData.tags,
                        { en: tagInput.trim(), he: "", ar: "" },
                      ],
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
                      tags: [
                        ...formData.tags,
                        { en: tagInput.trim(), he: "", ar: "" },
                      ],
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
              const filteredSuggestions =
                subCategories?.filter(
                  (item: any) =>
                    item?.name
                      ?.toLowerCase()
                      ?.includes(tagInput.toLowerCase()) &&
                    !formData.tags.some((t) => t.en === item.name),
                ) ?? [];

              if (filteredSuggestions.length === 0) return null;

              return (
                <div
                  className={`absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto rounded-lg border shadow-lg z-50 ${
                    isDark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-300"
                  }`}
                >
                  {filteredSuggestions.map((item: any, idx: number) => (
                    <button
                      key={item._id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setFormData({
                          ...formData,
                          tags: [
                            ...formData.tags,
                            { en: item.name, he: "", ar: "" },
                          ],
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

export default Attributes;
