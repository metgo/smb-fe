import { useThemeClasses } from "@/hooks/useThemeClasses";
import clsx from "clsx";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title = "Confirm",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation("common");
  const { bgTertiary, bgPrimary, textPrimary, borderColor, textSecondary } =
    useThemeClasses();
  if (!open) return null;

  const variantStyles = {
    danger: "text-red-600 bg-red-100",
    warning: "text-yellow-600 bg-yellow-100",
    info: "text-blue-600 bg-blue-100",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={clsx(
          bgTertiary,
          "w-full max-w-md rounded-xl border border-red-500 p-6 shadow-xl",
        )}
      >
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-full ${variantStyles[variant]}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <h3 className={clsx("text-lg font-semibold", textSecondary)}>
              {t(title)}
            </h3>
            <p className={clsx("text-sm mt-1", textPrimary)}>{t(message)}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 font-semibold">
          <button
            onClick={onCancel}
            disabled={loading}
            className={clsx(
              borderColor,
              bgPrimary,
              textPrimary,
              "px-4 py-2 rounded-lg border text-sm cursor-pointer",
            )}
          >
            {t(cancelText)}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm cursor-pointer text-white ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-yellow-600 hover:bg-yellow-700"
            }`}
          >
            {loading ? "Processing..." : t(confirmText)}
          </button>
        </div>
      </div>
    </div>
  );
}
