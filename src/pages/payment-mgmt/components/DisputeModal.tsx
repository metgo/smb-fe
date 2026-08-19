import { useState } from "react";
import { X, AlertTriangle, Upload, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/hooks/hooks";

interface DisputeModalProps {
  order: IMonthlyOrder;
  onClose: () => void;
  onSubmit: (reason: string, details: string, files: File[]) => void;
  isReopen?: boolean;
}

const disputeReasons = [
  { label: "Wrong item shipped", value: "wrong_item_shipped" },
  { label: "Item damaged/defective", value: "item_damaged_defective" },
  { label: "Customer fraudulent claim", value: "customer_fraudulent_claim" },
  { label: "Pricing error", value: "pricing_error" },
  { label: "Quantity mismatch", value: "quantity_mismatch" },
  { label: "Payment issue", value: "payment_issue" },
  { label: "Delivery problem", value: "delivery_problem" },
  { label: "Other (please specify)", value: "other" },
];

export default function DisputeModal({
  order,
  onClose,
  onSubmit,
  isReopen = false,
}: DisputeModalProps) {
  const { t } = useTranslation("reconciliation");
  const { theme } = useAppSelector((state) => state.settings);
  const { userRole } = useAppSelector((state) => state.auth);

  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ reason?: string; details?: string }>(
    {},
  );

  // Only traveller can raise disputes
  if (userRole !== "traveller") {
    return null;
  }

  const isDark = theme === "dark";
  const textPrimary = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const textSecondary = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const textTertiary = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const bgPrimary = theme === "dark" ? "bg-gray-900" : "bg-white";
  const bgSecondary = theme === "dark" ? "bg-gray-800" : "bg-gray-50";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalFiles = files.length + newFiles.length;

      if (totalFiles > 5) {
        alert(t("maximum_files"));
        return;
      }

      const totalSize = [...files, ...newFiles].reduce(
        (sum, f) => sum + f.size,
        0,
      );
      if (totalSize > 10 * 1024 * 1024) {
        alert(t("file_size_limit"));
        return;
      }

      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: { reason?: string; details?: string } = {};

    if (!reason) {
      newErrors.reason = t("please_select_dispute_reason");
    }

    if (!details || details.trim().length < 10) {
      newErrors.details = t("provide_details_minimum");
    }

    if (details.length > 250) {
      newErrors.details = t("details_max_length");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(reason, details, files);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${bgPrimary} rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 ${bgPrimary} border-b ${borderColor} p-6 flex items-center justify-between z-10`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDark ? "bg-orange-900/20" : "bg-orange-100"
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 ${isDark ? "text-orange-400" : "text-orange-600"}`}
              />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${textPrimary}`}>
                {isReopen ? t("reopen_dispute_btn") : t("open_dispute")}
              </h2>
              <p className={`text-sm ${textTertiary}`}>
                {t("order_number")} #{order._id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"} ${textSecondary} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning */}
          <div
            className={`border rounded-lg p-4 ${
              isDark
                ? "bg-orange-900/20 border-orange-800"
                : "bg-orange-50 border-orange-200"
            }`}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle
                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  isDark ? "text-orange-400" : "text-orange-600"
                }`}
              />
              <div>
                <p
                  className={`text-sm font-medium ${isDark ? "text-orange-200" : "text-orange-900"}`}
                >
                  {t("warning_freeze_order")}
                </p>
                <p
                  className={`text-xs mt-1 ${isDark ? "text-orange-300" : "text-orange-700"}`}
                >
                  {t("dispute_warning_desc")}
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className={`${bgSecondary} rounded-lg p-4`}>
            <h3 className={`text-sm font-semibold ${textPrimary} mb-3`}>
              {t("order_information")}
            </h3>
            <div className="flex items-start gap-3 mb-3">
              <img
                src={order.productImage}
                alt={order.productName}
                className="w-16 h-16 rounded object-cover"
              />
              <div className="flex-1">
                <div className={`font-medium ${textPrimary}`}>
                  {order.productName}
                </div>
                <div className={`text-xs ${textTertiary} mt-1`}>
                  {t("order_id_label")}: {order._id}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className={textTertiary}>{t("customer")}:</span>{" "}
                <span className={textSecondary}>
                  {order.customerName || "-"}
                </span>
              </div>
              <div>
                <span className={textTertiary}>{t("date")}:</span>{" "}
                <span className={textSecondary}>
                  {formatDate(order.purchaseDate) || "-"}
                </span>
              </div>
              <div>
                <span className={textTertiary}>{t("amount_label")}:</span>{" "}
                <span className={textSecondary}>
                  ₪{order.totalPrice.toFixed(2) || "-"}
                </span>
              </div>
              <div>
                <span className={textTertiary}>{t("qty")}:</span>{" "}
                <span className={textSecondary}>{order.quantity || "-"}</span>
              </div>
            </div>
          </div>

          {/* Dispute Reason */}
          <div>
            <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
              {t("dispute_reason")} <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setErrors({ ...errors, reason: undefined });
              }}
              className={`w-full px-4 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.reason ? "border-red-500" : ""
              }`}
            >
              <option value="">{t("select_reason")}</option>
              {disputeReasons.map((r) => (
                <option key={r.value} value={r.value}>
                  {t(r.value)}
                </option>
              ))}
            </select>
            {errors.reason && (
              <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
            )}
          </div>

          {/* Details */}
          <div>
            <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
              {t("additional_details")} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={details}
              onChange={(e) => {
                setDetails(e.target.value);
                setErrors({ ...errors, details: undefined });
              }}
              placeholder={t("provide_dispute_details")}
              rows={4}
              maxLength={250}
              className={`w-full px-4 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none ${
                errors.details ? "border-red-500" : ""
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              <div>
                {errors.details && (
                  <p className="text-red-500 text-xs">{errors.details}</p>
                )}
              </div>
              <p className={`text-xs ${textTertiary}`}>
                {details.length}/250 {t("characters")}
              </p>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
              {t("attach_evidence")}
            </label>
            <div
              className={`border-2 border-dashed ${borderColor} rounded-lg p-6 text-center ${
                files.length >= 5
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:border-orange-500"
              }`}
              onClick={() => {
                if (files.length < 5) {
                  document.getElementById("file-upload")?.click();
                }
              }}
            >
              <Upload className={`w-8 h-8 ${textTertiary} mx-auto mb-2`} />
              <p className={`text-sm ${textSecondary} mb-1`}>
                {t("click_to_upload")}
              </p>
              <p className={`text-xs ${textTertiary}`}>
                {t("images_pdfs_format")}
              </p>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={files.length >= 5}
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 ${bgSecondary} rounded-lg`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className={`w-4 h-4 ${textTertiary}`} />
                      <div>
                        <p className={`text-sm ${textSecondary}`}>
                          {file.name}
                        </p>
                        <p className={`text-xs ${textTertiary}`}>
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className={`p-1 rounded text-red-600 ${
                        isDark ? "hover:bg-red-900/20" : "hover:bg-red-50"
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          className={`sticky bottom-0 ${bgPrimary} border-t ${borderColor} p-6 flex items-center justify-end gap-3`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg border ${borderColor} ${textSecondary} ${
              isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
            } transition-colors`}
          >
            {t("cancel_btn")}
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors"
          >
            {isReopen ? t("reopen_dispute_btn") : t("submit_dispute")}
          </button>
        </div>
      </div>
    </div>
  );
}
