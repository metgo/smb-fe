import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";

interface BulkStatusChangeBtnProps {
  handleBulkStatusChange: (v: TStatus) => void;
}

const BulkStatusChangeBtn: React.FC<BulkStatusChangeBtnProps> = ({
  handleBulkStatusChange,
}) => {
  const { t } = useTranslation("common");
  const { theme, isRTL } = useAppSelector((state) => state.settings);

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const statusConfig = {
    draft: { color: "bg-gray-500", label: t("draft") },
    pending: { color: "bg-yellow-500", label: t("pending") },
    approved: { color: "bg-green-500", label: t("approved") },
    rejected: { color: "bg-red-500", label: t("rejected") },
    archived: { color: "bg-gray-400", label: t("archived") },
    active: { color: "bg-gray-400", label: t("active") },
    inactive: { color: "bg-gray-400", label: t("inactive") },
  };

  const handleStatusChange = (newStatus: Product["status"]) => {
    handleBulkStatusChange(newStatus);
    setShowStatusDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-opacity border border-blue-500 text-blue-500 font-medium  `}
      >
        <span>{t("change_status")}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${showStatusDropdown ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {showStatusDropdown && (
        <div
          className={`absolute ${isRTL ? "left-0" : "-right-4"} top-full mt-2 w-48 rounded-lg shadow-lg border z-60 ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-300"
          }`}
        >
          <div
            className={`p-2 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
          >
            <p
              className={`text-xs px-2 py-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
            >
              {t("status")}
            </p>
          </div>

          <div className="p-2">
            {(Object.keys(statusConfig) as Array<Product["status"]>).map(
              (statusKey) => {
                const statusOption = statusConfig[statusKey];
                return (
                  <button
                    key={statusKey}
                    onClick={() => handleStatusChange(statusKey)}
                    className={`w-full text-${isRTL ? "right" : "left"} px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                      theme === "dark"
                        ? "hover:bg-gray-700 text-gray-300"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${statusOption.color}`}
                      />
                      <span>{statusOption.label}</span>
                    </div>
                  </button>
                );
              },
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkStatusChangeBtn;
