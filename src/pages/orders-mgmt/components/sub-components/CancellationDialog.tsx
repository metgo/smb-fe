import { useAppSelector } from "@/hooks/hooks";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function CancellationDialog({
  type,
  itemName,
  onCancel,
  onConfirm,
}: {
  type: "order" | "item";
  itemName?: string;
  onCancel: () => void;
  onConfirm: (reason: string, notes: string) => void;
}) {
  const { t } = useTranslation("orders");
  const { theme, isRTL } = useAppSelector((state) => state.settings);

  const [selectedReason, setSelectedReason] = useState("");
  const [notes, setNotes] = useState("");

  const cancellationReasons = [
    { value: "", label: t("selectReason") },
    { value: "customer_request", label: t("customerRequest") },
    { value: "out_of_stock", label: t("outOfStock") },
    { value: "pricing_error", label: t("pricingError") },
    { value: "duplicate_order", label: t("duplicateOrder") },
    { value: "payment_issue", label: t("paymentIssue") },
    { value: "other", label: t("other") },
  ];

  const handleSubmit = () => {
    if (selectedReason && notes.trim()) {
      onConfirm(selectedReason, notes);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-lg p-6 ${
          theme === "dark"
            ? "bg-gray-900 text-gray-100"
            : "bg-white text-gray-900"
        }`}
      >
        <h3
          className={`text-xl font-semibold mb-4 ${isRTL ? "text-right" : "text-left"}`}
        >
          {type === "order" ? t("cancel_order") : t("cancel_item")}
        </h3>

        {itemName && (
          <p
            className={`text-sm mb-5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"} ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("cancelling")}: <span className="font-medium">{itemName}</span>
          </p>
        )}

        {/* Reason Dropdown */}
        <div className="mb-5">
          <label
            className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"} ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("cancellationReason")} <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-colors ${
              isRTL ? "text-right" : "text-left"
            } ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-gray-100"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            {cancellationReasons.map((reason) => (
              <option key={reason.value} value={reason.value}>
                {reason.label}
              </option>
            ))}
          </select>
        </div>

        {/* Additional Notes */}
        <div className="mb-6">
          <label
            className={`block text-sm font-medium mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"} ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("additionalNotes")} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder={t("enterDetails")}
            className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-colors resize-none ${
              isRTL ? "text-right" : "text-left"
            } ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
            }`}
          />
        </div>

        {/* Action Buttons */}
        <div
          className={`flex gap-3 ${isRTL ? "flex-row-reverse" : "flex-row"}`}
        >
          <button
            onClick={handleSubmit}
            disabled={!selectedReason || !notes.trim()}
            className={`flex-1 px-5 py-2.5 rounded-lg font-medium transition-colors ${
              !selectedReason || !notes.trim()
                ? "bg-red-500/50 cursor-not-allowed text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {t("submit")}
          </button>

          <button
            onClick={onCancel}
            className={`flex-1 px-5 py-2.5 rounded-lg font-medium transition-colors ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-300"
            }`}
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
