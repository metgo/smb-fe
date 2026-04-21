import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import RichTextEditor from "./RichTextEditor";
import ArticleImageGallery from "./ArticleImageGallery";

interface ArticleContentFormProps {
  formData: Record<string, any>;
  onChange: (updates: Record<string, any>) => void;
  images: any[];
  primaryImageIndex: number;
  onImageUpload: (files: FileList) => void;
  onImageDelete: (img: any, idx: number) => void;
  onSetPrimaryImage: (idx: number) => void;
  syncKey?: string | number;
  editingLanguage: "en" | "he" | "ar";
}

export default function ArticleContentForm({
  formData,
  onChange,
  images,
  primaryImageIndex,
  onImageUpload,
  onImageDelete,
  onSetPrimaryImage,
  syncKey,
  editingLanguage,
}: ArticleContentFormProps) {
  const { t } = useTranslation("article");
  const {
    bgSecondary,
    bgPrimary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
  } = useThemeClasses();

  // Single field mode - always use base fields (title, shortDescription, content)
  const titleField = "title";
  const shortDescField = "shortDescription";
  const contentField = "content";

  // Determine direction based on current content (for RTL support)
  const getContentDirection = (text: string): "ltr" | "rtl" => {
    if (!text) return "ltr";
    // Simple heuristic: check first character
    const firstChar = text.trim().charAt(0);
    const hebrewRange = /[\u0590-\u05FF]/;
    const arabicRange = /[\u0600-\u06FF]/;
    if (hebrewRange.test(firstChar) || arabicRange.test(firstChar)) {
      return "rtl";
    }
    return "ltr";
  };

  const titleDir = getContentDirection(formData[titleField] || "");
  const descDir = getContentDirection(formData[shortDescField] || "");

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Title - Single Field */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("title")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData[titleField] || ""}
          onChange={(e) => onChange({ [titleField]: e.target.value })}
          placeholder={t("title_placeholder")}
          className={`w-full text-2xl font-bold ${bgSecondary} ${textPrimary} border ${borderColor} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow`}
          dir={titleDir}
        />
        <p className={`text-xs ${textTertiary} mt-1`}>
          {(formData[titleField] || "").length} {t("characters")}
        </p>
      </div>

      {/* Short Description - Single Field */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("short_description")} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[shortDescField] || ""}
          onChange={(e) => onChange({ [shortDescField]: e.target.value })}
          placeholder={t("short_description_placeholder")}
          className={`w-full ${bgSecondary} ${textPrimary} border ${borderColor} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-shadow`}
          rows={3}
          dir={descDir}
        />
        <p className={`text-xs ${textTertiary} mt-1`}>
          {(formData[shortDescField] || "").length} {t("characters")}
        </p>
      </div>

      {/* Rich Text Content - Single Field */}
      <RichTextEditor
        content={formData[contentField] || ""}
        onChange={(html) => onChange({ [contentField]: html })}
        bgPrimary={bgPrimary}
        bgSecondary={bgSecondary}
        textPrimary={textPrimary}
        textTertiary={textTertiary}
        borderColor={borderColor}
        syncKey={syncKey}
        editingLanguage={editingLanguage}
      />

      {/* Image Gallery */}
      <ArticleImageGallery
        images={images}
        primaryImageIndex={primaryImageIndex}
        onImageUpload={onImageUpload}
        onImageDelete={onImageDelete}
        onSetPrimaryImage={onSetPrimaryImage}
      />
    </div>
  );
}
