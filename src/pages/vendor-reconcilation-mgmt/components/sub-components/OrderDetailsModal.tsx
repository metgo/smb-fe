import { Package, User, CreditCard, Truck } from "lucide-react";
import type { MonthlyOrder } from "./VendorMonthlyReport";
import { useAppSelector } from "@/hooks/hooks";
import ModalWrapper from "@/components/wrapper/ModalWrapper";

interface OrderDetailsModalProps {
  order: MonthlyOrder;
  onClose: () => void;
  onDispute: () => void;
  onCancel: () => void;
  onApprove: () => void;
  loading?: boolean;
  adminView?: boolean;
}

export default function OrderDetailsModal({
  order,
  onClose,
  onDispute,
  onCancel,
  onApprove,
  loading,
}: OrderDetailsModalProps) {
  const { isRTL, theme } = useAppSelector((state) => state.settings);
  const { userRole } = useAppSelector((state) => state.auth);
  const isTraveller = userRole === "traveller";
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
    <ModalWrapper onClose={onClose} showSpinner={loading} maxWidth="max-w-2xl">
      <div
        className={`${bgPrimary} rounded-lg max-w-2xl w-full p-4 max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div>
          <h2 className={`text-xl font-bold ${textPrimary}`}>
            Order Details - {order._id}
          </h2>
          <p className={`text-sm ${textTertiary} mt-1`}>
            Complete order information
          </p>
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
                <div className={`${textSecondary} font-medium`}>
                  {order._id}
                </div>
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
                <span className={textTertiary}>Payment Status</span>
                <span className={`${textSecondary} font-medium`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {order.status === "pending" && (
          <div
            className={`sticky bottom-0 ${bgPrimary} border-t ${borderColor} p-6 flex items-center justify-end gap-3`}
          >
            {
              <>
                {order.status !== "canceled" && (
                  <button
                    onClick={onCancel}
                    className={`px-4 py-2 rounded-lg border ${borderColor} ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                  >
                    Cancel Order
                  </button>
                )}
                <button
                  onClick={onApprove}
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  ✓ Approve Order
                </button>
              </>
            }
            {isTraveller && (
              <>
                {order.status !== "canceled" && (
                  <button
                    onClick={onCancel}
                    className={`px-4 py-2 rounded-lg border ${borderColor} ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                  >
                    Cancel Order
                  </button>
                )}
                {order.reconciliationStatus !== "disputed" && (
                  <button
                    onClick={onDispute}
                    className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors"
                  >
                    Open Dispute
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}
