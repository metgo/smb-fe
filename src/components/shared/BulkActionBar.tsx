import clsx from "clsx";
import { Trash } from "lucide-react";
import { useTranslation } from "react-i18next";

import { BulkStatusChangeBtn } from "../btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface BulkActionBarProps {
  selectedItemCount: number;
  handleBulkStatusChange: (v: TStatus) => void;
  onBulkAction: {
    approve?: () => void;
    reject?: () => void;
    archive?: () => void;
    draft?: () => void;
    pending?: () => void;
    delete?: () => void;
    csvExport?: () => void;
    pdfExport?: () => void;
  };
  isDelete?: boolean;
}

interface ActionButton {
  key: keyof BulkActionBarProps["onBulkAction"];
  label: string;
  icon: React.ReactNode;
  color: string;
}

const ACTIONS: ActionButton[] = [
  {
    key: "delete",
    label: "delete",
    icon: <Trash className="w-4 h-4" />,
    color: "red",
  },
];

// const EXPORTS: ActionButton[] = [
//   { key: "csvExport", label: "csv_export", icon: <File className="w-4 h-4" />, color: "teal" },
//   { key: "pdfExport", label: "pdf_export", icon: <File className="w-4 h-4" />, color: "red" },
// ];

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  handleBulkStatusChange,
  selectedItemCount,
  onBulkAction,
  isDelete = false,
}) => {
  const { t } = useTranslation("common");
  const { theme } = useThemeClasses();
  const isDark = theme === "dark";

  if (!selectedItemCount) return null;

  const renderButton = ({ key, label, icon, color }: ActionButton) => {
    const action = onBulkAction[key];
    if (!action) return null;
    if (key === "delete" && isDelete) return null;

    return (
      <button
        key={key}
        onClick={action}
        className={clsx(
          "px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 border",
          `border-${color}-500 text-${color}-500`,
          `hover:bg-${color}-500 hover:text-white`,
        )}
      >
        {icon}
        {t(label)}
      </button>
    );
  };

  return (
    <div
      className={clsx(
        "px-6 py-3 border border-teal-400/40 flex items-center justify-between shadow rounded-md",
        isDark
          ? "border-gray-800 bg-teal-900/20"
          : "border-gray-200 bg-teal-50",
      )}
    >
      <span
        className={clsx("text-sm", isDark ? "text-gray-300" : "text-gray-700")}
      >
        {selectedItemCount} {t("selected")}
      </span>

      <div className="flex items-center gap-4">
        <BulkStatusChangeBtn handleBulkStatusChange={handleBulkStatusChange} />

        <div className="flex items-center gap-2">
          {ACTIONS.map(renderButton)}
        </div>

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
