import { Package, User, CreditCard, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { MonthlyOrder } from "./VendorMonthlyReport";
import { useAppSelector } from "@/hooks/hooks";
import ModalWrapper from "@/components/wrapper/ModalWrapper";

interface OrderDetailsModalProps {
  order: MonthlyOrder;
  onClose: () => void;
  onDispute: () => void;
  onCancel: () => void;
  onApprove: () => void;
  onReject: () => void;
  loading?: boolean;
  adminView?: boolean;
}

export default function OrderDetailsModal({
  order,
  onClose,
  onDispute,
  onCancel,
  onApprove,
  onReject,
  loading,
}: OrderDetailsModalProps) {
  console.log("order.reconciliationStatus", order.reconciliationStatus);
  const { t } = useTranslation("reconciliation");
  const { isRTL, theme } = useAppSelector((state) => state.settings);
  const { userRole } = useAppSelector((state) => state.auth);
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
            {t("order_details_title")} - {order._id}
          </h2>
          <p className={`text-sm ${textTertiary} mt-1`}>
            {t("complete_order_info")}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className={`w-5 h-5 ${textSecondary}`} />
              <h3 className={`text-lg font-semibold ${textPrimary}`}>
                {t("product_information")}
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
                  {order.productName || "-"}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className={textTertiary}>{t("category")}:</span>{" "}
                    <span className={textSecondary}>
                      {order.productCategory || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className={`${bgSecondary} rounded-lg p-4`}>
            <h3 className={`text-sm font-semibold ${textPrimary} mb-3`}>
              {t("order_information")}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className={`${textTertiary} mb-1`}>
                  {t("order_id_label")}
                </div>
                <div className={`${textSecondary} font-medium`}>
                  {order._id}
                </div>
              </div>
              <div>
                <div className={`${textTertiary} mb-1`}>
                  {t("purchase_date")}
                </div>
                <div className={`${textSecondary} font-medium`}>
                  {formatDate(order.purchaseDate)}
                </div>
              </div>
              <div>
                <div className={`${textTertiary} mb-1`}>{t("status")}</div>
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
                    {t(order.status)}
                  </span>
                </div>
              </div>
              <div>
                <div className={`${textTertiary} mb-1`}>{t("quantity")}</div>
                <div className={`${textSecondary} font-medium`}>
                  {order.quantity || "-"}
                </div>
              </div>
              <div>
                <div className={`${textTertiary} mb-1`}>{t("unit_price")}</div>
                <div className={`${textSecondary} font-medium`}>
                  ₪{order.unitPrice.toFixed(2) || "-"}
                </div>
              </div>
              <div>
                <div className={`${textTertiary} mb-1`}>{t("total")}</div>
                <div className={`${textPrimary} font-bold`}>
                  ₪{order.totalPrice.toFixed(2) || "-"}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className={`w-5 h-5 ${textSecondary}`} />
              <h3 className={`text-lg font-semibold ${textPrimary}`}>
                {t("customer_information")}
              </h3>
            </div>
            <div className={`${bgSecondary} rounded-lg p-4 space-y-2 text-sm`}>
              <div className="flex justify-between">
                <span className={textTertiary}>{t("name")}</span>
                <span className={`${textSecondary} font-medium`}>
                  {order.customerName || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={textTertiary}>{t("email")}</span>
                <span className={`${textSecondary} font-medium`}>
                  {order.customerEmail || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={textTertiary}>{t("phone")}</span>
                <span className={`${textSecondary} font-medium`}>
                  {order.customerPhone || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Truck className={`w-5 h-5 ${textSecondary}`} />
              <h3 className={`text-lg font-semibold ${textPrimary}`}>
                {t("delivery_information")}
              </h3>
            </div>
            <div className={`${bgSecondary} rounded-lg p-4 space-y-2 text-sm`}>
              <div className="flex justify-between">
                <span className={textTertiary}>{t("delivery_method")}</span>
                <span className={`${textSecondary} font-medium`}>
                  {order.deliveryMethod || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={textTertiary}>{t("delivery_address")}</span>
                <span
                  className={`${textSecondary} font-medium text-right ${isRTL ? "text-left" : "text-right"}`}
                >
                  {order.deliveryAddress || "-"}
                </span>
              </div>
              {order.specialInstructions && (
                <div className="flex justify-between">
                  <span className={textTertiary}>
                    {t("special_instructions")}
                  </span>
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
                {t("payment_information")}
              </h3>
            </div>
            <div className={`${bgSecondary} rounded-lg p-4 space-y-2 text-sm`}>
              <div className="flex justify-between">
                <span className={textTertiary}>{t("payment_method")}</span>
                <span className={`${textSecondary} font-medium`}>
                  {order.paymentMethod || "-"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className={textTertiary}>{t("payment_status")}</span>
                <span className={`${textSecondary} font-medium`}>
                  {order.paymentStatus || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div
          className={`sticky bottom-0 ${bgPrimary} border-t ${borderColor} p-6 flex items-center justify-end gap-3`}
        >
          <>
            {userRole === "superadmin" &&
              order.status !== "canceled" &&
              order.reconciliationStatus === "disputed" && (
                <button
                  onClick={onApprove}
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  {t("approve_dispute_btn")}
                </button>
              )}
            {userRole === "superadmin" &&
              order.status !== "canceled" &&
              order.reconciliationStatus === "disputed" && (
                <button
                  onClick={onReject}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  {t("reject_dispute_btn")}
                </button>
              )}
          </>

          <div className="flex gap-3">
            {order.status !== "canceled" && order.reconciliationStatus !== "disputed" && (
              <button
                onClick={onCancel}
                className={`px-4 py-2 rounded-lg border ${borderColor} ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
              >
                {t("cancel_order_btn")}
              </button>
            )}
            {order.reconciliationStatus !== "disputed" &&
              userRole === "traveller" &&
              order.status !== "canceled" && (
                <button
                  onClick={onDispute}
                  className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors"
                >
                  {t("open_dispute_btn")}
                </button>
              )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
