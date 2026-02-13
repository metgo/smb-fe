import { useState } from "react";
import { Mail, Phone, XCircle } from "lucide-react";

import InfoRow from "./sub-components/InfoRow";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import ProductDetailsModal from "./sub-components/ProductDetailsModal";
import CancellationDialog from "./sub-components/CancellationDialog";
import { ModalWrapper } from "@/components/wrapper";
import {
  useUpdateOrderConfirmationMutation,
  useUpdateOrderStatusMutation,
} from "@/store/api/orderMutationApi";
import { toast } from "sonner";
import { useAppSelector } from "@/hooks/hooks";
import { UserRole } from "@/enums/user.types";

interface OrderDetailsModalProps {
  theme: Theme;
  order: any;
  isRTL: boolean;
  onClose: () => void;
  t: (key: string) => string;
  getOrderStatusBadge: any;
  getPaymentStatusBadge: any;
  isLoading: any;
}

function OrderDetailsModal({
  order,
  onClose,
  theme,
  isRTL,
  t,
  isLoading,
  getOrderStatusBadge,
  getPaymentStatusBadge,
}: OrderDetailsModalProps) {
  const { textTertiary, textPrimary } = useThemeClasses();
  const { userRole } = useAppSelector((state) => state.auth);
  const [selectedProduct, setSelectedProduct] = useState<IOrderProduct | null>(
    null,
  );
  const [showProductModal, setShowProductModal] = useState(false);
  const [orderProducts, setOrderProducts] = useState<IOrderProduct[]>(
    order?.products,
  );
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [updateOrderConfirmation, { isLoading: isSendingEmail }] =
    useUpdateOrderConfirmationMutation();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelType, setCancelType] = useState<"order" | "item">("order");
  const [itemToCancel, setItemToCancel] = useState<IOrderProduct | null>(null);

  console.log("oder", order);

  const handleResendNotification = async () => {
    try {
      const res = await updateOrderConfirmation({
        orderId: order?.map((order: any) => order?._id), // make sure you have this value
        body: {}, // or whatever payload your API expects
      }).unwrap();
      toast.success(res?.message);
      console.log("Notification resent:", res);
    } catch (error) {
      toast.error("failed");
      console.error("Failed to resend notification:", error);
    }
  };
  return (
    <ModalWrapper onClose={onClose} height="20vh" showSpinner={isLoading}>
      {/* Header */}

      <div
        className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <div className="flex flex-col p-6">
          <div className="flex">
            <h2 className={`text-2xl ${textPrimary}`}>ORD- </h2>
            <h2 className={`text-2xl ${textPrimary}`}> {order?._id}</h2>
          </div>
          <div className="flex gap-2 mt-2 items-center">
            <span className="text-sm font-medium">Order:</span>
            {getOrderStatusBadge(order?.status)}
            <span className="text-sm font-medium">Payment:</span>
            {getPaymentStatusBadge(order?.paymentStatus)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Purchaser Information */}
        <div>
          <h3 className={`text-lg mb-3 ${textPrimary}`}>
            {t("purchaser_information") || "Purchaser Information"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow
              label={t("name") || "Name"}
              value={order?.buyerFirstName}
              theme={theme}
            />
            {order?.buyerLastName && (
              <InfoRow
                label={t("name") || "Name"}
                value={`${order?.buyerFirstName || ""} ${order?.buyerLastName || ""}`.trim()}
                theme={theme}
              />
            )}

            {/* Email - Clickable */}
            <div>
              <p
                className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-1`}
              >
                {t("purchaser_email") || "Email"}
              </p>
              <a
                href={`mailto:${order?.buyerEmail}`}
                className={`text-sm flex items-center gap-1 text-teal-500 hover:text-teal-600 transition-colors`}
              >
                <Mail className="w-3 h-3" />
                {order?.buyerEmail}
              </a>
            </div>

            {/* Phone - Clickable */}
            <div>
              <p
                className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-1`}
              >
                {t("purchaser_phone") || "Phone"}
              </p>
              <a
                href={`tel:${order?.buyerPhone}`}
                className={`text-sm flex items-center gap-1 text-teal-500 hover:text-teal-600 transition-colors`}
              >
                <Phone className="w-3 h-3" />
                {order?.buyerPhone ? order?.buyerPhone : "-"}
              </a>
            </div>
            {/* 
              <InfoRow
                label={t("campaign") || "Campaign"}
                value={`${order?.campaign} (${order?.campaignCode})`}
                theme={theme}
              /> */}

            {order?.buyerAddress && (
              <InfoRow
                label={t("purchaser_address") || "Address"}
                value={order?.buyerAddress}
                theme={theme}
              />
            )}
          </div>
        </div>

        {/* Products Section */}
        <div>
          <h3 className={`text-lg mb-3 ${textPrimary}`}>
            {t("products") || "Products"}
          </h3>
          <div
            className={`border rounded-lg overflow-hidden ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}
          >
            {orderProducts?.map((product, idx) => (
              <div
                key={product?._id}
                className={`p-4 ${idx > 0 ? `border-t ${theme === "dark" ? "border-gray-800" : "border-gray-200"}` : ""} ${product?.cancelled ? "opacity-50" : ""}`}
              >
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  <div
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowProductModal(true);
                    }}
                    className="shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={product?.image?.image}
                      alt={product?.name}
                      className={`w-20 h-20 object-cover rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}
                    />
                  </div>

                  {/* Product Info */}
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowProductModal(true);
                    }}
                  >
                    <p
                      className={`${textPrimary} ${product?.cancelled ? "line-through" : ""}`}
                    >
                      {product?.name}
                    </p>
                    <p className={`text-sm ${textTertiary}`}>
                      {product?.vendor}
                    </p>
                    <p className={`text-xs ${textTertiary} mt-1`}>
                      {product?.category}
                    </p>
                  </div>

                  {/* Price & Actions */}
                  <div
                    className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`text-right ${isRTL ? "text-left" : ""}`}>
                      <p
                        className={`${textPrimary} ${product?.cancelled ? "line-through" : ""}`}
                      >
                        ₪
                        {(product?.quantity * product?.amount).toLocaleString()}
                      </p>
                      <p className={`text-sm ${textTertiary}`}>
                        {product?.quantity} x ₪{product?.amount}
                      </p>
                    </div>

                    {/* Cancel Button */}
                    {!product?.cancelled && userRole !== UserRole.AUTHORITY && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCancelType("item");
                          setItemToCancel(product);
                          setShowCancelDialog(true);
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === "dark"
                            ? "hover:bg-red-900/30 text-red-400"
                            : "hover:bg-red-50 text-red-500"
                        }`}
                        title={t("cancel_product") || "Cancel Product"}
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}

                    {product?.cancelled && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400`}
                      >
                        {t("cancelled") || "Cancelled"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Breakdown */}
        <div>
          <h3 className={`text-lg mb-3 ${textPrimary}`}>
            {t("payment_breakdown") || "Payment Breakdown"}
          </h3>
          <div
            className={`border rounded-lg p-4 space-y-2 ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}
          >
            <div className="flex justify-between">
              <span className={textTertiary}>
                {t("voucher_amount") || "Voucher"}
              </span>
              {/* <span className={textPrimary}>
                  ₪{order?.voucherAmount.toLocaleString()}
                </span> */}
            </div>
            <div className="flex justify-between">
              <span className={textTertiary}>
                {t("credit_card_amount") || "Credit Card"}
              </span>
              {/* <span className={textPrimary}>
                  ₪{order?.creditCardAmount.toLocaleString()}
                </span> */}
            </div>
            {order?.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span className={textTertiary}>
                  {t("delivery_fee") || "Delivery Fee"}
                </span>
                <span className={textPrimary}>
                  ₪{order?.deliveryFee?.toLocaleString()}
                </span>
              </div>
            )}
            <div
              className={`flex justify-between pt-2 border-t ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}
            >
              <span className={`${textPrimary}`}>{t("total") || "Total"}</span>
              <span className={`${textPrimary}`}>
                ₪{order?.totalAmount?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {userRole === UserRole.AUTHORITY && (
          <div
            className={`flex gap-3 pt-4 border-t ${theme === "dark" ? "border-gray-800" : "border-gray-200"} ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <button
              onClick={() => {
                setCancelType("order");
                setItemToCancel(null);
                setShowCancelDialog(true);
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              {t("cancel_order") || "Cancel Order"}
            </button>
            <button
              onClick={handleResendNotification}
              disabled={isSendingEmail}
              className={`px-4 py-2 rounded-lg transition-colors ${
                theme === "dark"
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              } ${isSendingEmail ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSendingEmail
                ? t("sending") || "Sending..."
                : t("resend_notification") || "Resend Notification"}
            </button>
          </div>
        )}
      </div>

      {/* Cancellation Dialog */}
      {showCancelDialog && (
        <CancellationDialog
          type={cancelType}
          itemName={itemToCancel?.name}
          onCancel={() => {
            setShowCancelDialog(false);
            setItemToCancel(null);
          }}
          onConfirm={async (reason, notes) => {
            try {
              if (cancelType === "item" && itemToCancel) {
                setOrderProducts((prev) =>
                  prev.map((p) =>
                    p._id === itemToCancel._id ? { ...p, cancelled: true } : p,
                  ),
                );
              } else {
                await updateOrderStatus({
                  orderId: order.map((order: any) => order?._id),
                  body: {
                    status: "pending",
                    canceled_reason: reason || "Cancelled by user",
                    isQrScan: true,
                    externalApiId: notes || "",
                  },
                }).unwrap();

                toast.success("Order cancelled successfully");
              }

              setShowCancelDialog(false);
              setItemToCancel(null);
            } catch (error) {
              toast.error("Cancel failed");
            }
          }}
        />
      )}

      {/* Product Details Modal */}
      {showProductModal && selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </ModalWrapper>
  );
}
export default OrderDetailsModal;
