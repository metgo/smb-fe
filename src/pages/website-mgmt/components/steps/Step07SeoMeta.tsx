import { useRef } from "react";
import clsx from "clsx";
import { Search, Upload, X } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";
import CircularProgress from "@/components/shared/CircularProgress";

interface Props {
  formData: ISiteSettingsFormData;
  errors: SiteSettingsErrors;
  onChange: (field: keyof ISiteSettingsFormData, value: string) => void;
  uploadStates: Record<string, "idle" | "uploading" | "done" | "error">;
  uploadProgress: Record<string, number>;
  onFileSelect: (field: keyof ISiteSettingsFormData, file: File) => void;
  onFileClear: (field: keyof ISiteSettingsFormData) => void;
}

function Field({
  label,
  required,
  children,
  error,
  textPrimary,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
  textPrimary: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className={clsx("text-sm font-medium", textPrimary)}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

const Step07SeoMeta = ({
  formData,
  errors,
  onChange,
  uploadStates,
  uploadProgress,
  onFileSelect,
  onFileClear,
}: Props) => {
  const { t } = useTranslation("website_settings");
  const ogImageRef = useRef<HTMLInputElement>(null);
  const twitterImageRef = useRef<HTMLInputElement>(null);
  const { textPrimary, textSecondary, inputClasses, borderColor, isDark } =
    useThemeClasses();

  const inputCls = clsx(
    "px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20 text-sm",
    inputClasses,
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Search className="w-5 h-5 text-teal-500" />
        <h2 className={clsx("text-lg font-semibold", textPrimary)}>
          {t("seo_title")}
        </h2>
      </div>

      {/* Basic Meta */}
      <div className="flex flex-col gap-5">
        <h3
          className={clsx(
            "text-sm font-semibold uppercase tracking-wide",
            textSecondary,
          )}
        >
          {t("basic_meta")}
        </h3>
        <Field
          label={t("meta_title")}
          required
          textPrimary={textPrimary}
          error={errors.metaTitle}
        >
          <input
            type="text"
            value={formData.metaTitle}
            onChange={(e) => onChange("metaTitle", e.target.value)}
            placeholder={t("meta_title_placeholder")}
            className={clsx(inputCls, errors.metaTitle && "border-red-500")}
            maxLength={60}
          />
          <span className={clsx("text-xs self-end", textSecondary)}>
            {formData.metaTitle.length}/60
          </span>
        </Field>
        <Field
          label={t("meta_description")}
          required
          textPrimary={textPrimary}
          error={errors.metaDescription}
        >
          <textarea
            rows={3}
            value={formData.metaDescription}
            onChange={(e) => onChange("metaDescription", e.target.value)}
            placeholder={t("meta_description_placeholder")}
            className={clsx(
              inputCls,
              "resize-none",
              errors.metaDescription && "border-red-500",
            )}
            maxLength={160}
          />
          <span className={clsx("text-xs self-end", textSecondary)}>
            {formData.metaDescription.length}/160
          </span>
        </Field>
        <Field label={t("meta_keywords")} textPrimary={textPrimary}>
          <input
            type="text"
            value={formData.metaKeywords}
            onChange={(e) => onChange("metaKeywords", e.target.value)}
            placeholder="keyword1, keyword2, keyword3"
            className={inputCls}
          />
        </Field>
        <Field label={t("canonical_url")} textPrimary={textPrimary}>
          <input
            type="url"
            value={formData.canonicalUrl}
            onChange={(e) => onChange("canonicalUrl", e.target.value)}
            placeholder="https://yoursite.com/"
            className={inputCls}
          />
        </Field>
      </div>

      {/* Open Graph */}
      <div className={clsx("flex flex-col gap-5 pt-4 border-t", borderColor)}>
        <h3
          className={clsx(
            "text-sm font-semibold uppercase tracking-wide",
            textSecondary,
          )}
        >
          {t("open_graph")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label={t("og_title")} textPrimary={textPrimary}>
            <input
              type="text"
              value={formData.ogTitle}
              onChange={(e) => onChange("ogTitle", e.target.value)}
              placeholder={t("og_title_placeholder")}
              className={inputCls}
            />
          </Field>
          <Field label={t("og_description")} textPrimary={textPrimary}>
            <input
              type="text"
              value={formData.ogDescription}
              onChange={(e) => onChange("ogDescription", e.target.value)}
              placeholder={t("og_description_placeholder")}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label={t("og_image")} textPrimary={textPrimary}>
          {formData.ogImageUrl ? (
            <div className="relative w-full max-w-xs">
              <img
                src={formData.ogImageUrl}
                alt="OG"
                className={clsx(
                  "w-full h-32 object-cover rounded-xl border",
                  borderColor,
                )}
              />
              {uploadStates["ogImageUrl"] === "uploading" ? (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                  <CircularProgress
                    progress={uploadProgress["ogImageUrl"] ?? 0}
                  />
                </div>
              ) : (
                <button
                  onClick={() => onFileClear("ogImageUrl")}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => ogImageRef.current?.click()}
              className={clsx(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed text-sm transition-colors cursor-pointer",
                isDark
                  ? "border-gray-700 hover:border-teal-600"
                  : "border-gray-300 hover:border-teal-500",
              )}
            >
              <Upload className="w-4 h-4" />
              {t("upload_og_image")}
            </button>
          )}
          <input
            ref={ogImageRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] &&
              onFileSelect("ogImageUrl", e.target.files[0])
            }
          />
        </Field>
      </div>

      {/* Twitter Card */}
      <div className={clsx("flex flex-col gap-5 pt-4 border-t", borderColor)}>
        <h3
          className={clsx(
            "text-sm font-semibold uppercase tracking-wide",
            textSecondary,
          )}
        >
          {t("twitter_card")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label={t("twitter_card_title")} textPrimary={textPrimary}>
            <input
              type="text"
              value={formData.twitterCardTitle}
              onChange={(e) => onChange("twitterCardTitle", e.target.value)}
              placeholder={t("twitter_card_title_placeholder")}
              className={inputCls}
            />
          </Field>
          <Field
            label={t("twitter_card_description")}
            textPrimary={textPrimary}
          >
            <input
              type="text"
              value={formData.twitterCardDescription}
              onChange={(e) =>
                onChange("twitterCardDescription", e.target.value)
              }
              placeholder={t("twitter_card_description_placeholder")}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label={t("twitter_card_image")} textPrimary={textPrimary}>
          {formData.twitterCardImageUrl ? (
            <div className="relative w-full max-w-xs">
              <img
                src={formData.twitterCardImageUrl}
                alt="Twitter"
                className={clsx(
                  "w-full h-32 object-cover rounded-xl border",
                  borderColor,
                )}
              />
              {uploadStates["twitterCardImageUrl"] === "uploading" ? (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                  <CircularProgress
                    progress={uploadProgress["twitterCardImageUrl"] ?? 0}
                  />
                </div>
              ) : (
                <button
                  onClick={() => onFileClear("twitterCardImageUrl")}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => twitterImageRef.current?.click()}
              className={clsx(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed text-sm transition-colors cursor-pointer",
                isDark
                  ? "border-gray-700 hover:border-teal-600"
                  : "border-gray-300 hover:border-teal-500",
              )}
            >
              <Upload className="w-4 h-4" />
              {t("upload_twitter_image")}
            </button>
          )}
          <input
            ref={twitterImageRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] &&
              onFileSelect("twitterCardImageUrl", e.target.files[0])
            }
          />
        </Field>
      </div>

      {/* Robots & Sitemap */}
      <div className={clsx("flex flex-col gap-5 pt-4 border-t", borderColor)}>
        <h3
          className={clsx(
            "text-sm font-semibold uppercase tracking-wide",
            textSecondary,
          )}
        >
          {t("robots_sitemap")}
        </h3>
        <Field label={t("robots_txt")} textPrimary={textPrimary}>
          <textarea
            rows={5}
            value={formData.robotsTxt}
            onChange={(e) => onChange("robotsTxt", e.target.value)}
            placeholder={"User-agent: *\nAllow: /"}
            className={clsx(inputCls, "resize-y font-mono text-xs")}
          />
        </Field>
        <Field label={t("sitemap_url")} textPrimary={textPrimary}>
          <input
            type="url"
            value={formData.sitemapUrl}
            onChange={(e) => onChange("sitemapUrl", e.target.value)}
            placeholder="https://yoursite.com/sitemap.xml"
            className={inputCls}
          />
        </Field>
      </div>
    </div>
  );
};

export default Step07SeoMeta;
