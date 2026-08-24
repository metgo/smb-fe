import { Download, Loader2 } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useExportVendorwiseXlsxMutation } from "@/store/api/reconciliationQueryApi";

interface ExportOrdersButtonProps {
  vendorId: string;
  vendorName: string;
  t: (key: string) => string;
  monthFilter?: string;
  customDateFrom?: string;
  customDateTo?: string;
}

export default function ExportOrdersButton({
  vendorId,
  vendorName,
  t,
  monthFilter,
  customDateFrom,
  customDateTo,
}: ExportOrdersButtonProps) {
  console.log("🚀 ~ ExportOrdersButton ~ vendorId:", vendorId);
  const { isDark, language } = useThemeClasses();
  const [exportVendorwiseXlsx, { isLoading }] =
    useExportVendorwiseXlsxMutation();

  const getYearMonth = () => {
    if (monthFilter === "custom" && (customDateFrom || customDateTo)) {
      const date = new Date(customDateFrom || customDateTo || "");
      return { year: date.getFullYear(), month: date.getMonth() + 1 };
    }
    if (monthFilter && monthFilter !== "all" && monthFilter !== "custom") {
      const [month, year] = monthFilter.split("-").map(Number);
      return { year, month };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  };

  const getDateLabel = () => {
    if (monthFilter === "custom" && (customDateFrom || customDateTo)) {
      return customDateFrom && customDateTo
        ? `${customDateFrom}_to_${customDateTo}`
        : customDateFrom || customDateTo;
    }
    if (monthFilter && monthFilter !== "all" && monthFilter !== "custom") {
      return monthFilter;
    }
    return new Date().toISOString().slice(0, 10);
  };

  const handleExport = async () => {
    if (!vendorId) return;
    const { year, month } = getYearMonth();
    try {
      const blob = await exportVendorwiseXlsx({
        vendorId,
        year,
        month,
        locale: language,
      }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${vendorName}_${getDateLabel()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export vendorwise xlsx:", error);
    }
  };

  const btnBase = `px-4 py-2 rounded-lg border flex items-center gap-1.5 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
    isDark
      ? "border-gray-700 hover:bg-gray-800 text-gray-300"
      : "border-gray-300 hover:bg-gray-100 text-gray-700"
  }`;

  return (
    <button
      onClick={handleExport}
      disabled={!vendorId || isLoading}
      className={btnBase}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
      ) : (
        <Download className="w-4 h-4 shrink-0" />
      )}
      <span className="hidden sm:inline">{t("export")}</span>
    </button>
  );
}
