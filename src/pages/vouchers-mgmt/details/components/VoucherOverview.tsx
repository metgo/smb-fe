import React from "react";
import { Calendar, Clock, Globe } from "lucide-react";
import { formatDate } from "@/helpers";

interface Voucher {
  code: string;
  type?: string;
  campaign?: string;
  paymentStatus?: "completed" | "refunded" | string;
  amount: number;
  remainingAmount: number;
  expireDate: string;
  websites?: string[];
}

interface VoucherOverviewProps {
  voucher: Voucher;
  isExpired: (date?: string) => boolean;
  isExpiringSoon: (date?: string) => boolean;
  isDark: boolean;
  t: any;
}

const VoucherOverview: React.FC<VoucherOverviewProps> = ({
  voucher,
  isExpired,
  isExpiringSoon,
  isDark,
  t,
}) => {
  const getPaymentStatusClasses = (status?: string) => {
    if (status === "completed")
      return isDark
        ? "bg-green-900/30 text-green-300"
        : "bg-green-100 text-green-800";
    if (status === "refunded")
      return isDark
        ? "bg-orange-900/30 text-orange-300"
        : "bg-orange-100 text-orange-800";
    return isDark
      ? "bg-yellow-900/30 text-yellow-300"
      : "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Voucher Information */}
        <div
          className={`rounded-lg border p-6 ${
            isDark ? "bg-gray-800 border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <h3
            className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {t("voucher_information")}
          </h3>
          <div className="space-y-4">
            <div>
              <label
                className={`block text-xs mb-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                {t("voucher_code")}
              </label>
              <div className={isDark ? "text-gray-100" : "text-gray-900"}>
                {voucher?.code}
              </div>
            </div>
            <div>
              <label
                className={`block text-xs mb-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                {t("type")}
              </label>
              <div
                className={`${isDark ? "text-gray-100" : "text-gray-900"} capitalize`}
              >
                {voucher?.type || ""}
              </div>
            </div>
            <div>
              <label
                className={`block text-xs mb-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                {t("campaign")}
              </label>
              <div className={isDark ? "text-gray-100" : "text-gray-900"}>
                {voucher?.campaign || "-"}
              </div>
            </div>
            <div>
              <label
                className={`block text-xs mb-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                {t("payment_status")}
              </label>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getPaymentStatusClasses(
                  voucher?.paymentStatus,
                )}`}
              >
                {voucher?.paymentStatus
                  ? voucher.paymentStatus.charAt(0).toUpperCase() +
                    voucher.paymentStatus.slice(1)
                  : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div
          className={`rounded-lg border p-6 ${
            isDark ? "bg-gray-800 border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <h3
            className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {t("financial_details")}
          </h3>
          <div className="space-y-4">
            <div>
              <label
                className={`block text-xs mb-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                {t("original_amount")}
              </label>
              <div
                className={`${isDark ? "text-gray-100" : "text-gray-900"} text-2xl`}
              >
                ₪{voucher?.amount}
              </div>
            </div>
            <div>
              <label
                className={`block text-xs mb-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                {t("remaining_amount")}
              </label>
              <div className="text-2xl text-teal-600 dark:text-teal-400">
                ₪{voucher?.remainingAmount}
              </div>
            </div>
            <div>
              <label
                className={`block text-xs mb-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                {t("used_amount")}
              </label>
              <div className={isDark ? "text-gray-100" : "text-gray-900"}>
                ₪{voucher?.amount - voucher?.remainingAmount}
              </div>
            </div>
          </div>
        </div>

        {/* Expiration */}
        <div
          className={`rounded-lg border p-6 ${
            isDark ? "bg-gray-800 border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <div className="space-y-4">
            <div>
              <label
                className={`block text-xs mb-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                {t("expiration_date")}
              </label>
              <div
                className={`flex items-center gap-2 ${
                  isExpired(voucher?.expireDate)
                    ? "text-red-600"
                    : isExpiringSoon(voucher?.expireDate)
                      ? "text-orange-600"
                      : isDark
                        ? "text-gray-100"
                        : "text-gray-900"
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>{formatDate(voucher?.expireDate)}</span>
              </div>
              {isExpiringSoon(voucher?.expireDate) &&
                !isExpired(voucher?.expireDate) && (
                  <div
                    className={`mt-2 text-xs flex items-center gap-1 ${
                      isDark ? "text-orange-400" : "text-orange-600"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {t("expiring_soon")}
                  </div>
                )}
              {isExpired(voucher?.expireDate) && (
                <div
                  className={`mt-2 text-xs ${
                    isDark ? "text-red-400" : "text-red-600"
                  }`}
                >
                  {t("voucher_expired")}
                </div>
              )}
            </div>
            <button className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              {t("extend_expiration")}
            </button>
          </div>
        </div>

        {/* Applicable Websites */}
        <div
          className={`rounded-lg border p-6 ${
            isDark ? "bg-gray-800 border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <h3
            className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {t("applicable_websites")}
          </h3>
          <div className="space-y-2">
            {voucher?.websites?.map((website, index) => (
              <div
                key={index}
                className={`${isDark ? "text-gray-100" : "text-gray-900"} flex items-center gap-2`}
              >
                <Globe className="w-4 h-4 text-gray-400" />
                {website}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherOverview;
