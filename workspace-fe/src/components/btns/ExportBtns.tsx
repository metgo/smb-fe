import { useTranslation } from "react-i18next";
import { TooltipWrapper } from "../wrapper";
import { FileDown, FileSpreadsheet, Loader2 } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ExportBtnsProps {
  exportToCSV?: () => void;
  exportToPDF?: () => void;
  isCsvExporting: boolean;
}

const ExportBtns: React.FC<ExportBtnsProps> = ({
  exportToCSV,
  exportToPDF,
  isCsvExporting,
}) => {
  const { t } = useTranslation("common");
  const { exportBtnBgClasses } = useThemeClasses();

  return (
    <div className="flex items-center gap-2">
      {exportToCSV && (
        <TooltipWrapper infoText={t("download_csv")}>
          <button
            onClick={exportToCSV}
            title={t("download_csv")}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${exportBtnBgClasses}`}
          >
            {isCsvExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
          </button>
        </TooltipWrapper>
      )}

      {exportToPDF && (
        <TooltipWrapper infoText={t("download_pdf")}>
          <button
            onClick={exportToPDF}
            title={t("download_pdf")}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${exportBtnBgClasses}`}
          >
            <FileDown className="w-4 h-4" />
          </button>
        </TooltipWrapper>
      )}
    </div>
  );
};

export default ExportBtns;
