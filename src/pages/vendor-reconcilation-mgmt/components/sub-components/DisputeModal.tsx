import { useState } from "react";
import { X, AlertTriangle, Upload, FileText } from "lucide-react";
import type { MonthlyOrder } from "./VendorMonthlyReport";
import { useAppSelector } from "@/hooks/hooks";

interface DisputeModalProps {
  order: MonthlyOrder;
  onClose: () => void;
  onSubmit: (reason: string, details: string, files: File[]) => void;
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
}: DisputeModalProps) {
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
        alert("Maximum 5 files allowed");
        return;
      }

      const totalSize = [...files, ...newFiles].reduce(
        (sum, f) => sum + f.size,
        0,
      );
      if (totalSize > 10 * 1024 * 1024) {
        alert("Total file size cannot exceed 10MB");
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
      newErrors.reason = "Please select a dispute reason";
    }

    if (!details || details.trim().length < 10) {
      newErrors.details = "Please provide details (minimum 10 characters)";
    }

    if (details.length > 250) {
      newErrors.details = "Details cannot exceed 250 characters";
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
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${textPrimary}`}>
                Open Dispute
              </h2>
              <p className={`text-sm ${textTertiary}`}>Order #{order._id}</p>
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
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p
                  className={`text-sm font-medium text-orange-900 dark:text-orange-200`}
                >
                  Warning: This action will freeze the order
                </p>
                <p
                  className={`text-xs text-orange-700 dark:text-orange-300 mt-1`}
                >
                  The order will be held until the admin reviews and resolves
                  your dispute. Payment will be frozen during this period.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className={`${bgSecondary} rounded-lg p-4`}>
            <h3 className={`text-sm font-semibold ${textPrimary} mb-3`}>
              Order Information
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
                  Order ID: {order._id}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className={textTertiary}>Customer:</span>{" "}
                <span className={textSecondary}>{order.customerName || "-"}</span>
              </div>
              <div>
                <span className={textTertiary}>Date:</span>{" "}
                <span className={textSecondary}>
                  {formatDate(order.purchaseDate) || "-"}
                </span>
              </div>
              <div>
                <span className={textTertiary}>Amount:</span>{" "}
                <span className={textSecondary}>
                  ₪{order.totalPrice.toFixed(2) || "-"}
                </span>
              </div>
              <div>
                <span className={textTertiary}>Qty:</span>{" "}
                <span className={textSecondary}>{order.quantity || "-"}</span>
              </div>
            </div>
          </div>

          {/* Dispute Reason */}
          <div>
            <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
              Dispute Reason <span className="text-red-500">*</span>
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
              <option value="">Select a reason</option>
              {disputeReasons.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
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
              Additional Details <span className="text-red-500">*</span>
            </label>
            <textarea
              value={details}
              onChange={(e) => {
                setDetails(e.target.value);
                setErrors({ ...errors, details: undefined });
              }}
              placeholder="Please provide detailed information about the dispute (10-250 characters)"
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
                {details.length}/250 characters
              </p>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
              Attach Evidence (Optional)
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
                Click to upload or drag and drop
              </p>
              <p className={`text-xs ${textTertiary}`}>
                Images or PDFs - Max 5 files, 10MB total
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
                      className="p-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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
            className={`px-4 py-2 rounded-lg border ${borderColor} ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors"
          >
            Submit Dispute
          </button>
        </div>
      </div>
    </div>
  );
}
