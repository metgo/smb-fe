import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { X, Sparkles, Loader2, Trash2, Tag } from "lucide-react";
import { useEffect, useRef, useState, type FC } from "react";

import { useCommon } from "@/hooks/useCommon";
import { SelectableChips } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useGenerateTagsMutation } from "@/store/api/masterDataApi";
import { groupForDbCategory, taxonomyLabel } from "@/lib/businessTaxonomy";
import { CategoryPicker } from "@/pages/onboarding/CategorySteps";
import type { CategorySelection } from "@/pages/onboarding/categorySelection";

/** A category's name in the UI language, falling back to the taxonomy. */
const categoryLabel = (cat: any, language: string) => {
  const group = groupForDbCategory(cat);
  if (language === "he")
    return cat.nameHe || cat.hebrewName || (group && group.he) || cat.name;
  if (language === "ar") return cat.nameAr || (group && group.ar) || cat.name;
  return cat.name || (group && taxonomyLabel(group, "en"));
};

/**
 * The category's taxonomy icon. Uploaded icon images were often missing,
 * which showed a broken image, so the uploaded image is only a fallback.
 */
const CategoryIcon: FC<{ cat: any; className: string }> = ({
  cat,
  className,
}) => {
  const [broken, setBroken] = useState(false);
  const Icon = groupForDbCategory(cat)?.icon;
  if (Icon) return <Icon className={className} strokeWidth={1.6} aria-hidden />;
  if (cat.icon?.iconPath && !broken) {
    return (
      <img
        src={cat.icon.iconPath}
        alt=""
        onError={() => setBroken(true)}
        className={`${className} object-contain`}
      />
    );
  }
  return <Tag className={className} strokeWidth={1.6} aria-hidden />;
};

interface AttributesFormData {
  tags: string[];
  primaryCategory?: string;
  [key: string]: any;
}

interface FormErrors {
  primaryCategory?: string;
}

interface AttributesProps {
  formData: AttributesFormData;
  setFormData: (data: AttributesFormData) => void;
  editData?: any;
  selectedFormLanguage: Language;
  errors: FormErrors;
  selectedGroupTypesId?: string[];
  setGroupTypesId?: (v: string[]) => void;
  selectedAccessiblitiesId?: string[];
  setAccessiblitiesId?: (v: string[]) => void;
  opMode?: string;
  variant?: "full" | "tagsOnly";
  /**
   * When given, the business's areas and subcategories are picked with the
   * two-step taxonomy picker instead of the single primary category cards.
   */
  categorySelection?: CategorySelection;
  onCategorySelectionChange?: (next: CategorySelection) => void;
  /** Parent computes this from its OWN field names (e.g. name/nameHe/nameAr for business, title/titleHe/titleAr for poi) */
  nameForGen: string;
  /** Parent computes this from its OWN field names (e.g. fullDescription* for business, shortDescription* or content* for poi) */
  descriptionForGen: string;
}

