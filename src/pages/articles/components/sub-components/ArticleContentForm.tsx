import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import RichTextEditor from "./RichTextEditor";
import ArticleImageGallery from "./ArticleImageGallery";
import { detectLanguage } from "@/helpers";
import { useCallback, useEffect } from "react";
const LANG_SUFFIX: Record<Language, string> = { en: "", he: "He", ar: "Ar" };
const LANG_DIR: Record<Language, "ltr" | "rtl"> = {
  en: "ltr",
  he: "rtl",
  ar: "rtl",
};

interface ArticleContentFormProps {
  formData: Record<string, any>;
  editingLanguage: Language;
  onChange: (updates: Record<string, any>) => void;
  images: any[];
  primaryImageIndex: number;
  onImageUpload: (files: FileList) => void;
  onImageDelete: (img: any, idx: number) => void;
  onSetPrimaryImage: (idx: number) => void;
  syncKey?: string | number;
  setEditingLanguage?: any;
}

export default function ArticleContentForm({
  formData,
  editingLanguage,
  onChange,
  images,
  primaryImageIndex,
  onImageUpload,
  onImageDelete,
  onSetPrimaryImage,
  syncKey,
  setEditingLanguage,
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

  const suffix = LANG_SUFFIX[editingLanguage];
  const dir = LANG_DIR[editingLanguage];
  const langLabel =
    editingLanguage !== "en" ? ` (${editingLanguage.toUpperCase()})` : "";

  const titleField = `title${suffix}`;
  const shortDescField = `shortDescription${suffix}`;
  const contentField = `content${suffix}`;

  // Auto-detect language when user types in title or short description
  const handleAutoDetect = useCallback(
    (text: string) => {
      if (!text || text.length < 3) return; 

      const detected = detectLanguage(text);
      console.log("🚀 ~ ArticleContentForm ~ detected:", detected)
      setEditingLanguage(detected);
      if (detected !== editingLanguage) {
        // You need to pass a callback or use a prop to change editingLanguage
        // For example: onLanguageChange(detected)
      }
    },
    [editingLanguage],
  );

  // Detect on title change
  useEffect(() => {
    const titleText = formData[titleField] || "";
    handleAutoDetect(titleText);
  }, [formData[titleField], handleAutoDetect, titleField]);

  // Detect on short description change
  useEffect(() => {
    const descText = formData[shortDescField] || "";
    handleAutoDetect(descText);
  }, [formData[shortDescField], handleAutoDetect, shortDescField]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("title")}
          {langLabel} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData[titleField] || ""}
          onChange={(e) => {
            onChange({ [titleField]: e.target.value });
            handleAutoDetect(e.target.value); // immediate detection
          }}
          placeholder={t("title_placeholder")}
          className={`w-full text-2xl font-bold ${bgSecondary} ${textPrimary} border ${borderColor} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow`}
          dir={dir}
        />
        <p className={`text-xs ${textTertiary} mt-1`}>
          {(formData[titleField] || "").length} {t("characters")}
        </p>
      </div>

      {/* Short Description - same pattern */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          {t("short_description")}
          {langLabel} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData[shortDescField] || ""}
          onChange={(e) => {
            onChange({ [shortDescField]: e.target.value });
            handleAutoDetect(e.target.value);
          }}
          placeholder={t("short_description_placeholder")}
          className={`w-full ${bgSecondary} ${textPrimary} border ${borderColor} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-shadow`}
          rows={3}
          dir={dir}
        />
        <p className={`text-xs ${textTertiary} mt-1`}>
          {(formData[shortDescField] || "").length} {t("characters")}
        </p>
      </div>

      {/* Rich Text Content */}
      <RichTextEditor
        content={formData[contentField] || ""}
        onChange={(html) => onChange({ [contentField]: html })}
        editingLanguage={editingLanguage}
        bgPrimary={bgPrimary}
        bgSecondary={bgSecondary}
        textPrimary={textPrimary}
        textTertiary={textTertiary}
        borderColor={borderColor}
        syncKey={`${syncKey ?? ""}-${editingLanguage}`}
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
