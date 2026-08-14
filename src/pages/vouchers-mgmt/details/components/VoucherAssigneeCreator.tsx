import React from "react";
import { Mail, Phone } from "lucide-react";
import { getInitials } from "@/helpers";

interface PersonInfo {
  name: string;
  email?: string;
  phone?: string;
  assignedAt?: string;
}

interface VoucherAssigneeCreatorProps {
  voucher: {
    assigneeInfo?: PersonInfo;
    creatorInfo?: PersonInfo;
    assignedAt?: string;
    createdAt?: string;
  };
  formatDate: any;
  isDark: boolean;
  t: (key: string) => string;
}

const VoucherAssigneeCreator: React.FC<VoucherAssigneeCreatorProps> = ({
  voucher,
  formatDate,
  isDark,
  t,
}) => {
  const textColor = isDark ? "text-gray-100" : "text-gray-900";
  const labelColor = isDark ? "text-gray-500" : "text-gray-400";

  const contactChip = (
    href: string,
    icon: React.ReactNode,
    label: string,
    isDarkMode: boolean,
  ) => (
    <a
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
        isDarkMode
          ? "bg-gray-800 text-teal-400 hover:bg-gray-700"
          : "bg-gray-50 text-teal-700 hover:bg-teal-50"
      }`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </a>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Assignee Information */}
        <div
          className={`rounded-xl border p-5 ${
            isDark
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          {/* Card header with avatar */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                isDark
                  ? "bg-violet-900/40 text-violet-300"
                  : "bg-violet-100 text-violet-700"
              }`}
            >
              {getInitials(voucher?.assigneeInfo?.name)}
            </div>
            <div>
              <h3
                className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                {t("assignee_information")}
              </h3>
              <p
                className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                {voucher?.assigneeInfo?.name || "—"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className={`block text-xs mb-1.5 ${labelColor}`}>
                {t("email")}
              </label>
              {voucher?.assigneeInfo?.email ? (
                contactChip(
                  `mailto:${voucher.assigneeInfo.email}`,
                  <Mail className="w-4 h-4 shrink-0" />,
                  voucher.assigneeInfo.email,
                  isDark,
                )
              ) : (
                <div className={`text-sm ${textColor}`}>—</div>
              )}
            </div>
            <div>
              <label className={`block text-xs mb-1.5 ${labelColor}`}>
                {t("phone")}
              </label>
              {voucher?.assigneeInfo?.phone ? (
                contactChip(
                  `tel:${voucher.assigneeInfo.phone}`,
                  <Phone className="w-4 h-4 shrink-0" />,
                  voucher.assigneeInfo.phone,
                  isDark,
                )
              ) : (
                <div className={`text-sm ${textColor}`}>—</div>
              )}
            </div>
            <div>
              <label className={`block text-xs mb-1 ${labelColor}`}>
                {t("assigned_at")}
              </label>
              <div className={`text-sm ${textColor}`}>
                {formatDate(voucher?.assigneeInfo?.assignedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Creator Information */}
        <div
          className={`rounded-xl border p-5 ${
            isDark
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          {/* Card header with avatar */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                isDark
                  ? "bg-blue-900/40 text-blue-300"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {getInitials(voucher?.creatorInfo?.name)}
            </div>
            <div>
              <h3
                className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                {t("creator_information")}
              </h3>
              <p
                className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                {voucher?.creatorInfo?.name || "—"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className={`block text-xs mb-1 ${labelColor}`}>
                {t("creator_email")}
              </label>
              <div className={`text-sm ${textColor}`}>
                {voucher?.creatorInfo?.email || "—"}
              </div>
            </div>
            <div>
              <label className={`block text-xs mb-1 ${labelColor}`}>
                {t("created_at")}
              </label>
              <div className={`text-sm ${textColor}`}>
                {formatDate(voucher?.createdAt)}
              </div>
            </div>
            <div>
              <label className={`block text-xs mb-1 ${labelColor}`}>
                {t("system_generated")}
              </label>
              <div
                className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                {t("via_admin_console")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherAssigneeCreator;
