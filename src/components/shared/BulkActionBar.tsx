import clsx from "clsx";
import { Trash } from "lucide-react";
import { useTranslation } from "react-i18next";

import { StatusChangeBtn } from "../btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface BulkActionBarProps {
  isProduct?: boolean;
  selectedItemCount: number;
  handleBulkStatusChange: (v: TStatus) => void;
  handleBulkDelete: () => void;
  hancleClearSelection?: () => void;
}

// const EXPORTS: ActionButton[] = [
//   { key: "csvExport", label: "csv_export", icon: <File className="w-4 h-4" />, color: "teal" },
//   { key: "pdfExport", label: "pdf_export", icon: <File className="w-4 h-4" />, color: "red" },
// ];

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  isProduct = false,
  handleBulkStatusChange,
  selectedItemCount,
  handleBulkDelete,
  hancleClearSelection,
}) => {
  const { t } = useTranslation("common");
  const { isDark } = useThemeClasses();

  if (!selectedItemCount) return null;

  return (
    <div
      className={clsx(
        "px-6 py-3 border border-teal-400/40 flex items-center justify-between shadow rounded-md",
        isDark
          ? "border-gray-800 bg-teal-900/20"
          : "border-gray-200 bg-teal-50",
      )}
    >
      <div>
        <span
          className={clsx(
            "text-sm",
            isDark ? "text-gray-300" : "text-gray-700",
          )}
        >
          {selectedItemCount} {t("selected")}
        </span>
        <button
          type="button"
          onClick={hancleClearSelection}
          className={clsx(
            "ml-4 text-sm underline font-semibold text-blue-500 hover:text-red-500",
          )}
        >
          {t("clear_selection")}
        </button>
      </div>

      <div className="flex items-center gap-4">
        <StatusChangeBtn
          status="draft"
          isProduct={isProduct}
          handleStatusChange={handleBulkStatusChange}
        />

        <button
          onClick={handleBulkDelete}
          className={clsx(
            "px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 border",
            `border-red-500 text-red-500`,
            `hover:bg-red-500 hover:text-white`,
          )}
        >
          <Trash size={18} />
          {t("delete")}
        </button>

        {/* Exports */}
        {/* <div className="flex items-center gap-2">
          <span>{t("export")}: </span>
          <div className="flex items-center gap-2">{EXPORTS.map(renderButton)}</div>
        </div> */}
      </div>
    </div>
  );
};

export default BulkActionBar;
