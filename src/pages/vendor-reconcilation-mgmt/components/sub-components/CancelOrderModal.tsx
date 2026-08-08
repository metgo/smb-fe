import { useState } from "react";
import { XCircle, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { MonthlyOrder } from "./VendorMonthlyReport";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import ModalWrapper from "@/components/wrapper/ModalWrapper";

interface CancelOrderModalProps {
  order: MonthlyOrder;
  onClose: () => void;
  onSubmit: (reason: string, notes: string, sendEmail: boolean) => void;
}

const cancelReasons = [
  "Out of stock",
  "Unable to fulfill",
  "Customer requested cancellation",
  "Pricing error",
  "Duplicate order",
  "Other please specify",
];

export default function CancelOrderModal({
  order,
  onClose,
  onSubmit,
}: CancelOrderModalProps) {
  const { t } = useTranslation("reconciliation");
  const {
    textPrimary,
    textSecondary,
    textTertiary,
    bgPrimary,
    bgSecondary,
    borderColor,
  } = useThemeClasses();

  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [errors, setErrors] = useState<{ reason?: string }>({});

  const validate = () => {
    const newErrors: { reason?: string } = {};

    if (!reason) {
      newErrors.reason = t("select_cancel_reason");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(reason, notes, sendEmail);
    }
  };

  return (
    <ModalWrapper onClose={onClose} maxWidth="max-w-2xl" height="">
      {/* Header */}
      <div
        className={`border-b ${borderColor} p-6 flex items-center justify-between shrink-0`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${textPrimary}`}>
              {t("cancel_order")}
            </h2>
            <p className={`text-sm ${textTertiary}`}>
              {t("order_number")} #{order._id}
            </p>
          </div>
        </div>
      </div>

      {/* Content - scrollable */}
      <div className="p-6 space-y-6 overflow-y-auto max-h-[65vh]">
        {/* Warning */}
        <div
          className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4`}
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p
                className={`text-sm font-medium text-red-900 dark:text-red-200`}
              >
                {t("warning_cancel_refund")}
              </p>
              <p className={`text-xs text-red-700 dark:text-red-300 mt-1`}>
                {t("cancel_refund_desc")}
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className={`${bgSecondary} rounded-lg p-4`}>
          <h3 className={`text-sm font-semibold ${textPrimary} mb-3`}>
            {t("order_information")}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={textTertiary}>{t("product_label")}</span>
              <span className={textSecondary}>{order.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className={textTertiary}>{t("customer")}</span>
              <span className={textSecondary}>{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className={textTertiary}>{t("amount_label")}</span>
              <span className={`${textPrimary} font-bold`}>
                ₪{order.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Cancellation Reason */}
        <div>
          <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
            {t("cancel_reason_label")} <span className="text-red-500">*</span>
          </label>
          <select
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setErrors({ ...errors, reason: undefined });
            }}
            className={`w-full px-4 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-red-500 ${
              errors.reason ? "border-red-500" : ""
            }`}
          >
            <option value="">{t("select_reason")}</option>
            {cancelReasons.map((r) => (
              <option key={r} value={r}>
                {t(r.toLowerCase().replace(/\s+/g, "_"))}
              </option>
            ))}
          </select>
          {errors.reason && (
            <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
          )}
        </div>

        {/* Additional Notes */}
        <div>
          <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
            {t("additional_notes_optional")}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("add_cancellation_notes")}
            rows={3}
            className={`w-full px-4 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-red-500 resize-none`}
          />
        </div>

        {/* Send Email Option */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="send-email"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <label htmlFor="send-email" className={`text-sm ${textSecondary}`}>
            {t("send_cancel_email")}
          </label>
        </div>
      </div>

      {/* Actions */}
      <div
        className={`border-t ${borderColor} p-6 flex items-center justify-end gap-3 shrink-0`}
      >
        <button
          onClick={onClose}
          className={`px-4 py-2 rounded-lg border ${borderColor} ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
        >
          {t("go_back")}
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          {t("confirm_cancel")}
        </button>
      </div>
    </ModalWrapper>
  );
}
