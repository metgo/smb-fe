import { useEffect, useState, type FC } from "react";
import { X } from "lucide-react";
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
  formData: { tags: Tag[] };
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
  const [getGeneratedTags] = useGenerateTagsMutation();

  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [selectedTagIndex, setSelectedTagIndex] = useState(0);

  useEffect(() => {
    if (!name && !description) return;
    getGeneratedTags({ name, description })
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
          setFormData({ ...formData, tags: [...formData.tags, ...newTags] });
        }
      })
      .catch(() => {});
  }, [name, description]);

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

  return (
    <div className="space-y-6  mx-auto">
      <div>
        <label
          className={`block text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {t("tags")}
        </label>

        <div
          className={`relative p-3 rounded-lg border min-h-14 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}
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
              onBlur={() => setTimeout(() => setShowTagSuggestions(false), 150)}
              onFocus={() => tagInput.trim() && setShowTagSuggestions(true)}
              className={`flex-1 min-w-30 px-2 py-1 bg-transparent outline-none text-sm ${isDark ? "text-gray-200" : "text-gray-900"}`}
            />
          </div>

          {showTagSuggestions && filteredSuggestions.length > 0 && (
            <div
              className={`absolute left-0 right-0 top-full mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg z-50 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}
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
        <p
          className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
        >
          {t("tag_input_hint")}
        </p>
      </div>
    </div>
  );
};

export default PoiAttributes;
