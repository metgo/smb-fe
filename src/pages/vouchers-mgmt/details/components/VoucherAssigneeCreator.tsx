import React from "react";
import { Mail, Phone } from "lucide-react";

interface PersonInfo {
  name: string;
  email?: string;
  phone?: string;
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
  t: any;
}

const VoucherAssigneeCreator: React.FC<VoucherAssigneeCreatorProps> = ({
  voucher,
  formatDate,
  isDark,
  t,
}) => {
  const textColor = isDark ? "text-gray-100" : "text-gray-900";
  const labelColor = isDark ? "text-gray-500" : "text-gray-500";
  const linkColor = isDark
    ? "text-teal-400 hover:underline"
    : "text-teal-600 hover:underline";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assignee Information */}
        <div
          className={`rounded-lg border p-6 ${
            isDark ? "bg-gray-800 border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <h3
            className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {t("assignee_information")}
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-xs mb-1 ${labelColor}`}>
                {t("name")}
              </label>
              <div className={textColor}>
                {voucher?.assigneeInfo?.name || "-"}
              </div>
            </div>
            <div>
              <label className={`block text-xs mb-1 ${labelColor}`}>
                {t("email")}
              </label>
              {voucher?.assigneeInfo?.email ? (
                <a
                  href={`mailto:${voucher.assigneeInfo.email}`}
                  className={`flex items-center gap-2 ${linkColor}`}
                >
                  <Mail className="w-4 h-4" />
                  {voucher.assigneeInfo.email}
                </a>
              ) : (
                <div className={textColor}>-</div>
              )}
            </div>
            <div>
              <label className={`block text-xs mb-1 ${labelColor}`}>
                {t("phone")}
              </label>
              {voucher?.assigneeInfo?.phone ? (
                <a
                  href={`tel:${voucher.assigneeInfo.phone}`}
                  className={`flex items-center gap-2 ${linkColor}`}
                >
                  <Phone className="w-4 h-4" />
                  {voucher.assigneeInfo.phone}
                </a>
              ) : (
                <div className={textColor}>-</div>
              )}
            </div>
            <div>
              <label className={`block text-xs mb-1 ${labelColor}`}>
                {t("assigned_at")}
              </label>
              <div className={textColor}>{formatDate(voucher?.assignedAt)}</div>
            </div>
          </div>
        </div>

        {/* Creator Information */}
        <div
          className={`rounded-lg border p-6 ${
            isDark ? "bg-gray-800 border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <h3
            className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {t("creator_information")}
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-xs mb-1 ${labelColor}`}>
                {t("created_by")}
              </label>
              <div className={textColor}>
                {voucher?.creatorInfo?.name || "-"}
              </div>
            </div>
            <div>
              <label className={`block text-xs mb-1 ${labelColor}`}>
                {t("creator_email")}
              </label>
              <div className={textColor}>
                {voucher?.creatorInfo?.email || "-"}
              </div>
            </div>
            <div>
              <label className={`block text-xs mb-1 ${labelColor}`}>
                {t("created_at")}
              </label>
              <div className={textColor}>{formatDate(voucher?.createdAt)}</div>
            </div>
            <div>
              <label className={`block text-xs mb-1 ${labelColor}`}>
                {t("system_generated")}
              </label>
              <div
                className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
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
