import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Check, Link2, Loader, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface FormHeaderProps {
  isEditing: boolean;
  isSaving: boolean;
  canSave: boolean;
  onSave: () => void;
  onReset: () => void;
}

const FormHeader = ({
  isEditing,
  isSaving,
  canSave,
  onSave,
  onReset,
}: FormHeaderProps) => {
  const { t } = useTranslation("utm_campaign");
  const { textPrimary, textTertiary, borderColor } = useThemeClasses();

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className={clsx("text-lg font-semibold", textPrimary)}>
          {isEditing ? t("form_title_edit") : t("form_title_new")}
        </h2>
        <p className={clsx("text-xs mt-0.5", textTertiary)}>
          {t("required_hint")}
        </p>
      </div>
      <div>
        <div className={clsx("flex items-center gap-3", borderColor)}>
          <Button
            type="button"
            onClick={onSave}
            variant="default"
            disabled={!canSave || isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : isEditing ? (
              <Check className="w-4 h-4" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            {isEditing ? t("update") : t("save")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onReset}
            className="gap-2"
          >
            {isEditing ? (
              <X className="w-4 h-4" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            {isEditing ? t("cancel_edit") : t("reset")}
          </Button>
          {isEditing && (
            <Button type="button" variant="secondary" className={clsx("")}>
              {t("editing_badge")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormHeader;
