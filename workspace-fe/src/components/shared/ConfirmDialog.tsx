import { useThemeClasses } from "@/hooks/useThemeClasses";
import clsx from "clsx";
import { AlertTriangle, Info, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantConfig = {
  danger: {
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    borderAccent: "border-red-500/40",
    confirmBtn:
      "bg-red-600 hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500",
    topBar: "bg-gradient-to-r from-red-500 to-red-600",
  },
  warning: {
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderAccent: "border-amber-500/40",
    confirmBtn:
      "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 focus-visible:ring-amber-400",
    topBar: "bg-gradient-to-r from-amber-400 to-amber-500",
  },
  info: {
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderAccent: "border-blue-500/40",
    confirmBtn:
      "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-blue-500",
    topBar: "bg-gradient-to-r from-blue-500 to-blue-600",
  },
};

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
  const {
    isDark,
    bgPrimary,
    textPrimary,
    borderColor,
    textSecondary,
    textTertiary,
  } = useThemeClasses();

  if (!open) return null;

  const vc = variantConfig[variant];
  const Icon = variant === "info" ? Info : AlertTriangle;

  return createPortal(
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          isDark ? "bg-gray-900" : "bg-white",
          "w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden",
          vc.borderAccent,
        )}
      >
        {/* Accent top bar */}
        <div className={clsx("h-1 w-full", vc.topBar)} />

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={clsx("p-2.5 rounded-xl shrink-0", vc.iconBg)}>
              <Icon className={clsx("w-5 h-5", vc.iconColor)} />
            </div>

            <div className="flex-1 min-w-0">
              <h3
                className={clsx(
                  "text-base font-semibold leading-snug",
                  textSecondary,
                )}
              >
                {t(title)}
              </h3>
              {message && (
                <p
                  className={clsx(
                    "text-sm mt-1.5 leading-relaxed",
                    textTertiary,
                  )}
                >
                  {t(message)}
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div
            className={clsx(
              "mt-5 mb-4 border-t",
              isDark ? "border-gray-800" : "border-gray-100",
            )}
          />

          <div className="flex justify-end gap-2.5">
            <button
              onClick={onCancel}
              disabled={loading}
              className={clsx(
                borderColor,
                bgPrimary,
                textPrimary,
                "px-4 py-2 rounded-lg border text-sm font-medium cursor-pointer",
                "transition-colors duration-150",
                isDark ? "hover:bg-gray-800" : "hover:bg-gray-50",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {t(cancelText)}
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer text-white",
                "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                "disabled:opacity-60 disabled:cursor-not-allowed",
                "flex items-center gap-2",
                vc.confirmBtn,
              )}
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {loading ? t("processing") : t(confirmText)}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
