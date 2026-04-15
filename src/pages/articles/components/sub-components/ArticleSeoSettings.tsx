import { useTranslation } from "react-i18next";
import {
  X,
  Plus,
  Eye,
  Calendar,
  Clock,
  Loader2,
  Sparkles,
  Tag,
  Search,
} from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";

const LANG_SUFFIX: Record<Language, string> = { en: "", he: "He", ar: "Ar" };
const LANG_DIR: Record<Language, "ltr" | "rtl"> = {
  en: "ltr",
  he: "rtl",
  ar: "rtl",
};

// tagsHe, tagsAr — the tags base field doesn't have a suffix for EN
function getTagsField(lang: Language): string {
  if (lang === "en") return "tags";
  return `tags${LANG_SUFFIX[lang]}`;
}

interface ArticleSeoSettingsProps {
  formData: Record<string, any>;
  editingLanguage: Language;
  onChange: (updates: Record<string, any>) => void;
  tagInput: string;
  onTagInputChange: (val: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  isGeneratingSeo: boolean;
  onGenerateSeo: () => void;
  showPreview: boolean;
  onTogglePreview: () => void;
  existingArticle?: any;
}

export default function ArticleSeoSettings({
  formData,
  editingLanguage,
  onChange,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  isGeneratingSeo,
  onGenerateSeo,
  onTogglePreview,
  existingArticle,
}: ArticleSeoSettingsProps) {
  const {
    bgPrimary,
    bgSecondary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
  } = useThemeClasses();
  const { t } = useTranslation("article");

  const suffix = LANG_SUFFIX[editingLanguage];
  const dir = LANG_DIR[editingLanguage];
  const langLabel =
    editingLanguage !== "en" ? ` (${editingLanguage.toUpperCase()})` : "";

  const summaryField = `summary${suffix}`;
  const metaTitleField = `metaTitle${suffix}`;
  const metaDescField = `metaDescription${suffix}`;
  const tagsField = getTagsField(editingLanguage);
  const currentTags: string[] = formData[tagsField] || [];

  const metaTitleLen = (formData[metaTitleField] || "").length;
  const metaDescLen = (formData[metaDescField] || "").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={`text-base font-semibold ${textPrimary}`}>
          {t("settings")}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onGenerateSeo}
            disabled={isGeneratingSeo}
            title="Generate SEO with AI"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGeneratingSeo ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {isGeneratingSeo ? t("generating") : t("auto_seo")}
          </button>
          <button
            onClick={onTogglePreview}
            className={`p-2 rounded-lg ${textTertiary} lg:hidden`}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slug */}
      <div>
        <label
          className={`block text-xs font-semibold uppercase tracking-wider ${textTertiary} mb-2`}
        >
          {t("url_slug")}
        </label>
        <div
          className={`flex items-center border ${borderColor} rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500`}
        >
          <span
            className={`px-3 py-2.5 text-sm ${textTertiary} ${bgSecondary} border-r ${borderColor} select-none`}
          >
            /
          </span>
          <input
            type="text"
            value={formData.slug || ""}
            onChange={(e) =>
              onChange({
                slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
              })
            }
            placeholder={t("url_slug_placeholder")}
            className={`flex-1 px-3 py-2.5 ${bgPrimary} ${textPrimary} focus:outline-none text-sm font-mono`}
            dir="ltr"
          />
        </div>
        <p className={`text-xs ${textTertiary} mt-1`}>{t("url_slug_hint")}</p>
      </div>

      {/* Summary */}
      <div>
        <label
          className={`block text-xs font-semibold uppercase tracking-wider ${textTertiary} mb-2`}
        >
          {t("summary")}
          {langLabel}
        </label>
        <textarea
          value={formData[summaryField] || ""}
          onChange={(e) => onChange({ [summaryField]: e.target.value })}
          placeholder={t("summary_placeholder")}
          className={`w-full ${bgPrimary} ${textPrimary} border ${borderColor} rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm`}
          rows={3}
          dir={dir}
        />
      </div>

      {/* Tags */}
      <div>
        <label
          className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${textTertiary} mb-2`}
        >
          <Tag className="w-3.5 h-3.5" />
          {t("tags")}
          {langLabel}
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => onTagInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddTag();
              }
            }}
            placeholder={t("tags_placeholder")}
            className={`flex-1 px-3 py-2 ${bgPrimary} ${textPrimary} border ${borderColor} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
            dir={dir}
          />
          <button
            onClick={onAddTag}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 min-h-7">
          {currentTags.length === 0 ? (
            <p className={`text-xs ${textTertiary} italic`}>
              {t("no_tags_yet")}
            </p>
          ) : (
            currentTags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 px-2.5 py-1 ${bgSecondary} ${textSecondary} border ${borderColor} rounded-full text-xs`}
              >
                {tag}
                <button
                  onClick={() => onRemoveTag(tag)}
                  className="hover:text-red-500 transition-colors ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* SEO */}
      <div>
        <label
          className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${textTertiary} mb-3`}
        >
          <Search className="w-3.5 h-3.5" />
          {t("seo_metadata")}
          {langLabel}
        </label>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`text-xs font-medium ${textSecondary}`}>
                {t("meta_title")}
              </label>
              <span
                className={`text-xs ${metaTitleLen > 60 ? "text-red-400" : textTertiary}`}
              >
                {metaTitleLen}/60
              </span>
            </div>
            <input
              type="text"
              value={formData[metaTitleField] || ""}
              onChange={(e) => onChange({ [metaTitleField]: e.target.value })}
              placeholder={t("meta_title_placeholder")}
              className={`w-full px-3 py-2 ${bgPrimary} ${textPrimary} border ${
                metaTitleLen > 60 ? "border-red-400" : borderColor
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors`}
              dir={dir}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`text-xs font-medium ${textSecondary}`}>
                {t("meta_description")}
              </label>
              <span
                className={`text-xs ${metaDescLen > 160 ? "text-red-400" : textTertiary}`}
              >
                {metaDescLen}/160
              </span>
            </div>
            <textarea
              value={formData[metaDescField] || ""}
              onChange={(e) => onChange({ [metaDescField]: e.target.value })}
              placeholder={t("meta_description_placeholder")}
              rows={3}
              className={`w-full px-3 py-2 ${bgPrimary} ${textPrimary} border ${
                metaDescLen > 160 ? "border-red-400" : borderColor
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none transition-colors`}
              dir={dir}
            />
          </div>
        </div>
      </div>

      {/* Attribution */}
      {existingArticle && (
        <div>
          <label
            className={`block text-xs font-semibold uppercase tracking-wider ${textTertiary} mb-2`}
          >
            {t("attribution")}
          </label>
          <div className="space-y-2">
            {existingArticle.createdAt && (
              <div className="flex items-center gap-2">
                <Clock className={`w-3.5 h-3.5 ${textTertiary} shrink-0`} />
                <span className={`text-xs ${textTertiary}`}>
                  {t("created")}{" "}
                  {new Date(existingArticle.createdAt).toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    },
                  )}
                </span>
              </div>
            )}
            {existingArticle.updatedAt && (
              <div className="flex items-center gap-2">
                <Calendar className={`w-3.5 h-3.5 ${textTertiary} shrink-0`} />
                <span className={`text-xs ${textTertiary}`}>
                  {t("last_updated")}{" "}
                  {new Date(existingArticle.updatedAt).toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    },
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
