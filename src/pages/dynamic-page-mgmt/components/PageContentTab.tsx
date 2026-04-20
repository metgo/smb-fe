import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { RichTextEditor } from "@/components/shared";
import type { PageFormData } from "../types";

interface PageContentTabProps {
  activeTab: string;
  currentForm: PageFormData;
  currentErrors: Partial<PageFormData>;
  onUpdateField: (field: keyof PageFormData, value: string) => void;
}

export default function PageContentTab({
  activeTab,
  currentForm,
  currentErrors,
  onUpdateField,
}: PageContentTabProps) {
  const { t } = useTranslation("dynamic_pages");
  const { textPrimary, textTertiary, inputClasses } = useThemeClasses();

  const titlePlaceholder =
    activeTab === "terms"
      ? t("field_title_placeholder_terms")
      : t("field_title_placeholder_privacy");

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={clsx("block text-sm font-medium", textPrimary)}>
            {t("field_title")} <span className="text-red-500">*</span>
          </label>
          <Input
            value={currentForm.title}
            onChange={(e) => onUpdateField("title", e.target.value)}
            placeholder={titlePlaceholder}
            className={clsx(
              inputClasses,
              currentErrors.title && "border-red-500 focus:ring-red-400",
            )}
          />
          {currentErrors.title && (
            <p className="text-xs text-red-500">{currentErrors.title}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className={clsx("block text-sm font-medium", textPrimary)}>
            {t("field_subtitle")}{" "}
            <span className={clsx("text-xs font-normal", textTertiary)}>
              {t("field_subtitle_optional")}
            </span>
          </label>
          <Input
            value={currentForm.subTitle}
            onChange={(e) => onUpdateField("subTitle", e.target.value)}
            placeholder={t("field_subtitle_placeholder")}
            className={clsx(inputClasses)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={clsx("block text-sm font-medium", textPrimary)}>
          {t("field_content")} <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          value={currentForm.content}
          onChange={(html) => onUpdateField("content", html)}
          placeholder={t("field_content_placeholder")}
          className={clsx(currentErrors.content && "border-red-500")}
        />
        {currentErrors.content && (
          <p className="text-xs text-red-500">{currentErrors.content}</p>
        )}
      </div>
    </>
  );
}
