import { X, Package, User, CreditCard, Truck, AlertCircle } from "lucide-react";
import type { MonthlyOrder } from "./VendorMonthlyReport";
import { useAppSelector } from "@/hooks/hooks";

interface OrderDetailsModalProps {
  order: MonthlyOrder;
  onClose: () => void;
  onDispute: () => void;
  onCancel: () => void;
  onApprove: () => void;
  adminView?: boolean;
}

export default function OrderDetailsModal({
  order,
  onClose,
  onDispute,
  onCancel,
  onApprove,
  adminView = false,
}: OrderDetailsModalProps) {
  const { isRTL, theme } = useAppSelector((state) => state.settings);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${bgPrimary} rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 ${bgPrimary} border-b ${borderColor} p-6 flex items-center justify-between z-10`}
        >
          <div>
            <h2 className={`text-xl font-bold ${textPrimary}`}>
              Order Details - {order.id}
            </h2>
            <p className={`text-sm ${textTertiary} mt-1`}>
              Complete order information
            </p>
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
          {/* Product Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className={`w-5 h-5 ${textSecondary}`} />
              <h3 className={`text-lg font-semibold ${textPrimary}`}>
                Product Information
              </h3>
            </div>
            <div className="flex items-start gap-4">
              <img
                src={order.productImage}
                alt={order.productName}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className={`text-lg font-semibold ${textPrimary} mb-1`}>
                  {order.productName}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className={textTertiary}>SKU:</span>{" "}
                    <span className={textSecondary}>{order.productSKU}</span>
                  </div>
                  <div>
                    <span className={textTertiary}>Category:</span>{" "}
                    <span className={textSecondary}>
                      {order.productCategory}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className={`${bgSecondary} rounded-lg p-4`}>
            <h3 className={`text-sm font-semibold ${textPrimary} mb-3`}>
              Order Information
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className={`${textTertiary} mb-1`}>Order ID</div>
                <div className={`${textSecondary} font-medium`}>{order.id}</div>
              </div>
              <div>
                <div className={`${textTertiary} mb-1`}>Purchase Date</div>
                <div className={`${textSecondary} font-medium`}>
                  {formatDate(order.purchaseDate)}
                </div>
              </div>
              <div>
                <div className={`${textTertiary} mb-1`}>Status</div>
                <div className="mt-1">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === "pending"
                        ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
                        : order.status === "approved"
                          ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                          : order.status === "disputed"
                            ? "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400"
                            : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>
              </div>
              <div>
                <div className={`${textTertiary} mb-1`}>Quantity</div>
                <div className={`${textSecondary} font-medium`}>
                  {order.quantity}
                </div>
              </div>
              <div>
                <div className={`${textTertiary} mb-1`}>Unit Price</div>
                <div className={`${textSecondary} font-medium`}>
                  {formatCurrency(order.unitPrice)}
                </div>
              </div>
              <div>
                <div className={`${textTertiary} mb-1`}>Total</div>
                <div className={`${textPrimary} font-bold`}>
                  {formatCurrency(order.totalPrice)}
                </div>
              </div>
              <div className="col-span-2">
                <div className={`${textTertiary} mb-1`}>Platform Fee (10%)</div>
                <div className={`${textSecondary} font-medium`}>
                  {formatCurrency(order.platformFee)}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className={`w-5 h-5 ${textSecondary}`} />
              <h3 className={`text-lg font-semibold ${textPrimary}`}>
                Customer Information
              </h3>
            </div>
            <div className={`${bgSecondary} rounded-lg p-4 space-y-2 text-sm`}>
              <div className="flex justify-between">
                <span className={textTertiary}>Name</span>
                <span className={`${textSecondary} font-medium`}>
                  {order.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={textTertiary}>Email</span>
                <span className={`${textSecondary} font-medium`}>
                  {order.customerEmail}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={textTertiary}>Phone</span>
                <span className={`${textSecondary} font-medium`}>
                  {order.customerPhone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={textTertiary}>Location</span>
                <span className={`${textSecondary} font-medium`}>
                  {order.customerLocation}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Truck className={`w-5 h-5 ${textSecondary}`} />
              <h3 className={`text-lg font-semibold ${textPrimary}`}>
                Delivery Information
              </h3>
            </div>
            <div className={`${bgSecondary} rounded-lg p-4 space-y-2 text-sm`}>
              <div className="flex justify-between">
                <span className={textTertiary}>Delivery Method</span>
                <span className={`${textSecondary} font-medium`}>
                  {order.deliveryMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={textTertiary}>Delivery Address</span>
                <span
                  className={`${textSecondary} font-medium text-right ${isRTL ? "text-left" : "text-right"}`}
                >
                  {order.deliveryAddress}
                </span>
              </div>
              {order.specialInstructions && (
                <div className="flex justify-between">
                  <span className={textTertiary}>Special Instructions</span>
                  <span className={`${textSecondary} font-medium`}>
                    {order.specialInstructions}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className={`w-5 h-5 ${textSecondary}`} />
              <h3 className={`text-lg font-semibold ${textPrimary}`}>
                Payment Information
              </h3>
            </div>
            <div className={`${bgSecondary} rounded-lg p-4 space-y-2 text-sm`}>
              <div className="flex justify-between">
                <span className={textTertiary}>Payment Method</span>
                <span className={`${textSecondary} font-medium`}>
                  {order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={textTertiary}>Transaction ID</span>
                <span
                  className={`${textSecondary} font-medium font-mono text-xs`}
                >
                  {order.transactionId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={textTertiary}>Payment Status</span>
                <span className={`${textSecondary} font-medium`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Dispute Information */}
          {order.disputeInfo && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3
                    className={`text-sm font-semibold text-orange-900 dark:text-orange-200 mb-1`}
                  >
                    Dispute Information
                  </h3>
                  <p className={`text-xs text-orange-700 dark:text-orange-300`}>
                    Submitted on {formatDate(order.disputeInfo.submittedAt)}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <div
                    className={`text-orange-700 dark:text-orange-300 text-xs mb-1`}
                  >
                    Reason
                  </div>
                  <div
                    className={`text-orange-900 dark:text-orange-100 font-medium`}
                  >
                    {order.disputeInfo.reason}
                  </div>
                </div>
                <div>
                  <div
                    className={`text-orange-700 dark:text-orange-300 text-xs mb-1`}
                  >
                    Details
                  </div>
                  <div className={`text-orange-900 dark:text-orange-100`}>
                    {order.disputeInfo.details}
                  </div>
                </div>
                {order.disputeInfo.files.length > 0 && (
                  <div>
                    <div
                      className={`text-orange-700 dark:text-orange-300 text-xs mb-1`}
                    >
                      Attachments
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.disputeInfo.files.map((file, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded text-xs"
                        >
                          {file}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {order.disputeInfo.adminResponse && (
                  <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
                    <div
                      className={`text-orange-700 dark:text-orange-300 text-xs mb-1`}
                    >
                      Admin Response
                    </div>
                    <div className={`text-orange-900 dark:text-orange-100`}>
                      {order.disputeInfo.adminResponse}
                    </div>
                    <div
                      className={`text-orange-700 dark:text-orange-300 text-xs mt-1`}
                    >
                      Responded on{" "}
                      {order.disputeInfo.respondedAt &&
                        formatDate(order.disputeInfo.respondedAt)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cancel Information */}
          {order.cancelInfo && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3
                    className={`text-sm font-semibold text-red-900 dark:text-red-200 mb-1`}
                  >
                    Cancellation Information
                  </h3>
                  <p className={`text-xs text-red-700 dark:text-red-300`}>
                    Cancelled on {formatDate(order.cancelInfo.cancelledAt)}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <div
                    className={`text-red-700 dark:text-red-300 text-xs mb-1`}
                  >
                    Reason
                  </div>
                  <div className={`text-red-900 dark:text-red-100 font-medium`}>
                    {order.cancelInfo.reason}
                  </div>
                </div>
                {order.cancelInfo.notes && (
                  <div>
                    <div
                      className={`text-red-700 dark:text-red-300 text-xs mb-1`}
                    >
                      Notes
                    </div>
                    <div className={`text-red-900 dark:text-red-100`}>
                      {order.cancelInfo.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!adminView && order.status === "pending" && (
          <div
            className={`sticky bottom-0 ${bgPrimary} border-t ${borderColor} p-6 flex items-center justify-end gap-3`}
          >
            <button
              onClick={onCancel}
              className={`px-4 py-2 rounded-lg border ${borderColor} ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
            >
              Cancel Order
            </button>
            <button
              onClick={onDispute}
              className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors"
            >
              Open Dispute
            </button>
            <button
              onClick={onApprove}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
            >
              ✓ Approve Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
