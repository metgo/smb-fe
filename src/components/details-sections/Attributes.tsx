import { useEffect, useState, type FC } from "react";
import { X } from "lucide-react";
import { SelectableChips } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useCommon } from "@/hooks/useCommon";
import { useTranslation } from "react-i18next";
import { useGenerateTagsMutation } from "@/store/api/masterDataApi";
import { getLngWiseStr } from "@/helpers";

interface Tag {
  en: string;
  he: string;
  ar: string;
}

interface AttributesFormData {
  nameEn: string;
  nameHe: string;
  nameAr: string;
  fullDescriptionEn: string;
  fullDescriptionHe: string;
  fullDescriptionAr: string;
  primaryCategory: string;
  serviceType: string;
  tags: Tag[];
  accessibility: string[];
  groupTypes: string[];
}

interface FormErrors {
  primaryCategory?: string;
}

interface AttributesProps {
  name: string;
  description: string;
  formData: AttributesFormData;
  setFormData: (data: AttributesFormData) => void;
  editData?: any;
  selectedFormLanguage: Language;
  errors: FormErrors;
  selectedGroupTypesId: string[];
  setGroupTypesId: (v: string[]) => void;
  selectedAccessiblitiesId: string[];
  setAccessiblitiesId: (v: string[]) => void;
  opMode?: string;
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
  editData,
  selectedFormLanguage,
}) => {
  const currentName = getLngWiseStr(
    selectedFormLanguage,
    formData?.nameEn,
    formData?.nameHe,
    formData?.nameAr,
  );
  const currentDescription = getLngWiseStr(
    selectedFormLanguage,
    formData?.fullDescriptionEn,
    formData?.fullDescriptionHe,
    formData?.fullDescriptionAr,
  );

  const originalName = getLngWiseStr(
    selectedFormLanguage,
    editData?.name,
    editData?.nameHe,
    editData?.nameAr,
  );

  const originalDescription = getLngWiseStr(
    selectedFormLanguage,
    editData?.description,
    editData?.descriptionHe,
    editData?.descriptionAr,
  );

  const isNameChanged = () => {
    return currentName !== originalName;
  };
  const isDescriptionChanged = () => {
    return currentDescription !== originalDescription;
  };
  const { t } = useTranslation("common");
  const { isDark, language } = useThemeClasses();
  const { categories, accessibility, groupTypes, allTags } = useCommon();
  const [getGeneratedTags] = useGenerateTagsMutation();

  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [selectedTagIndex, setSelectedTagIndex] = useState(0);

  /* ---------------- Helpers ---------------- */

  const getValueByLanguage = (item: any) => {
    if (language === "en") return item.name;
    if (language === "he") return item.nameHe;
    return item.nameAr;
  };

  const createTagByLanguage = (value: string): Tag => ({
    en: language === "en" ? value : "",
    he: language === "he" ? value : "",
    ar: language === "ar" ? value : "",
  });

  const isDuplicateTag = (value: string) =>
    formData.tags.some(
      (tag) => tag[language]?.toLowerCase() === value.toLowerCase(),
    );

  const filteredSuggestions =
    allTags?.filter((item: any) => {
      const value = getValueByLanguage(item);

      return (
        typeof value === "string" &&
        value.trim().toLowerCase().includes(tagInput.toLowerCase()) &&
        !isDuplicateTag(value)
      );
    }) ?? [];

  /* ---------------- Auto Generate Tags ---------------- */

  useEffect(() => {
    const currentName = getLngWiseStr(
      selectedFormLanguage,
      formData?.nameEn,
      formData?.nameHe,
      formData?.nameAr,
    );
    const currentDescription = getLngWiseStr(
      selectedFormLanguage,
      formData?.fullDescriptionEn,
      formData?.fullDescriptionHe,
      formData?.fullDescriptionAr,
    );

    if (!isNameChanged() && !isDescriptionChanged()) return;
    if (!currentName && !currentDescription) return;

    getGeneratedTags({
      name: currentName,
      description: currentDescription,
    }).then((res: any) => {
      if (res?.data?.length) {
        const newTags: Tag[] = res.data
          .filter((tag: Tag) => !formData.tags.some((t) => t.en === tag.en))
          .map((tag: Tag) => ({
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
  }, [name, description]);

  /* ---------------- Handlers ---------------- */

  const handleAddTag = (value: string) => {
    if (!value.trim() || isDuplicateTag(value)) return;

    setFormData({
      ...formData,
      tags: [...formData.tags, createTagByLanguage(value.trim())],
    });

    setTagInput("");
    setShowTagSuggestions(false);
    setSelectedTagIndex(0);
  };

  const handleRemoveTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      {/* Primary Category */}
      <div>
        <label
          className={`block text-sm mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("primary_category")} <span className="text-red-500">*</span>
        </label>

        <div className="grid grid-cols-6 gap-3">
          {categories?.map((cat: any) => {
            const isSelected = formData.primaryCategory === cat._id;

            return (
              <button
                key={cat._id}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, primaryCategory: cat._id })
                }
                className={`
                w-full h-32 flex flex-col items-center justify-center gap-2 rounded-md border transition-all
                ${
                  isSelected
                    ? "border-4 border-teal-600 text-teal-600"
                    : isDark
                      ? "border border-gray-700 text-gray-300 hover:border-teal-500"
                      : "border border-gray-300 text-gray-700 hover:border-teal-500"
                }
              `}
              >
                {/* Icon */}
                <img
                  src={cat.icon?.iconPath}
                  alt={cat.icon?.iconAlt || cat.name}
                  className={`w-14 h-14 object-contain transition-all ${
                    isSelected ? "" : "opacity-70"
                  }`}
                />

                {/* Text */}
                <span className="text-sm font-medium text-center">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
        {errors.primaryCategory && (
          <p className="text-red-500 text-sm mt-1">{errors.primaryCategory}</p>
        )}
      </div>

      <SelectableChips
        label="accessiblities"
        items={accessibility}
        selectedIds={selectedAccessiblitiesId}
        onSelect={(itemId: string) =>
          setAccessiblitiesId(
            selectedAccessiblitiesId.includes(itemId)
              ? selectedAccessiblitiesId.filter((id) => id !== itemId)
              : [...selectedAccessiblitiesId, itemId],
          )
        }
      />

      <SelectableChips
        label="group_types"
        items={groupTypes}
        selectedIds={selectedGroupTypesId}
        onSelect={(itemId: string) =>
          setGroupTypesId(
            selectedGroupTypesId.includes(itemId)
              ? selectedGroupTypesId.filter((id) => id !== itemId)
              : [...selectedGroupTypesId, itemId],
          )
        }
      />

      {/* Tags */}
      <div>
        <label
          className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("tags")}
        </label>

        <div
          className={`relative p-3 rounded-lg border min-h-14 ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
          }`}
        >
          <div className="flex flex-wrap gap-2 items-center">
            {formData.tags
              .filter((tag) => tag?.[language]?.trim())
              .map((tag, idx) => (
                <span
                  key={`${tag.en}-${idx}`}
                  className="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-400 rounded flex items-center gap-1 text-sm"
                >
                  {tag[language]}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

            <input
              type="text"
              value={tagInput}
              placeholder={t("add_tag_placeholder")}
              onChange={(e) => {
                setTagInput(e.target.value);
                setShowTagSuggestions(e.target.value.trim().length > 0);
                setSelectedTagIndex(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setSelectedTagIndex((prev) =>
                    prev < filteredSuggestions.length - 1 ? prev + 1 : prev,
                  );
                }

                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setSelectedTagIndex((prev) => (prev > 0 ? prev - 1 : 0));
                }

                if (e.key === "Enter") {
                  e.preventDefault();

                  if (showTagSuggestions && filteredSuggestions.length > 0) {
                    const selected = filteredSuggestions[selectedTagIndex];
                    setFormData({
                      ...formData,
                      tags: [
                        ...formData.tags,
                        {
                          en: selected.name || "",
                          he: selected.nameHe || "",
                          ar: selected.nameAr || "",
                        },
                      ],
                    });
                  } else {
                    handleAddTag(tagInput);
                  }
                }

                if (e.key === ",") {
                  e.preventDefault();
                  handleAddTag(tagInput);
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

          {showTagSuggestions && filteredSuggestions?.length > 0 && (
            <div
              className={`absolute left-0 right-0 top-full mt-1 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-lg border shadow-lg z-50 ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-300"
              }`}
            >
              {filteredSuggestions.map((item: any, idx: number) => {
                const value = getValueByLanguage(item);

                return (
                  <button
                    key={item._id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setFormData({
                        ...formData,
                        tags: [
                          ...formData.tags,
                          {
                            en: item.name || "",
                            he: item.nameHe || "",
                            ar: item.nameAr || "",
                          },
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
                    {value}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attributes;
