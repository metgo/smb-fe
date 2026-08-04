import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import ModalWrapper from "@/components/wrapper/ModalWrapper";

interface SweptMonth {
  label: string; // "MM/YYYY" from the backend
  payoutAmount: number;
}

interface CloseAllOrdersModalProps {
  targetMonthLabel: string;
  sweptMonths: SweptMonth[];
  isLoadingPreview: boolean;
  hasPreviewError: boolean;
  isConfirming: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// "MM/YYYY" -> "August 2026", matching the primary target month's own label
// style, so the two read consistently in the same sentence
function formatMonthLabel(monthYear: string): string {
  const [month, year] = monthYear.split("/").map(Number);
  if (!month || !year) return monthYear;
  return new Date(year, month - 1, 1).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export default function CloseAllOrdersModal({
  targetMonthLabel,
  sweptMonths,
  isLoadingPreview,
  hasPreviewError,
  isConfirming,
  onClose,
  onConfirm,
}: CloseAllOrdersModalProps) {
  const { t } = useTranslation("reconciliation");
  const { textPrimary, textTertiary, borderColor } = useThemeClasses();

  return (
    <ModalWrapper onClose={onClose} maxWidth="max-w-lg" height="">
      {/* Header */}
      <div
        className={`border-b ${borderColor} p-6 flex items-center justify-between flex-shrink-0`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${textPrimary}`}>
              {t("close_all_orders")}
            </h2>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-200">
                {t("close_all_orders_target_month", {
                  month: targetMonthLabel,
                })}
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                {t("close_all_orders_warning_desc")}
              </p>
            </div>
          </div>
        </div>

        {/* Swept-in older months - only ever populated when a previously
            disputed month has since fully resolved and is being folded into
            this same click, so the CFO sees it before confirming rather than
            discovering it afterward */}
        {isLoadingPreview && (
          <div className={`flex items-center gap-2 text-sm ${textTertiary}`}>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("close_all_orders_checking_older_months")}
          </div>
        )}

        {/* a failed preview must never be silently treated as "nothing to
            sweep" - the backend's finalize step still runs its own sweep
            regardless of what this preview showed, so the CFO needs to know
            this check didn't actually happen before confirming */}
        {!isLoadingPreview && hasPreviewError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-300">
              {t("close_all_orders_preview_error")}
            </p>
          </div>
        )}

        {!isLoadingPreview && !hasPreviewError && sweptMonths.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-2">
              {t("close_all_orders_also_includes")}
            </p>
            <ul className="space-y-1">
              {sweptMonths.map((month) => (
                <li
                  key={month.label}
                  className="text-sm text-amber-800 dark:text-amber-300 flex items-center justify-between"
                >
                  <span>{formatMonthLabel(month.label)}</span>
                  <span className="font-medium">
                    ₪{month.payoutAmount.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className={`text-sm ${textTertiary}`}>
          {t("close_all_orders_ignores_filter_notice")}
        </p>
      </div>

      {/* Actions */}
      <div
        className={`border-t ${borderColor} p-6 flex items-center justify-end gap-3 flex-shrink-0`}
      >
        <button
          onClick={onClose}
          disabled={isConfirming}
          className={`px-4 py-2 rounded-lg border ${borderColor} ${textTertiary} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {t("go_back")}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoadingPreview || hasPreviewError || isConfirming}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors inline-flex items-center gap-2"
        >
          {isConfirming && <Loader2 className="w-4 h-4 animate-spin" />}
          {t("close_all_orders_confirm", { month: targetMonthLabel })}
        </button>
      </div>
    </ModalWrapper>
  );
}
