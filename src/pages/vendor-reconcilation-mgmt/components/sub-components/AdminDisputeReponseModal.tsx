import { useState } from "react";
import { X, AlertTriangle, FileText } from "lucide-react";
import type { MonthlyOrder } from "./VendorMonthlyReport";
import { useAppSelector } from "@/hooks/hooks";

interface AdminDisputeResponseModalProps {
  order: MonthlyOrder;
  onClose: () => void;
  onResolve: (resolution: string, response: string, action: string) => void;
}

export const AdminDisputeResponseModal = ({
  order,
  onClose,
  onResolve,
}: AdminDisputeResponseModalProps) => {
  const { isRTL, theme } = useAppSelector((state) => state.settings);

  const [internalNotes, setInternalNotes] = useState("");
  const [responseToVendor, setResponseToVendor] = useState("");
  const [resolutionAction, setResolutionAction] = useState("");
  const [vendorResponsibility, setVendorResponsibility] = useState("");
  const [platformResponsibility, setPlatformResponsibility] = useState("");
  const [customerRefund, setCustomerRefund] = useState("");
  const [notifyVendor, setNotifyVendor] = useState(true);
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [errors, setErrors] = useState<{ response?: string; action?: string }>(
    {},
  );

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const validate = () => {
    const newErrors: { response?: string; action?: string } = {};

    if (!responseToVendor.trim()) {
      newErrors.response = "Response to vendor is required";
    }

    if (!resolutionAction) {
      newErrors.action = "Please select a resolution action";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onResolve(resolutionAction, responseToVendor, resolutionAction);
    }
  };

  if (!order.disputeInfo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${bgPrimary} rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto`}
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
                Dispute Resolution
              </h2>
              <p className={`text-sm ${textTertiary}`}>
                Dispute #{order.disputeInfo.id} - Order #{order.id}
              </p>
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
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">
              🔴 Awaiting Admin Response
            </span>
            <span className={`text-xs ${textTertiary}`}>
              Submitted {formatDate(order.disputeInfo.submittedAt)}
            </span>
          </div>

          {/* Order Details */}
          <div className={`${bgSecondary} rounded-lg p-4`}>
            <h3 className={`text-sm font-semibold ${textPrimary} mb-3`}>
              Order Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex items-start gap-3">
                <img
                  src={order.productImage}
                  alt={order.productName}
                  className="w-16 h-16 rounded object-cover"
                />
                <div>
                  <div className={`font-medium ${textPrimary}`}>
                    {order.productName}
                  </div>
                  <div className={`text-xs ${textTertiary} mt-1`}>
                    SKU: {order.productSKU}
                  </div>
                </div>
              </div>
              <div>
                <div className={`text-xs ${textTertiary} mb-1`}>Customer</div>
                <div className={`text-sm ${textSecondary}`}>
                  {order.customerName}
                  <br />
                  <span className="text-xs">{order.customerEmail}</span>
                </div>
              </div>
              <div>
                <div className={`text-xs ${textTertiary} mb-1`}>Order Date</div>
                <div className={`text-sm ${textSecondary}`}>
                  {formatDate(order.purchaseDate)}
                </div>
              </div>
              <div>
                <div className={`text-xs ${textTertiary} mb-1`}>Amount</div>
                <div className={`text-sm font-bold ${textPrimary}`}>
                  {formatCurrency(order.totalPrice)}
                </div>
              </div>
              <div>
                <div className={`text-xs ${textTertiary} mb-1`}>Quantity</div>
                <div className={`text-sm ${textSecondary}`}>
                  {order.quantity}
                </div>
              </div>
            </div>
          </div>

          {/* Vendor's Dispute Information */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <h3
              className={`text-sm font-semibold text-orange-900 dark:text-orange-200 mb-3`}
            >
              Vendor's Dispute Information
            </h3>
            <div className="space-y-3">
              <div>
                <div
                  className={`text-xs text-orange-700 dark:text-orange-300 mb-1`}
                >
                  Reason
                </div>
                <div
                  className={`text-sm font-medium text-orange-900 dark:text-orange-100`}
                >
                  {order.disputeInfo.reason}
                </div>
              </div>
              <div>
                <div
                  className={`text-xs text-orange-700 dark:text-orange-300 mb-1`}
                >
                  Vendor's Notes
                </div>
                <div className={`text-sm text-orange-900 dark:text-orange-100`}>
                  "{order.disputeInfo.details}"
                </div>
              </div>
              {order.disputeInfo.files.length > 0 && (
                <div>
                  <div
                    className={`text-xs text-orange-700 dark:text-orange-300 mb-2`}
                  >
                    Attachments
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.disputeInfo.files.map((file, idx) => (
                      <button
                        key={idx}
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded text-xs hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        {file}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Admin Response Section */}
          <div className="border-t pt-6">
            <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>
              Admin Response
            </h3>

            {/* Internal Notes */}
            <div className="mb-4">
              <label
                className={`block text-sm font-medium ${textPrimary} mb-2`}
              >
                Internal Notes (Visible to admins only)
              </label>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Add internal notes for admin reference..."
                rows={2}
                className={`w-full px-4 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
              />
            </div>

            {/* Response to Vendor */}
            <div className="mb-4">
              <label
                className={`block text-sm font-medium ${textPrimary} mb-2`}
              >
                Response to Vendor <span className="text-red-500">*</span>
              </label>
              <textarea
                value={responseToVendor}
                onChange={(e) => {
                  setResponseToVendor(e.target.value);
                  setErrors({ ...errors, response: undefined });
                }}
                placeholder="Enter your response to the vendor..."
                rows={3}
                className={`w-full px-4 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.response ? "border-red-500" : ""
                }`}
              />
              {errors.response && (
                <p className="text-red-500 text-xs mt-1">{errors.response}</p>
              )}
            </div>

            {/* Resolution Action */}
            <div className="mb-4">
              <label
                className={`block text-sm font-medium ${textPrimary} mb-2`}
              >
                Resolution Action <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <label
                  className={`flex items-start gap-3 p-3 border ${borderColor} rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    resolutionAction === "approve_dispute"
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="resolution"
                    value="approve_dispute"
                    checked={resolutionAction === "approve_dispute"}
                    onChange={(e) => {
                      setResolutionAction(e.target.value);
                      setErrors({ ...errors, action: undefined });
                    }}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${textPrimary}`}>
                      Approve Dispute
                    </div>
                    <div className={`text-xs ${textTertiary}`}>
                      Issue full refund to customer. Vendor will not be paid for
                      this order.
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3 border ${borderColor} rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    resolutionAction === "deny_dispute"
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="resolution"
                    value="deny_dispute"
                    checked={resolutionAction === "deny_dispute"}
                    onChange={(e) => {
                      setResolutionAction(e.target.value);
                      setErrors({ ...errors, action: undefined });
                    }}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${textPrimary}`}>
                      Deny Dispute
                    </div>
                    <div className={`text-xs ${textTertiary}`}>
                      Vendor must fulfill the order. Payment will proceed as
                      normal.
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3 border ${borderColor} rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    resolutionAction === "partial"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="resolution"
                    value="partial"
                    checked={resolutionAction === "partial"}
                    onChange={(e) => {
                      setResolutionAction(e.target.value);
                      setErrors({ ...errors, action: undefined });
                    }}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${textPrimary}`}>
                      Partial Resolution
                    </div>
                    <div className={`text-xs ${textTertiary}`}>
                      Shared cost between vendor and platform. Specify amounts
                      below.
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3 border ${borderColor} rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    resolutionAction === "request_info"
                      ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="resolution"
                    value="request_info"
                    checked={resolutionAction === "request_info"}
                    onChange={(e) => {
                      setResolutionAction(e.target.value);
                      setErrors({ ...errors, action: undefined });
                    }}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${textPrimary}`}>
                      Request More Information
                    </div>
                    <div className={`text-xs ${textTertiary}`}>
                      Send response to vendor and keep dispute open for more
                      details.
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3 border ${borderColor} rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    resolutionAction === "escalate"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="resolution"
                    value="escalate"
                    checked={resolutionAction === "escalate"}
                    onChange={(e) => {
                      setResolutionAction(e.target.value);
                      setErrors({ ...errors, action: undefined });
                    }}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${textPrimary}`}>
                      Escalate to Senior Admin
                    </div>
                    <div className={`text-xs ${textTertiary}`}>
                      This dispute requires senior admin review and decision.
                    </div>
                  </div>
                </label>
              </div>
              {errors.action && (
                <p className="text-red-500 text-xs mt-1">{errors.action}</p>
              )}
            </div>

            {/* Partial Resolution Details */}
            {resolutionAction === "partial" && (
              <div className={`${bgSecondary} rounded-lg p-4 space-y-3 mb-4`}>
                <h4 className={`text-sm font-semibold ${textPrimary}`}>
                  Partial Resolution Details
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-1`}>
                      Vendor Responsibility
                    </label>
                    <input
                      type="number"
                      value={vendorResponsibility}
                      onChange={(e) => setVendorResponsibility(e.target.value)}
                      placeholder="$0.00"
                      className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-1`}>
                      Platform Responsibility
                    </label>
                    <input
                      type="number"
                      value={platformResponsibility}
                      onChange={(e) =>
                        setPlatformResponsibility(e.target.value)
                      }
                      placeholder="$0.00"
                      className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${textTertiary} mb-1`}>
                      Customer Refund
                    </label>
                    <input
                      type="number"
                      value={customerRefund}
                      onChange={(e) => setCustomerRefund(e.target.value)}
                      placeholder="$0.00"
                      className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notification Options */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notify-vendor"
                  checked={notifyVendor}
                  onChange={(e) => setNotifyVendor(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="notify-vendor"
                  className={`text-sm ${textSecondary}`}
                >
                  Notify vendor via email
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notify-customer"
                  checked={notifyCustomer}
                  onChange={(e) => setNotifyCustomer(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="notify-customer"
                  className={`text-sm ${textSecondary}`}
                >
                  Notify customer via email
                </label>
              </div>
            </div>
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
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Send Response & Resolve
          </button>
        </div>
      </div>
    </div>
  );
};
