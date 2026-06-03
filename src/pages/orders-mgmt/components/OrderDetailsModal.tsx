import clsx from "clsx";
import axios from "axios";
import { useState } from "react";
import { Loader, Mail, Phone } from "lucide-react";

import InfoRow from "./sub-components/InfoRow";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import ProductDetailsModal from "./sub-components/ProductDetailsModal";
import CancellationDialog from "./sub-components/CancellationDialog";
import { ModalWrapper } from "@/components/wrapper";
import {
  useBulkOrdersUpdateMutation,
  useUpdateOrderStatusMutation,
} from "@/store/api/orderMutationApi";
import { toast } from "sonner";
import { useAppSelector } from "@/hooks/hooks";
import { UserRole } from "@/enums/user.types";
import { ImageWithFallback } from "@/components/shared";
import OrderStatusChangeBtn from "@/components/btns/OrderStatusChangeBtn";
import { envKeys } from "@/lib/envKeys";

interface OrderDetailsModalProps {
  order: any;
  onClose: () => void;
  t: (key: string) => string;
  getOrderStatusBadge: any;
  isLoading: any;
  isFetching: any;
  refetch: any;
  isQRMode?: boolean;
  qrToken?: string | null;
}

function OrderDetailsModal({
  order,
  onClose,
  t,
  refetch,
  isLoading,
  isFetching,
  isQRMode,
  qrToken,
}: OrderDetailsModalProps) {
  const { textTertiary, textPrimary, isRTL, isDark } = useThemeClasses();
  const { userRole } = useAppSelector((state) => state.auth);
  const [selectedProduct, setSelectedProduct] = useState<IOrderProduct | null>(
    null,
  );
  const [showProductModal, setShowProductModal] = useState(false);
  const [sendingTarget, setSendingTarget] = useState<
    "VENDOR" | "CUSTOMER" | null
  >(null);

  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  const [bulkOrdersUpdate] = useBulkOrdersUpdateMutation();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelType, setCancelType] = useState<"order" | "item">("order");
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [itemToCancel, setItemToCancel] = useState<IOrderProduct | null>(null);

  const handleResendNotification = async (recipient: "VENDOR" | "CUSTOMER") => {
    setSendingTarget(recipient);

    try {
      await bulkOrdersUpdate({
        ordersId: Array(order?.orderId),
        emailRecipient: recipient,
      }).unwrap();
      toast.success(t("email_sent"));
      setSendingTarget(null);
    } catch (error) {
      toast.error("failed");
      setSendingTarget(null);
    }
  };
  const onStatusChangeHandler = async (status: string) => {
    try {
      if (isQRMode && qrToken) {
        await axios.post(
          `${envKeys.baseUrl}/api/public/orders/verify/${qrToken}/update-status`,
          { status: status.toLowerCase() },
        );
      } else {
        await updateOrderStatus({
          orderId: order?._id,
          body: { status: status.toLowerCase() },
        }).unwrap();
      }

      toast.success(t("order_status_update_success"));

      // Reload page in QR mode to refresh, otherwise just refetch
      if (isQRMode) {
        window.location.reload();
      } else {
        refetch();
      }
    } catch (error) {
      toast.error(t("order_status_update_failed"));
      console.error(error);
    }
  };
  return (
    <ModalWrapper onClose={onClose} showSpinner={isLoading || isFetching}>
      {/* Header */}

      <div
        className={`flex items-center justify-between 
              ${isRTL ? "flex-row-reverse" : ""} 
              p-4 md:p-6 
              mb-4`}
      >
        <h2 className={`text-2xl font-semibold ${textPrimary}`}>
          {t("order_details")}
        </h2>
        <OrderStatusChangeBtn
          status={order?.status}
          handleStatusChange={onStatusChangeHandler}
          setShowCancelDialog={setShowCancelDialog}
        />
      </div>

      {/* Content */}
      <div className="px-6 overflow-y-auto overflow-hidden  space-y-6 ">
        {/* Purchaser Information */}
        <div className="">
          <h3 className={`text-lg mb-3 ${textPrimary}`}>
            {t("purchaser_information") || "Purchaser Information"}
          </h3>
          <div className="grid grid-cols-2 gap-4 border  rounded-md px-4 py-4">
            <InfoRow
              label={t("name") || "Name"}
              value={`${order?.buyerFirstName || ""} ${order?.buyerLastName || ""}`}
            />

            {/* Email - Clickable */}
            <div>
              <p
                className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"} `}
              >
                {t("purchaser_email") || "Email"}
              </p>
              <a
                href={`mailto:${order?.buyerEmail}`}
                className={`text-sm flex items-center gap-1 text-teal-500 hover:text-teal-600 transition-colors`}
              >
                <div>
                  <Mail className="w-3 h-3" />
                </div>
                <div>{order?.buyerEmail}</div>
              </a>
            </div>

            {/* Phone - Clickable */}
            <div>
              <p
                className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"} mb-1`}
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

            <InfoRow
              label={t("campaign") || "Campaign"}
              value={
                order?.campaign
                  ? `${order.campaign}${order?.campaignCode ? ` (${order.campaignCode})` : ""}`
                  : "-"
              }
            />

            <InfoRow
              label={t("purchaser_address") || "Address"}
              value={order?.buyerAddress ? order.buyerAddress : "-"}
            />
          </div>
        </div>

        {/* Products Section */}
        <div>
          <h3 className={`text-lg mb-3 ${textPrimary}`}>
            {t("products") || "Products"}
          </h3>
          <div
            className={`border rounded-lg overflow-hidden ${isDark ? "border-gray-800" : "border-gray-200"}`}
          >
            <div
              key={order?.products?._id}
              className={`p-4 ${order?.idx > 0 ? `border-t ${isDark ? "border-gray-800" : "border-gray-200"}` : ""} ${order?.status === "canceled" ? "opacity-50" : ""}`}
            >
              <div className="flex items-start gap-4">
                {/* Product Image */}
                <div
                  onClick={() => {
                    setSelectedProduct(order?.products);
                    setShowProductModal(true);
                  }}
                  className="shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <ImageWithFallback
                    src={order?.products?.images?.image}
                    alt={order?.products?.name}
                    className={clsx(
                      "w-24 h-22 rounded-xl object-cover border-2",
                      isDark ? "border-gray-600" : "border-gray-300",
                    )}
                  />
                </div>

                {/* Product Info */}
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    setSelectedProduct(order?.products);
                    setShowProductModal(true);
                  }}
                >
                  <p
                    className={`${textPrimary} ${order?.status === "canceled" ? "line-through" : ""}`}
                  >
                    {order?.products?.name}
                  </p>
                  <p className={`text-sm ${textTertiary}`}>
                    {order?.products?.vendor ? order?.products?.vendor : "-"}
                  </p>
                </div>

                {/* Price & Actions */}
                <div
                  className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div className={`text-right ${isRTL ? "text-left" : ""}`}>
                    <p
                      className={`${textPrimary} ${order?.status === "canceled" ? "line-through" : ""}`}
                    >
                      ₪
                      {(
                        order?.products?.quantity * order?.products?.amount
                      ).toLocaleString()}
                    </p>
                    <p className={`text-sm ${textTertiary}`}>
                      {order?.products?.quantity} x ₪{order?.products?.amount}
                    </p>
                  </div>

                  {order?.status === "canceled" && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400`}
                    >
                      {t("cancelled") || "Cancelled"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div>
          <h3 className={`text-lg mb-3 ${textPrimary}`}>
            {t("payment_breakdown") || "Payment Breakdown"}
          </h3>
          <div
            className={`border rounded-lg p-4 space-y-2 ${isDark ? "border-gray-800" : "border-gray-200"}`}
          >
            <div className="flex justify-between">
              <span className={textTertiary}>
                {t("voucher_amount") || "Voucher"}
              </span>
              <span className={textPrimary}>
                {order?.voucher && order?.voucher?.length > 0
                  ? `₪${order?.voucher
                      ?.reduce(
                        (total: number, voucher: any) =>
                          total + (voucher?.redeemedAmount || 0),
                        0,
                      )
                      ?.toLocaleString()}`
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={textTertiary}>
                {t("credit_card_amount") || "Credit Card"}
              </span>
              <span className={textPrimary}>
                {order?.creditCardPayment
                  ? `₪${order?.creditCardPayment?.toLocaleString()}`
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={textTertiary}>
                {t("delivery_fee") || "Delivery Fee"}
              </span>
              <span className={textPrimary}>
                {order?.deliveryFee
                  ? `₪${order?.deliveryFee?.toLocaleString()}`
                  : "-"}
              </span>
            </div>
            <div
              className={`flex justify-between pt-2 border-t ${isDark ? "border-gray-700" : "border-gray-300"}`}
            >
              <span className={`${textPrimary}`}>{t("total") || "Total"}</span>
              <span className={`${textPrimary}`}>
                {order?.totalAmount
                  ? `₪${order?.totalAmount?.toLocaleString()}`
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        {/* Actions */}
        {userRole === UserRole.AUTHORITY ||
          (userRole === UserRole.SUPERADMIN && (
            <div
              className={`flex  gap-3 pt-4  border-t ${isDark ? "border-gray-800" : "border-gray-200"} ${isRTL ? "flex-row-reverse" : ""}`}
            >
              {order?.status !== "canceled" &&
                order?.status !== "completed" && (
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
                )}

              <button
                onClick={() => handleResendNotification("VENDOR")}
                disabled={sendingTarget !== null}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDark
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                } ${sendingTarget !== null ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {sendingTarget === "VENDOR" ? (
                  <Loader className="w-4 h-4 animate-spin inline mr-2" />
                ) : null}
                {sendingTarget === "VENDOR"
                  ? t("sending") || "Sending..."
                  : t("resend_order_vendor") || "Resend Notification"}
              </button>

              <button
                onClick={() => handleResendNotification("CUSTOMER")}
                disabled={sendingTarget !== null}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDark
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                } ${sendingTarget !== null ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {sendingTarget === "CUSTOMER" ? (
                  <Loader className="w-4 h-4 animate-spin inline mr-2" />
                ) : null}
                {sendingTarget === "CUSTOMER"
                  ? t("sending") || "Sending..."
                  : t("resend_order_customer") || "Resend Notification"}
              </button>
            </div>
          ))}
      </div>
      {/* Cancellation Dialog */}
      {showCancelDialog && (
        <CancellationDialog
          type={cancelType}
          itemName={itemToCancel?.name}
          loading={isCancelling}
          onCancel={() => {
            setShowCancelDialog(false);
            setItemToCancel(null);
          }}
          onConfirm={async (reason) => {
            setIsCancelling(true);

            try {
              if (cancelType === "order") {
                const body = {
                  status: "canceled",
                  canceled_reason: t(reason),
                };

                if (isQRMode && qrToken) {
                  await axios.post(
                    `${envKeys.baseUrl}/api/public/orders/verify/${qrToken}/update-status`,
                    body,
                  );
                } else {
                  await updateOrderStatus({
                    orderId: order?._id,
                    body,
                  }).unwrap();
                }

                // Reload page in QR mode, otherwise just refetch
                if (isQRMode) {
                  window.location.reload();
                } else {
                  refetch();
                }
              }

              toast.success(t("order_cancelled_successfully"));

              setShowCancelDialog(false);
              setItemToCancel(null);
            } catch (error) {
              toast.error(t("cancel_failed"));
            } finally {
              setIsCancelling(false);
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
