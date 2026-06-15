import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, X } from "lucide-react";
import clsx from "clsx";
import { createPortal } from "react-dom";

import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ApprovalActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: "approve" | "reject";
  onSubmit: (data: { comment?: string; reason?: string }) => Promise<void>;
  isLoading?: boolean;
  entityName: string;
}

const MAX_COMMENT_LENGTH = 500;

export default function ApprovalActionModal({
  isOpen,
  onClose,
  action,
  onSubmit,
  isLoading = false,
  entityName,
}: ApprovalActionModalProps) {
  const { t } = useTranslation("pending_approvals");
  const { isDark, borderColor } = useThemeClasses();
  const [text, setText] = useState("");

  if (!isOpen) return null;

  const isApprove = action === "approve";
  const isRequired = !isApprove;
  const placeholder = isApprove ? t("approval_comment") : t("rejection_reason");
  const buttonText = isApprove ? t("approve_changes") : t("reject_changes");
  const titleKey = isApprove ? "approve_title" : "reject_title";

  const handleSubmit = async () => {
    if (isRequired && !text.trim()) {
      return;
    }

    try {
      await onSubmit(isApprove ? { comment: text } : { reason: text });
      setText("");
    } catch (error) {
      // Error handling done in parent
    }
  };

  const isDisabled =
    isLoading ||
    (isRequired && !text.trim()) ||
    text.length > MAX_COMMENT_LENGTH;
  const characterCount = text.length;
  const isNearLimit = characterCount > MAX_COMMENT_LENGTH * 0.8;

  return createPortal(
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          "w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden",
          isDark ? "bg-gray-900" : "bg-white",
          borderColor,
        )}
      >
        {/* Header */}
        <div
          className={clsx(
            "p-6 border-b flex items-center justify-between",
            isDark ? "border-gray-800" : "border-gray-200",
          )}
        >
          <h2
            className={clsx(
              "text-lg font-semibold",
              isDark ? "text-gray-100" : "text-gray-900",
            )}
          >
            {t(titleKey)}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className={clsx(
              "p-2 rounded-lg transition-colors",
              isDark
                ? "hover:bg-gray-800 text-gray-400 hover:text-gray-300"
                : "hover:bg-gray-100 text-gray-600 hover:text-gray-900",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <p
              className={clsx(
                "text-sm",
                isDark ? "text-gray-400" : "text-gray-600",
              )}
            >
              {t(isApprove ? "approve_desc" : "reject_desc", {
                entityName,
              })}
            </p>
          </div>

          <div className="space-y-2">
            <label
              className={clsx(
                "block text-sm font-medium",
                isDark ? "text-gray-300" : "text-gray-700",
              )}
            >
              {placeholder}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={text}
              onChange={(e) =>
                setText(e.target.value.slice(0, MAX_COMMENT_LENGTH))
              }
              disabled={isLoading}
              placeholder={placeholder}
              rows={4}
              className={clsx(
                "w-full px-4 py-3 rounded-lg text-sm resize-none border transition-colors",
                "focus:outline-none focus:ring-2",
                isDark
                  ? "bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-500 focus:ring-offset-0"
                  : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500 focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            />
            <div className="flex justify-between items-center">
              <p
                className={clsx(
                  "text-xs",
                  isNearLimit ? "text-red-500" : "text-gray-500",
                )}
              >
                {characterCount} / {MAX_COMMENT_LENGTH}
              </p>
              {isRequired && !text.trim() && (
                <p className="text-xs text-red-500">{t("field_required")}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={clsx(
            "flex justify-end gap-3 p-6 border-t",
            isDark ? "border-gray-800" : "border-gray-200",
          )}
        >
          <button
            onClick={onClose}
            disabled={isLoading}
            className={clsx(
              "px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isDark
                ? "bg-gray-800 hover:bg-gray-700 text-gray-100"
                : "bg-gray-200 hover:bg-gray-300 text-gray-900",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isDisabled}
            className={clsx(
              "px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors",
              isApprove
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center gap-2",
            )}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {buttonText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
