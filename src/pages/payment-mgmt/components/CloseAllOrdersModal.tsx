import * as XLSX from "xlsx";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import ModalWrapper from "@/components/wrapper/ModalWrapper";
import { useExportBankTransferXlsxMutation } from "@/store/api/reconciliationQueryApi";
import { getYearMonthFromFilter } from "@/helpers";

interface SweptMonth {
  label: string; // "MM/YYYY" from the backend
  payoutAmount: number;
}

interface CloseAllOrdersModalProps {
  targetMonthLabel: string;
  monthFilter: string;
  customDateFrom?: string;
  customDateTo?: string;
  sweptMonths: SweptMonth[];
  isLoadingPreview: boolean;
  hasPreviewError: boolean;
  isConfirming: boolean;
  onClose: () => void;
  onConfirm: () => void;
  previewErrorMessage?: string;
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

// "July 2026" -> { year: 2026, month: 7 } - parses closeAllOrdersTargetMonthLabel
// (a locale long-month-name string) back into numeric parts for filenames/exports
function getYearMonthFromLabel(
  label: string,
): { year: number; month: number } | null {
  const match = label.match(/^(\S+)\s+(\d{4})$/);
  if (!match) return null;
  const [, monthName, yearStr] = match;
  const year = Number(yearStr);
  const month = new Date(Date.parse(`${monthName} 1, ${year}`)).getMonth() + 1;
  if (!year || !month || Number.isNaN(month)) return null;
  return { year, month };
}

export default function CloseAllOrdersModal({
  targetMonthLabel,
  monthFilter,
  customDateFrom,
  customDateTo,
  sweptMonths,
  isLoadingPreview,
  hasPreviewError,
  isConfirming,
  onClose,
  onConfirm,
  previewErrorMessage,
}: CloseAllOrdersModalProps) {
  const { t } = useTranslation("reconciliation");
  const {
    textPrimary,
    textTertiary,
    textSecondary,
    borderColor,
    isDark,
    language,
  } = useThemeClasses();

  const [exportBankTransferXlsx, { isLoading: isExporting, data: xlsxData }] =
    useExportBankTransferXlsxMutation();
  const [sheetRows, setSheetRows] = useState<string[][]>([]);
  const [parseError, setParseError] = useState(false);
  const hasTriggeredExportRef = useRef(false);

  useEffect(() => {
    // guards against StrictMode's dev-only double-invoke of effects, which
    // would otherwise fire this non-idempotent export mutation twice
    if (hasTriggeredExportRef.current) return;
    hasTriggeredExportRef.current = true;

    const parsedTargetMonth = getYearMonthFromLabel(targetMonthLabel);
    const { year, month } =
      parsedTargetMonth ??
      getYearMonthFromFilter(monthFilter, customDateFrom, customDateTo);

    exportBankTransferXlsx({ year, month, locale: language })
      .unwrap()
      .catch((error) => {
        console.error("Failed to export bank transfer xlsx:", error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Parse the returned xlsx blob into rows for an inline preview table
  useEffect(() => {
    if (!xlsxData) return;

    xlsxData
      .arrayBuffer()
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
          header: 1,
        });
        setSheetRows(rows);
      })
      .catch((error) => {
        console.error("Failed to parse bank transfer xlsx:", error);
        setParseError(true);
      });
  }, [xlsxData]);

  const handleDownload = () => {
    if (!xlsxData) return;
    const parsedTargetMonth = getYearMonthFromLabel(targetMonthLabel);
    const { year, month } =
      parsedTargetMonth ??
      getYearMonthFromFilter(monthFilter, customDateFrom, customDateTo);
    const monthName = new Date(year, month - 1, 1).toLocaleString("en-US", {
      month: "long",
    });
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const fileName = `bank-transfer-${year}-${monthName}-${hours}-${minutes}-${seconds}.xlsx`;

    const url = window.URL.createObjectURL(xlsxData);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const [headerRow, ...bodyRows] = sheetRows;

  return (
    <ModalWrapper
      onClose={onClose}
      maxWidth={"max-w-4xl"}
      height={"h-auto max-h-[85vh]"}
    >
      <div>
        {/* Xlsx files */}
        <div className="flex flex-col overflow-hidden ">
          {isExporting ? (
            <div className="flex flex-col items-center justify-center space-y-4 p-6">
              <Loader2 className="w-16 h-16 animate-spin text-teal-600" />
              <h3 className={`text-xl font-bold ${textPrimary}`}>
                {t("loading")}
              </h3>
              <p className={`text-sm ${textTertiary}`}>
                {t("bank_transfer_export_generating")}
              </p>
            </div>
          ) : (
            <>
              <div
                className={`border-b ${borderColor} p-6 flex items-center justify-between shrink-0`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    className={`w-8 h-8 shrink-0 ${isDark ? "text-green-400" : "text-green-600"}`}
                  />
                  <div>
                    <h3 className={`text-lg font-bold ${textPrimary}`}>
                      {t("bank_transfer_export_ready")}
                    </h3>
                    <p className={`text-sm ${textTertiary}`}>
                      {t("bank_transfer_export_desc")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 overflow-auto">
                {parseError ? (
                  <p className={`text-sm ${textTertiary}`}>
                    {t("bank_transfer_export_preview_error")}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border-collapse">
                      {headerRow && (
                        <thead>
                          <tr>
                            {headerRow.map((cell, idx) => (
                              <th
                                key={idx}
                                className={`text-left px-3 py-2 border ${borderColor} font-semibold ${textPrimary} ${
                                  isDark ? "bg-gray-800" : "bg-gray-50"
                                }`}
                              >
                                {cell}
                              </th>
                            ))}
                          </tr>
                        </thead>
                      )}
                      <tbody>
                        {bodyRows.map((row, rowIdx) => (
                          <tr key={rowIdx}>
                            {row.map((cell, cellIdx) => (
                              <td
                                key={cellIdx}
                                className={`px-3 py-2 border ${borderColor} ${textSecondary}`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Warning info */}
        <div className=" p-4 space-y-4 ">
          <div
            className={`border rounded-lg p-4 ${
              isDark
                ? "bg-red-900/20 border-red-800"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  isDark ? "text-red-400" : "text-red-600"
                }`}
              />
              <div>
                <p
                  className={`text-sm font-medium ${isDark ? "text-red-200" : "text-red-900"}`}
                >
                  {t("close_all_orders_target_month", {
                    month: targetMonthLabel,
                  })}
                </p>
                <p
                  className={`text-xs mt-1 ${isDark ? "text-red-300" : "text-red-700"}`}
                >
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
              {previewErrorMessage || t("close_all_orders_preview_error")}
            </div>
          )}

          {/* a failed preview must never be silently treated as "nothing to
                sweep" - the backend's finalize step still runs its own sweep
                regardless of what this preview showed, so the CFO needs to know
                this check didn't actually happen before confirming */}
          {!isLoadingPreview && hasPreviewError && (
            <div
              className={`border rounded-lg p-4 ${
                isDark
                  ? "bg-red-900/20 border-red-800"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <p
                className={`text-sm ${isDark ? "text-red-300" : "text-red-800"}`}
              >
                {t("close_all_orders_preview_error")}
              </p>
            </div>
          )}

          {!isLoadingPreview && !hasPreviewError && sweptMonths.length > 0 && (
            <div
              className={`border rounded-lg p-4 ${
                isDark
                  ? "bg-amber-900/20 border-amber-800"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <p
                className={`text-sm font-medium mb-2 ${
                  isDark ? "text-amber-200" : "text-amber-900"
                }`}
              >
                {t("close_all_orders_also_includes")}
              </p>
              <ul className="space-y-1">
                {sweptMonths.map((month) => (
                  <li
                    key={month.label}
                    className={`text-sm flex items-center justify-between ${
                      isDark ? "text-amber-300" : "text-amber-800"
                    }`}
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
            {t("close_all_orders_disputed_notice")}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div
        className={`border-t ${borderColor} p-4 flex items-center justify-end gap-3 shrink-0`}
      >
        <button
          onClick={onClose}
          type="button"
          disabled={isConfirming}
          className={`px-4 py-2 cursor-pointer rounded-lg border ${borderColor} ${textTertiary} ${
            isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
          } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {t("go_back")}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!xlsxData}
          className="px-4 py-2 cursor-pointer rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
        >
          {t("download")}
        </button>
        <button
          onClick={onConfirm}
          type="button"
          disabled={isLoadingPreview || hasPreviewError || isConfirming}
          className="px-4 py-2 cursor-pointer rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors inline-flex items-center gap-2"
        >
          {isConfirming && <Loader2 className="w-4 h-4 animate-spin" />}
          {t("close_all_orders_confirm", { month: targetMonthLabel })}
        </button>
      </div>
    </ModalWrapper>
  );
}
