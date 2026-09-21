import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Pencil,
  X,
  Check,
  Tag,
  CreditCard,
  QrCode,
} from "lucide-react";
import { formatDate } from "@/helpers";
import { toast } from "sonner";
import { useUpdateVoucherMutation } from "@/store/api/voucherMutationApi";
import { useUserRoles } from "@/hooks/useUserRoles";

interface Voucher {
  code: string;
  type?: string;
  campId?: {
    name: string;
    _id: string;
  };
  paymentStatus?: "completed" | "refunded" | string;
  amount: number;
  remainingAmount: number;
  expireDate: string;
  websites?: string[];
  qrCodeUrl?: string;
}

interface VoucherOverviewProps {
  voucher: Voucher;
  isExpired: (date: string) => boolean;
  isExpiringSoon: (date: string) => boolean;
  isDark: boolean;
  t: any;
  voucherId: string;
  onSuccess?: () => void;
}

const VoucherOverview: React.FC<VoucherOverviewProps> = ({
  voucher,
  isExpired,
  isExpiringSoon,
  isDark,
  t,
  voucherId,
  onSuccess,
}) => {
  const { isSuperadmin } = useUserRoles();
  const [updateVoucher, { isLoading: isExtending }] =
    useUpdateVoucherMutation();

  const [editing, setEditing] = useState(false);
  const [newDate, setNewDate] = useState(
    voucher?.expireDate?.slice(0, 10) ?? "",
  );

  const handleExtend = async () => {
    if (!newDate) return;
    try {
      await updateVoucher({
        voucherId,
        body: { expireDate: new Date(newDate).toISOString() },
      }).unwrap();
      toast.success(
        t("expiry_extended_successfully", {
          defaultValue: "Expiry date updated successfully",
        }),
      );
      setEditing(false);
      onSuccess?.();
    } catch {
      toast.error(
        t("failed_to_extend_expiry", {
          defaultValue: "Failed to update expiry date",
        }),
      );
    }
  };

  const handleCancel = () => {
    setNewDate(voucher?.expireDate?.slice(0, 10) ?? "");
    setEditing(false);
  };

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

  const expired = isExpired(voucher?.expireDate);
  const expiringSoon = isExpiringSoon(voucher?.expireDate);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Voucher Information */}
        <div
          className={`rounded-xl border p-5 ${
            isDark
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isDark ? "bg-teal-900/40 text-teal-400" : "bg-teal-50 text-teal-600"}`}
            >
              <Tag className="w-3.5 h-3.5" />
            </div>
            <h3
              className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {t("voucher_information")}
            </h3>
          </div>
          <div className="space-y-4">
            {isSuperadmin && (
              <div>
                <label
                  className={`block text-xs mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  {t("voucher_code")}
                </label>
                <div
                  className={`font-mono font-medium ${isDark ? "text-gray-100" : "text-gray-900"}`}
                >
                  {voucher?.code}
                </div>
              </div>
            )}
            <div>
              <label
                className={`block text-xs mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                {t("type")}
              </label>
              <div
                className={`${isDark ? "text-gray-100" : "text-gray-900"} capitalize`}
              >
                {voucher?.type || "—"}
              </div>
            </div>
            <div>
              <label
                className={`block text-xs mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                {t("campaign")}
              </label>
              <div className={isDark ? "text-gray-100" : "text-gray-900"}>
                {voucher?.campId?.name || "—"}
              </div>
            </div>
            <div>
              <label
                className={`block text-xs mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                {t("payment_status")}
              </label>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusClasses(voucher?.paymentStatus)}`}
              >
                {voucher?.paymentStatus
                  ? voucher.paymentStatus.charAt(0).toUpperCase() +
                    voucher.paymentStatus.slice(1)
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div
          className={`rounded-xl border p-5 ${
            isDark
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isDark ? "bg-teal-900/40 text-teal-400" : "bg-teal-50 text-teal-600"}`}
            >
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <h3
              className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {t("financial_details")}
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <label
                  className={`block text-xs mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  {t("original_amount")}
                </label>
                <div
                  className={`text-2xl font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}
                >
                  ₪{voucher?.amount}
                </div>
              </div>
              <div className="text-right">
                <label
                  className={`block text-xs mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  {t("remaining_amount")}
                </label>
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  ₪{voucher?.remainingAmount}
                </div>
              </div>
            </div>

            {/* Usage progress bar */}
            {voucher?.amount > 0 && (
              <div>
                <div
                  className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      voucher.remainingAmount === 0
                        ? "bg-red-500"
                        : voucher.remainingAmount < voucher.amount * 0.2
                          ? "bg-orange-500"
                          : "bg-teal-500"
                    }`}
                    style={{
                      width: `${Math.max(0, Math.min(100, (voucher.remainingAmount / voucher.amount) * 100))}%`,
                    }}
                  />
                </div>
                <div
                  className={`flex justify-between text-xs mt-1.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                >
                  <span>
                    {t("used_amount")}: ₪
                    {voucher.amount - voucher.remainingAmount}
                  </span>
                  <span className={isDark ? "text-teal-400" : "text-teal-600"}>
                    {Math.round(
                      (voucher.remainingAmount / voucher.amount) * 100,
                    )}
                    % {t("remaining_amount")}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expiration */}
      <div
        className={`rounded-xl border p-5 ${
          expired
            ? isDark
              ? "bg-red-950/20 border-red-800"
              : "bg-red-50 border-red-200"
            : expiringSoon
              ? isDark
                ? "bg-orange-950/20 border-orange-800"
                : "bg-orange-50 border-orange-200"
              : isDark
                ? "bg-gray-900 border-gray-800"
                : "bg-white border-gray-200 shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                expired
                  ? isDark
                    ? "bg-red-900/40 text-red-400"
                    : "bg-red-100 text-red-600"
                  : expiringSoon
                    ? isDark
                      ? "bg-orange-900/40 text-orange-400"
                      : "bg-orange-100 text-orange-600"
                    : isDark
                      ? "bg-teal-900/40 text-teal-400"
                      : "bg-teal-50 text-teal-600"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <label
              className={`text-sm font-semibold ${
                expired
                  ? isDark
                    ? "text-red-400"
                    : "text-red-600"
                  : expiringSoon
                    ? isDark
                      ? "text-orange-400"
                      : "text-orange-600"
                    : isDark
                      ? "text-gray-300"
                      : "text-gray-700"
              }`}
            >
              {t("expiration_date")}
            </label>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                isDark
                  ? "text-gray-400 hover:text-teal-400 hover:bg-gray-800"
                  : "text-gray-500 hover:text-teal-600 hover:bg-gray-100"
              }`}
            >
              <Pencil className="w-3 h-3" />
              <span>{t("extend", { defaultValue: "Extend" })}</span>
            </button>
          )}
        </div>

        {editing ? (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={newDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setNewDate(e.target.value)}
              className={`border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                isDark
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            />
            <button
              onClick={handleExtend}
              disabled={isExtending || !newDate}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-3.5 h-3.5" />
              {t("save", { defaultValue: "Save" })}
            </button>
            <button
              onClick={handleCancel}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                isDark
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <X className="w-3.5 h-3.5" />
              {t("cancel", { defaultValue: "Cancel" })}
            </button>
          </div>
        ) : (
          <div>
            <div
              className={`text-lg font-semibold ${
                expired
                  ? "text-red-600 dark:text-red-400"
                  : expiringSoon
                    ? "text-orange-600 dark:text-orange-400"
                    : isDark
                      ? "text-gray-100"
                      : "text-gray-900"
              }`}
            >
              {formatDate(voucher?.expireDate)}
            </div>
            {expiringSoon && !expired && (
              <div
                className={`mt-1.5 text-xs flex items-center gap-1 ${isDark ? "text-orange-400" : "text-orange-600"}`}
              >
                <Clock className="w-3 h-3" />
                {t("expiring_soon")}
              </div>
            )}
            {expired && (
              <div
                className={`mt-1.5 text-xs flex items-center gap-1 ${isDark ? "text-red-400" : "text-red-600"}`}
              >
                <Clock className="w-3 h-3" />
                {t("voucher_expired")}
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Code */}
      {voucher?.qrCodeUrl && (
        <div
          className={`rounded-xl border p-5 ${
            isDark
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isDark ? "bg-teal-900/40 text-teal-400" : "bg-teal-50 text-teal-600"}`}
            >
              <QrCode className="w-3.5 h-3.5" />
            </div>
            <h3
              className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {t("qr_code")}
            </h3>
          </div>
          <div className="flex flex-col items-center gap-2">
            <img
              src={voucher.qrCodeUrl}
              alt={t("qr_code")}
              className="w-48 h-48 rounded-lg"
            />
            <div
              className={`font-mono text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {voucher?.code}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherOverview;
