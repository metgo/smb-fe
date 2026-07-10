import { useRef, useState, type FC } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";
import { useCommon } from "@/hooks/useCommon";
import { useGenerateTagsMutation } from "@/store/api/masterDataApi";

interface Tag {
  en: string;
  he: string;
  ar: string;
}

interface PoiAttributesProps {
  formData: { tags: Tag[]; primaryCategory?: string };
  setFormData: (data: any) => void;
  name?: string;
  description?: string;
}

const PoiAttributes: FC<PoiAttributesProps> = ({
  formData,
  setFormData,
  name = "",
  description = "",
}) => {
  const { t } = useTranslation("common");
  const { isDark, language } = useThemeClasses();
  const { allTags } = useCommon();
  const [getGeneratedTags, { isLoading }] = useGenerateTagsMutation();

  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [selectedTagIndex, setSelectedTagIndex] = useState(0);
  const hasGeneratedRef = useRef(false);

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
        value?.trim()?.toLowerCase()?.includes(tagInput.toLowerCase()) &&
        !isDuplicateTag(value)
      );
    }) ?? [];

  const handleGenerateTags = () => {
    if (!name && !description) return;

    getGeneratedTags({
      name,
      description,
    })
      .then((res: any) => {
        if (!res?.data?.length) return;

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
      tags: formData?.tags?.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="relative">
      <div className="space-y-6 mx-auto">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              className={`block text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {t("tags")}
            </label>
            {name && description ? (
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

          <div
            className={`relative p-3 rounded-lg border min-h-14 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}
          >
            <div className="flex flex-wrap gap-2 items-center">
              {formData?.tags
                ?.filter((tag) => tag?.[language]?.trim())
                .map((tag, idx) => (
                  <span
                    key={`${tag.en}-${idx}`}
                    className="px-2 py-1 bg-white dark:bg-teal-900/30 text-black dark:text-teal-300 border border-teal-200 dark:border-teal-700/50 rounded flex items-center gap-1 text-sm font-medium"
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
              {isLoading && (
                <span
                  className={`text-xs flex items-center gap-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  <svg
                    className="w-3 h-3 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  {t("generating_tags")}
                </span>
              )}

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
                      setTagInput("");
                      setShowTagSuggestions(false);
                      setSelectedTagIndex(0);
                    } else {
                      handleAddTag(tagInput);
                    }
                  }
                  if (e.key === ",") {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                  if (e.key === "Escape") setShowTagSuggestions(false);
                }}
                onBlur={() =>
                  setTimeout(() => setShowTagSuggestions(false), 150)
                }
                onFocus={() => tagInput.trim() && setShowTagSuggestions(true)}
                className={`flex-1 min-w-30 px-2 py-1 bg-transparent outline-none text-sm ${isDark ? "text-gray-200" : "text-gray-900"}`}
              />
            </div>

            {showTagSuggestions && filteredSuggestions.length > 0 && (
              <div
                className={`absolute left-0 right-0 top-full mt-1 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-lg border shadow-lg z-50 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}
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
          <p
            className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
          >
            {t("tag_input_hint")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PoiAttributes;
