import { Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ArticleReviewSectionProps {
  formData: any;
  onEdit: (step: number) => void;
}

interface FieldRowProps {
  label: string;
  value?: string;
  isHtml?: boolean;
  dir?: "ltr" | "rtl";
  textPrimary: string;
  textTertiary: string;
  borderColor: string;
}

function FieldRow({
  label,
  value,
  isHtml,
  dir,
  textPrimary,
  textTertiary,
  borderColor,
}: FieldRowProps) {
  const isEmpty = !value?.trim();
  return (
    <div className={`py-2 border-b ${borderColor} last:border-0`}>
      <p
        className={`text-xs font-medium uppercase tracking-wide ${textTertiary} mb-1`}
      >
        {label}
      </p>
      {isEmpty ? (
        <p className={`text-sm ${textTertiary} italic`}>—</p>
      ) : isHtml ? (
        <div
          dir={dir}
          className={`text-sm ${textPrimary} line-clamp-3 prose prose-sm max-w-none`}
          dangerouslySetInnerHTML={{ __html: value! }}
        />
      ) : (
        <p dir={dir} className={`text-sm ${textPrimary}`}>
          {value}
        </p>
      )}
    </div>
  );
}

interface ReviewCardProps {
  title: string;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
  bgSecondary: string;
  textPrimary: string;
  textTertiary: string;
  borderColor: string;
  t: (key: string) => string;
}

function ReviewCard({
  title,
  step,
  onEdit,
  children,
  bgSecondary,
  textPrimary,
  textTertiary,
  borderColor,
  t,
}: ReviewCardProps) {
  return (
    <div className={`rounded-xl border ${borderColor} overflow-hidden`}>
      <div
        className={`px-4 py-3 ${bgSecondary} border-b ${borderColor} flex items-center justify-between`}
      >
        <div>
          <span className={`text-sm font-semibold ${textPrimary}`}>
            {title}
          </span>
          <span className={`ml-2 text-xs ${textTertiary}`}>
            {t("step")} {step}
          </span>
        </div>
        <button
          onClick={() => onEdit(step)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-500  dark:hover:bg-teal-900/20 rounded-lg transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          {t("edit")}
        </button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function LangSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-xs font-bold text-teal-500 uppercase tracking-wider mb-2">
        {label}
      </p>
      {children}
    </div>
  );
}

function TagList({
  tags,
  textTertiary,
}: {
  tags: string[];
  textTertiary: string;
}) {
  if (!tags?.length)
    return <p className={`text-sm ${textTertiary} italic`}>—</p>;
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className={`px-2 py-0.5 text-xs rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export default function ArticleReviewSection({
  formData,
  onEdit,
}: ArticleReviewSectionProps) {
  const { t } = useTranslation("article");
  const { bgSecondary, textPrimary, textTertiary, borderColor } =
    useThemeClasses();

  const cardProps = {
    bgSecondary,
    textPrimary,
    textTertiary,
    borderColor,
    t,
    onEdit,
  };
  const fieldProps = { textPrimary, textTertiary, borderColor };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Content (Step 1) ─────────────────────────────────────── */}
      <ReviewCard title={t("form")} step={1} {...cardProps}>
        <LangSection label="English">
          <FieldRow
            label={t("title")}
            value={formData.title}
            dir="ltr"
            {...fieldProps}
          />
          <FieldRow
            label={t("short_description")}
            value={formData.shortDescription}
            dir="ltr"
            {...fieldProps}
          />
          <FieldRow
            label={t("content")}
            value={formData.content}
            dir="ltr"
            isHtml
            {...fieldProps}
          />
        </LangSection>
      </ReviewCard>

      {/* ── Translations (Step 2) ─────────────────────────────────── */}
      <ReviewCard title={t("translation")} step={2} {...cardProps}>
        <LangSection label="Hebrew">
          <FieldRow
            label={t("title")}
            value={formData.titleHe}
            dir="rtl"
            {...fieldProps}
          />
          <FieldRow
            label={t("short_description")}
            value={formData.shortDescriptionHe}
            dir="rtl"
            {...fieldProps}
          />
          <FieldRow
            label={t("content")}
            value={formData.contentHe}
            dir="rtl"
            isHtml
            {...fieldProps}
          />
        </LangSection>
        <LangSection label="Arabic">
          <FieldRow
            label={t("title")}
            value={formData.titleAr}
            dir="rtl"
            {...fieldProps}
          />
          <FieldRow
            label={t("short_description")}
            value={formData.shortDescriptionAr}
            dir="rtl"
            {...fieldProps}
          />
          <FieldRow
            label={t("content")}
            value={formData.contentAr}
            dir="rtl"
            isHtml
            {...fieldProps}
          />
        </LangSection>
      </ReviewCard>

      {/* ── SEO (Step 3) ─────────────────────────────────────────── */}
      <ReviewCard title={t("seo")} step={3} {...cardProps}>
        <LangSection label="English">
          <FieldRow
            label={t("meta_title")}
            value={formData.metaTitle}
            dir="ltr"
            {...fieldProps}
          />
          <FieldRow
            label={t("meta_description")}
            value={formData.metaDescription}
            dir="ltr"
            {...fieldProps}
          />
          <FieldRow
            label={t("summary")}
            value={formData.summary}
            dir="ltr"
            {...fieldProps}
          />
          <FieldRow
            label="Slug"
            value={formData.slug}
            dir="ltr"
            {...fieldProps}
          />
          <div className={`py-2 border-b ${borderColor} last:border-0`}>
            <p
              className={`text-xs font-medium uppercase tracking-wide ${textTertiary} mb-1`}
            >
              {t("tags")}
            </p>
            <TagList tags={formData.tags} textTertiary={textTertiary} />
          </div>
        </LangSection>
        <LangSection label="Hebrew">
          <FieldRow
            label={t("meta_title")}
            value={formData.metaTitleHe}
            dir="rtl"
            {...fieldProps}
          />
          <FieldRow
            label={t("meta_description")}
            value={formData.metaDescriptionHe}
            dir="rtl"
            {...fieldProps}
          />
          <FieldRow
            label={t("summary")}
            value={formData.summaryHe}
            dir="rtl"
            {...fieldProps}
          />
          <div className={`py-2 border-b ${borderColor} last:border-0`}>
            <p
              className={`text-xs font-medium uppercase tracking-wide ${textTertiary} mb-1`}
            >
              {t("tags")}
            </p>
            <TagList tags={formData.tagsHe} textTertiary={textTertiary} />
          </div>
        </LangSection>
        <LangSection label="Arabic">
          <FieldRow
            label={t("meta_title")}
            value={formData.metaTitleAr}
            dir="rtl"
            {...fieldProps}
          />
          <FieldRow
            label={t("meta_description")}
            value={formData.metaDescriptionAr}
            dir="rtl"
            {...fieldProps}
          />
          <FieldRow
            label={t("summary")}
            value={formData.summaryAr}
            dir="rtl"
            {...fieldProps}
          />
          <div className={`py-2 border-b ${borderColor} last:border-0`}>
            <p
              className={`text-xs font-medium uppercase tracking-wide ${textTertiary} mb-1`}
            >
              {t("tags")}
            </p>
            <TagList tags={formData.tagsAr} textTertiary={textTertiary} />
          </div>
        </LangSection>
      </ReviewCard>
    </div>
  );
}
