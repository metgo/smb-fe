import { useState } from "react";
import { X, XCircle, AlertTriangle } from "lucide-react";
import type { MonthlyOrder } from "./VendorMonthlyReport";
import { useAppSelector } from "@/hooks/hooks";

interface CancelOrderModalProps {
  order: MonthlyOrder;
  onClose: () => void;
  onSubmit: (reason: string, notes: string) => void;
}

const cancelReasons = [
  "Out of stock",
  "Unable to fulfill",
  "Customer requested cancellation",
  "Pricing error",
  "Duplicate order",
  "Other (please specify)",
];

export default function CancelOrderModal({
  order,
  onClose,
  onSubmit,
}: CancelOrderModalProps) {
  const { isRTL, theme } = useAppSelector((state) => state.settings);

  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [errors, setErrors] = useState<{ reason?: string }>({});

  const textPrimary = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const textSecondary = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const textTertiary = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const bgPrimary = theme === "dark" ? "bg-gray-900" : "bg-white";
  const bgSecondary = theme === "dark" ? "bg-gray-800" : "bg-gray-50";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const validate = () => {
    const newErrors: { reason?: string } = {};

    if (!reason) {
      newErrors.reason = "Please select a cancellation reason";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(reason, notes);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${bgPrimary} rounded-lg max-w-lg w-full`}>
        {/* Header */}
        <div
          className={`border-b ${borderColor} p-6 flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${textPrimary}`}>
                Cancel Order
              </h2>
              <p className={`text-sm ${textTertiary}`}>Order #{order.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${textSecondary} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p
                  className={`text-sm font-medium text-red-900 dark:text-red-200`}
                >
                  Warning: This action will cancel the order and initiate a
                  refund
                </p>
                <p className={`text-xs text-red-700 dark:text-red-300 mt-1`}>
                  The customer will be refunded and you will not receive payment
                  for this order.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className={`${bgSecondary} rounded-lg p-4`}>
            <h3 className={`text-sm font-semibold ${textPrimary} mb-3`}>
              Order Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={textTertiary}>Product</span>
                <span className={textSecondary}>{order.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className={textTertiary}>Customer</span>
                <span className={textSecondary}>{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className={textTertiary}>Amount</span>
                <span className={`${textPrimary} font-bold`}>
                  {formatCurrency(order.totalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation Reason */}
          <div>
            <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
              Cancellation Reason <span className="text-red-500">*</span>
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
              <option value="">Select a reason</option>
              {cancelReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
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
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional information about the cancellation..."
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
              Send cancellation email to customer
            </label>
          </div>
        </div>

        {/* Actions */}
        <div
          className={`border-t ${borderColor} p-6 flex items-center justify-end gap-3`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg border ${borderColor} ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
          >
            Go Back
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            Confirm Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
