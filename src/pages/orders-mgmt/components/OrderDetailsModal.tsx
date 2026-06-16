import clsx from "clsx";
import axios from "axios";
import { toast } from "sonner";
import { useState } from "react";
import { Loader, Mail, Phone, XCircle } from "lucide-react";

import InfoRow from "./sub-components/InfoRow";
import { ModalWrapper } from "@/components/wrapper";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import ProductDetailsModal from "./sub-components/ProductDetailsModal";
import CancellationDialog from "./sub-components/CancellationDialog";
import {
  useBulkOrdersUpdateMutation,
  useUpdateOrderStatusMutation,
} from "@/store/api/orderMutationApi";
import { useAppSelector } from "@/hooks/hooks";
import { UserRole } from "@/enums/user.types";
import { ImageWithFallback } from "@/components/shared";
import OrderStatusChangeBtn from "@/components/btns/OrderStatusChangeBtn";
import { envKeys } from "@/lib/envKeys";
import { useGetOrderByIdQuery } from "@/store/api/orderQueryApi";

interface OrderDetailsModalProps {
  orderId: string;
  onClose: () => void;
  t: (key: string) => string;
  isQRMode?: boolean;
  qrToken?: string | null;
}

function OrderDetailsModal({
  orderId,
  onClose,
  t,
  isQRMode,
  qrToken,
}: OrderDetailsModalProps) {
  const { userRole } = useAppSelector((state) => state.auth);
  const { textTertiary, textPrimary, isRTL, isDark } = useThemeClasses();

  const {
    data: orderDetails,
    refetch,
    isLoading,
    isFetching,
  } = useGetOrderByIdQuery({ orderId: orderId ?? null });
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(
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
  const [itemToCancel, setItemToCancel] = useState<ProductDto | null>(null);

  const handleResendNotification = async (recipient: "VENDOR" | "CUSTOMER") => {
    setSendingTarget(recipient);

    try {
      await bulkOrdersUpdate({
        ordersId: Array(orderId),
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
    if (orderDetails?.status === "completed") {
      toast.error(t("completed_order_status_locked"));
      return;
    }

    try {
      if (isQRMode && qrToken) {
        await axios.post(
          `${envKeys.baseUrl}/public/orders/verify/${qrToken}/update-status`,
          { status: status.toLowerCase() },
        );
      } else {
        await updateOrderStatus({
          orderId: orderDetails?._id,
          status: status.toLowerCase(),
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

  async function handleCancleConfirm(reason: string, additionalInfo: string) {
    setIsCancelling(true);

    try {
      if (isQRMode && qrToken) {
        await axios.post(
          `${envKeys.baseUrl}/public/orders/verify/${qrToken}/update-status`,
          { status: "canceled", canceledReason: t(reason) },
        );
      } else if (cancelType === "order") {
        await updateOrderStatus({
          orderId: orderDetails?._id,
          status: "canceled",
          cancelReason: t(reason),
          additionalInfo,
        }).unwrap();
      } else {
        await updateOrderStatus({
          orderId: orderDetails?._id,
          orderProductId: itemToCancel?._id,
          status: "canceled",
          cancelReason: t(reason),
          additionalInfo,
        }).unwrap();
      }

      if (isQRMode) {
        window.location.reload();
      } else {
        refetch();
      }
      toast.success(t("order_cancelled_successfully"));
      setShowCancelDialog(false);
      setItemToCancel(null);
    } catch (error) {
      toast.error(t("cancel_failed"));
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <ModalWrapper
      height="h-max"
      onClose={onClose}
      showSpinner={isLoading || isFetching}
    >
      <div
        className={`flex items-center justify-between 
              ${isRTL ? "flex-row-reverse" : ""} 
              p-4 md:p-6 
              mb-4`}
      >
        <div>
          <h2 className={`text-2xl font-semibold ${textPrimary}`}>
            {t("order_details")}
          </h2>
          <p className={clsx(textPrimary, "font-bold")}>#{orderId}</p>
        </div>

        <OrderStatusChangeBtn
          status={orderDetails?.status || "pending"}
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
              value={`${orderDetails?.buyerFirstName || ""} ${orderDetails?.buyerLastName || ""}`}
            />

            {/* Email - Clickable */}
            <div>
              <p
                className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"} `}
              >
                {t("purchaser_email") || "Email"}
              </p>
              <a
                href={`mailto:${orderDetails?.buyerEmail}`}
                className={`text-sm flex items-center gap-1 text-teal-500 hover:text-teal-600 transition-colors`}
              >
                <div>
                  <Mail className="w-3 h-3" />
                </div>
                <div>{orderDetails?.buyerEmail}</div>
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
                href={`tel:${orderDetails?.buyerPhone}`}
                className={`text-sm flex items-center gap-1 text-teal-500 hover:text-teal-600 transition-colors`}
              >
                <Phone className="w-3 h-3" />
                {orderDetails?.buyerPhone ? orderDetails?.buyerPhone : "-"}
              </a>
            </div>

            <InfoRow
              label={t("purchaser_address") || "Address"}
              value={
                orderDetails?.buyerAddress ? orderDetails.buyerAddress : "-"
              }
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
            {orderDetails?.products?.map((product, idx) => (
              <div
                key={product?._id}
                className={`p-4 ${idx > 0 ? `border-t ${isDark ? "border-gray-800" : "border-gray-200"}` : ""} ${product?.cancelled ? "opacity-50" : ""}`}
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
                    <ImageWithFallback
                      src={product?.image}
                      alt={product?.name}
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
                      setSelectedProduct(product);
                      setShowProductModal(true);
                    }}
                  >
                    <p
                      className={`${textPrimary} ${product?.cancelled ? "line-through" : ""}`}
                    >
                      {product?.name}
                    </p>
                    {/* <p className={`text-sm ${textTertiary}`}>
                      {product?.vendor ? product?.vendor : "-"}
                    </p> */}
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

                    {orderDetails?.products?.length > 1 &&
                      orderDetails?.status !== "canceled" &&
                      orderDetails?.status !== "completed" &&
                      orderDetails?.status !== "shipped" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCancelType("item");
                            setItemToCancel(product);
                            setShowCancelDialog(true);
                          }}
                          className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-red-900/30 text-red-400" : "hover:bg-red-50 text-red-500"}`}
                          title={t("cancelProduct")}
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}

                    {product?.cancelled && (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                        {t("cancelled")}
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
            className={`border rounded-lg p-4 space-y-2 ${isDark ? "border-gray-800" : "border-gray-200"}`}
          >
            <div className="flex justify-between">
              <span className={textTertiary}>
                {t("voucher_amount") || "Voucher"}
              </span>
              <span className={textPrimary}>
                {orderDetails?.voucher && orderDetails?.voucher?.length > 0
                  ? `₪${orderDetails?.voucher
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
                {orderDetails?.creditCardPayment
                  ? `₪${orderDetails?.creditCardPayment?.toLocaleString()}`
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={textTertiary}>
                {t("delivery_fee") || "Delivery Fee"}
              </span>
              <span className={textPrimary}>
                {orderDetails?.deliveryFee
                  ? `₪${orderDetails?.deliveryFee?.toLocaleString()}`
                  : "-"}
              </span>
            </div>
            <div
              className={`flex justify-between pt-2 border-t ${isDark ? "border-gray-700" : "border-gray-300"}`}
            >
              <span className={`${textPrimary}`}>{t("total") || "Total"}</span>
              <span className={`${textPrimary}`}>
                {orderDetails?.totalAmount
                  ? `₪${orderDetails?.totalAmount?.toLocaleString()}`
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
              {orderDetails?.status !== "canceled" &&
                orderDetails?.status !== "completed" && (
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
          onConfirm={(reason, additionalInfo) =>
            handleCancleConfirm(reason, additionalInfo)
          }
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