const Attributes: FC<AttributesProps> = ({
  errors,
  formData,
  setFormData,
  setGroupTypesId = () => {},
  selectedGroupTypesId = [],
  selectedAccessiblitiesId = [],
  setAccessiblitiesId = () => {},
  editData,
  variant = "full",
  nameForGen,
  descriptionForGen,
  categorySelection,
  onCategorySelectionChange,
}) => {
  const { t, i18n } = useTranslation("common");
  const { isDark, language } = useThemeClasses();
  const { categories, accessibility, groupTypes, allTags } = useCommon();
  const [getGeneratedTags, { isLoading }] = useGenerateTagsMutation();

  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [selectedTagIndex, setSelectedTagIndex] = useState(0);
  const selectedCatRef = useRef<HTMLButtonElement | null>(null);
  const hasGeneratedRef = useRef(false);

  useEffect(() => {
    selectedCatRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [formData.primaryCategory]);

  /* ---------------- Helpers ---------------- */

  const getValueByLanguage = (item: any) => {
    if (language === "en") return item.name;
    if (language === "he") return item.nameHe;
    return item.nameAr;
  };

  const createTagByLanguage = (value: string): string => value;

  const isDuplicateTag = (value: string) =>
    formData?.tags?.some((tag) => tag?.toLowerCase() === value?.toLowerCase());

  const filteredSuggestions =
    allTags?.filter((item: any) => {
      const value = getValueByLanguage(item);

      return (
        typeof value === "string" &&
        value?.trim()?.toLowerCase()?.includes(tagInput?.toLowerCase()) &&
        !isDuplicateTag(value)
      );
    }) ?? [];

  const clearTags = () => {
    setFormData({
      ...formData,
      tags: [],
    });
  };

  /* ---------------- Reset generated flag on record change ---------------- */
  useEffect(() => {
    hasGeneratedRef.current = false;
  }, [editData?._id]);

  /* ---------------- Generate Tags (manual trigger) ---------------- */
  const handleGenerateTags = () => {
    if (!nameForGen && !descriptionForGen) return;

    getGeneratedTags({
      name: nameForGen,
      description: descriptionForGen,
      locale: language,
    })
      .then((res: any) => {
        if (!res?.data?.length) return;

        const newTags: string[] = res?.data
          ?.filter((tag: string) => !formData?.tags?.some((t) => t === tag))
          ?.map((tag: string) => tag);

        if (newTags.length > 0) {
          setFormData({
            ...formData,
            tags: [...formData.tags, ...newTags],
          });
        }

        hasGeneratedRef.current = true;
      })
      .catch((err) => {
        console.error("Tag generation failed:", err);
        toast.error(
          t("service_unavailable", {
            defaultValue: "This service is unavailable at the moment",
          }),
        );
      });
  };

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
    const newTags = formData.tags.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      tags: newTags,
    });
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="relative">
      <div className="space-y-6">
        {variant === "full" && (
          <>
            {categorySelection && onCategorySelectionChange ? (
              <CategoryPicker
                selection={categorySelection}
                onChange={onCategorySelectionChange}
                error={errors.primaryCategory}
              />
            ) : (
              <div>
                <label
                  className={`block text-sm mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  {t("primary_category")}{" "}
                  <span className="text-red-500">*</span>
                </label>

                <div className="flex gap-1 md:gap-3 overflow-x-auto pb-2">
                  {categories?.map((cat: any) => {
                    const isSelected = formData.primaryCategory === cat._id;

                    return (
                      <button
                        key={cat._id}
                        ref={isSelected ? selectedCatRef : null}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() =>
                          setFormData({ ...formData, primaryCategory: cat._id })
                        }
                        className={`
                    shrink-0 w-28 h-28 sm:w-32 sm:h-32 flex flex-col items-center justify-center gap-2 px-2 rounded-md border transition-all
                    ${
                      isSelected
                        ? "border-4 border-teal-600 text-teal-600"
                        : isDark
                          ? "border border-gray-700 text-gray-300 hover:border-teal-500"
                          : "border border-gray-300 text-gray-700 hover:border-teal-500"
                    }
                  `}
                      >
                        <CategoryIcon
                          cat={cat}
                          className={`w-9 h-9 shrink-0 transition-all ${
                            isSelected ? "" : "opacity-70"
                          }`}
                        />
                        <span className="text-sm font-medium text-center leading-snug line-clamp-3">
                          {categoryLabel(
                            cat,
                            i18n.resolvedLanguage ?? i18n.language,
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.primaryCategory && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.primaryCategory}
                  </p>
                )}
              </div>
            )}

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
          </>
        )}

        {/* Tags */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label
              className={`flex text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {t("tags")}
            </label>
            <div className="flex items-center gap-2">
              {formData?.tags?.length > 0 && (
                <button
                  type="button"
                  onClick={clearTags}
                  title={t("clear_tags")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t("clear_tags")}
                </button>
              )}
              {nameForGen !== "-" && descriptionForGen !== "-" ? (
                <button
                  type="button"
                  onClick={handleGenerateTags}
                  disabled={isLoading}
                  title={t("generate_tags_with_ai")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {isLoading ? t("generating_tags") : t("generate_tags")}
                </button>
              ) : null}
            </div>
          </div>

          <div
            className={`relative p-3 rounded-lg border min-h-14 ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-300"
            }`}
          >
            <div className="flex flex-wrap gap-2 items-center">
              {formData.tags
                .filter((tag) => tag?.trim())
                .map((tag, idx) => (
                  <span
                    key={`${tag}-${idx}`}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
                      isDark
                        ? "bg-gray-700 text-gray-200"
                        : "bg-gray-100 text-gray-900 border-teal-50 border"
                    }`}
                  >
                    {tag}
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
                        tags: [...formData.tags, selected.name],
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
                onBlur={() =>
                  setTimeout(() => setShowTagSuggestions(false), 150)
                }
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
                            : "bg-white text-black"
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
    </div>
  );
};

export default Attributes;
