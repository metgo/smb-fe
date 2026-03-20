import clsx from "clsx";
import { Download, Mail, Trash, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

import { StatusChangeBtn } from "../btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface BulkActionBarProps {
  selectedItemCount: number;
  handleBulkStatusChange?: (v: TStatus) => void;
  handleBulkDelete?: () => void;
  hancleClearSelection?: () => void;
  handleResendToVendor?: (v: string) => void;
  handleResendToCustomer?: (v: string) => void;
  handleExportCSV?: () => void;
  handleSendSMS?: () => void;
  handleSendEmail?: () => void;
  // handleExtendExpiration?: () => void;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  handleBulkStatusChange,
  selectedItemCount,
  handleBulkDelete,
  hancleClearSelection,
  handleResendToVendor,
  handleExportCSV,
  handleResendToCustomer,
  handleSendEmail,
  handleSendSMS,
  // handleExtendExpiration,
}) => {
  const { t } = useTranslation("common");
  const { t: to } = useTranslation("orders");
  const { t: tv } = useTranslation("vouchers");

  const { theme } = useThemeClasses();
  const isDark = theme === "dark";

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
      <div className="flex items-center gap-4">
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
            "text-sm underline font-semibold text-blue-500 hover:text-red-500",
          )}
        >
          {t("clear_selection")}
        </button>
        {handleResendToVendor && (
          <button
            type="button"
            onClick={() => handleResendToVendor("VENDOR")}
            className={clsx(
              "px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 border",
              `border-blue-500 text-white bg-blue-500`,
              `hover:bg-blue-500 hover:text-white`,
            )}
          >
            {" "}
            <Mail className="w-4 h-4" />
            <span>{to("resend_order_vendor")}</span>
          </button>
        )}
        {handleResendToCustomer && (
          <button
            type="button"
            onClick={() => handleResendToCustomer("CUSTOMER")}
            className={clsx(
              "px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 border",
              `border-blue-500 text-white bg-blue-500`,
              `hover:bg-blue-500 hover:text-white`,
            )}
          >
            {" "}
            <Mail className="w-4 h-4" />
            <span>{to("resend_order_customer")}</span>
          </button>
        )}
        {handleExportCSV && (
          <button
            onClick={handleExportCSV}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              isDark
                ? "border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300"
                : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{to("downloadCSV")}</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {handleBulkStatusChange && (
          <StatusChangeBtn
            status="draft"
            handleStatusChange={handleBulkStatusChange}
          />
        )}
        {handleBulkDelete && (
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
        )}
        {/* New Bulk Actions */}

        {handleSendEmail && (
          <button
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm border transition-colors ${
              isDark
                ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={handleSendEmail}
          >
            <Mail className="w-4 h-4" /> {tv("send_email")}
          </button>
        )}
        {handleSendSMS && (
          <button
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm border transition-colors ${
              isDark
                ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={handleSendSMS}
          >
            <Send className="w-4 h-4" /> {tv("send_sms")}
          </button>
        )}

        {/* {handleExtendExpiration && (
          <button
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm border transition-colors ${
              isDark
                ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={handleExtendExpiration}
          >
            <Calendar className="w-4 h-4" /> {tv("extend_expiration")}
          </button>
        )} */}

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
