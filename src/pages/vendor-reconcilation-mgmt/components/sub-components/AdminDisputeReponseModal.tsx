import { useState } from "react";
import { AlertTriangle, Download } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import type { MonthlyOrder } from "./VendorMonthlyReport";
import { useAppSelector } from "@/hooks/hooks";
import {
  useRespondDisputeMutation,
  useGetDisputeDetailsQuery,
} from "@/store/api/reconciliationQueryApi";
import ModalWrapper from "@/components/wrapper/ModalWrapper";

interface AdminDisputeResponseModalProps {
  order: MonthlyOrder;
  onClose: () => void;
  onResolve: () => void;
  disputeId?: string;
}

export const AdminDisputeResponseModal = ({
  order,
  onClose,
  onResolve,
  disputeId,
}: AdminDisputeResponseModalProps) => {
  const { t } = useTranslation("reconciliation");
  const { theme } = useAppSelector((state) => state.settings);
  const [respondDispute, { isLoading }] = useRespondDisputeMutation();
  const actualDisputeId = disputeId || order.disputeId;
  const { data: disputeDetails, isLoading: isLoadingDispute } =
    useGetDisputeDetailsQuery(actualDisputeId as string, {
      skip: !actualDisputeId,
    });

  const [responseToVendor, setResponseToVendor] = useState("");
  const [resolutionAction, setResolutionAction] = useState("");
  const [errors, setErrors] = useState<{ action?: string }>({});

  const isResolved =
    order.reconciliationStatus === "approved" ||
    order.reconciliationStatus === "rejected";

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

  const validate = () => {
    const newErrors: { response?: string; action?: string } = {};

    if (!resolutionAction) {
      newErrors.action = t("please_select_resolution_action");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const actualDisputeId = disputeId || order.disputeId || order._id;

    let defaultResponse = "";
    if (resolutionAction === "accept") {
      defaultResponse = t("dispute_approved_message");
    } else if (resolutionAction === "reject") {
      defaultResponse = t("dispute_rejected_message");
    }

    try {
      await respondDispute({
        disputeId: actualDisputeId,
        action: resolutionAction,
        vendorFacingResponse: responseToVendor || defaultResponse,
      }).unwrap();

      toast.success(t("dispute_resolved"));
      onResolve();
      onClose();
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message;
      toast.error(errorMessage || t("dispute_failed"));
    }
  };

  return (
    <ModalWrapper onClose={onClose} maxWidth="max-w-2xl" height="">
      <div
        className={`${bgPrimary} rounded-lg  w-full max-h-[90vh] overflow-y-auto p-4`}
      >
        {/* Header */}

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${textPrimary}`}>
              {t("dispute_resolution")}
            </h2>
            <p className={`text-sm ${textTertiary}`}>
              {t("order_number")} #{order._id}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {isResolved ? (
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  order.reconciliationStatus === "approved"
                    ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                    : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400"
                }`}
              >
                {t(order.reconciliationStatus)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">
                {t("awaiting_response")}
              </span>
            )}
          </div>

          {/* Order Details */}
          <div className={`${bgSecondary} rounded-lg p-4`}>
            <h3 className={`text-sm font-semibold ${textPrimary} mb-3`}>
              {t("order_details")}
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
                </div>
              </div>
              <div>
                <div className={`text-xs ${textTertiary} mb-1`}>
                  {t("customer")}
                </div>
                <div className={`text-sm ${textSecondary}`}>
                  {order.customerName}
                  <br />
                  <span className="text-xs">{order.customerEmail}</span>
                </div>
              </div>
              <div>
                <div className={`text-xs ${textTertiary} mb-1`}>
                  {t("order_date")}
                </div>
                <div className={`text-sm ${textSecondary}`}>
                  {formatDate(order.purchaseDate)}
                </div>
              </div>
              <div>
                <div className={`text-xs ${textTertiary} mb-1`}>
                  {t("amount")}
                </div>
                <div className={`text-sm font-bold ${textPrimary}`}>
                  ₪{order.totalPrice.toFixed(2)}
                </div>
              </div>
              <div>
                <div className={`text-xs ${textTertiary} mb-1`}>
                  {t("quantity")}
                </div>
                <div className={`text-sm ${textSecondary}`}>
                  {order.quantity}
                </div>
              </div>
            </div>
          </div>

          {/* Vendor's Dispute Information */}
          {isLoadingDispute ? (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          ) : disputeDetails ? (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 space-y-4">
              <div>
                <h3
                  className={`text-sm font-semibold text-orange-900 dark:text-orange-200 mb-3`}
                >
                  {t("dispute_information")}
                </h3>
              </div>

              {/* Raised By */}
              <div>
                <div
                  className={`text-xs text-orange-700 dark:text-orange-300 mb-1`}
                >
                  {t("raised_by")}
                </div>
                <div
                  className={`text-sm font-medium text-orange-900 dark:text-orange-100`}
                >
                  {disputeDetails.raisedBy?.firstName}{" "}
                  {disputeDetails.raisedBy?.lastName}
                </div>
                <div className={`text-xs text-orange-700 dark:text-orange-300`}>
                  {disputeDetails.raisedBy?.email}
                </div>
              </div>

              {/* Reason */}
              <div>
                <div
                  className={`text-xs text-orange-700 dark:text-orange-300 mb-1`}
                >
                  {t("reason")}
                </div>
                <div
                  className={`text-sm font-medium text-orange-900 dark:text-orange-100 capitalize`}
                >
                  {disputeDetails.reason?.replace(/_/g, " ")}
                </div>
              </div>

              {/* Description */}
              <div>
                <div
                  className={`text-xs text-orange-700 dark:text-orange-300 mb-1`}
                >
                  {t("description")}
                </div>
                <div className={`text-sm text-orange-900 dark:text-orange-100`}>
                  {disputeDetails.description}
                </div>
              </div>

              {/* Product Details */}
              {disputeDetails.product && (
                <div className="border-t border-orange-200 dark:border-orange-700 pt-3">
                  <div
                    className={`text-xs text-orange-700 dark:text-orange-300 mb-2`}
                  >
                    {t("product_in_dispute")}
                  </div>
                  <div className="flex gap-3">
                    {disputeDetails.product?.image?.image && (
                      <img
                        src={disputeDetails.product.image.image}
                        alt={disputeDetails.product.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div>
                      <div
                        className={`text-sm font-medium text-orange-900 dark:text-orange-100`}
                      >
                        {disputeDetails.product?.name}
                      </div>
                      {disputeDetails.orderProduct && (
                        <div
                          className={`text-xs text-orange-700 dark:text-orange-300`}
                        >
                          {t("qty")}: {disputeDetails.orderProduct.quantity} |{" "}
                          {t("amount")}: ₪{disputeDetails.orderProduct.amount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments */}
              {disputeDetails.attachments &&
                disputeDetails.attachments.length > 0 && (
                  <div className="border-t border-orange-200 dark:border-orange-700 pt-3">
                    <div
                      className={`text-xs text-orange-700 dark:text-orange-300 mb-2`}
                    >
                      {t("attachments")}
                    </div>
                    <div className="space-y-2">
                      {disputeDetails.attachments.map(
                        (attachment: any, idx: number) => (
                          <a
                            key={idx}
                            href={attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                          >
                            <Download className="w-3 h-3" />
                            {t("attachment")} {idx + 1}
                          </a>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          ) : null}

          {/* Admin Response Section */}
          <div className="border-t pt-6">
            <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>
              {t("dispute_resolution")}
            </h3>

            {isResolved ? (
              <div className={`${bgSecondary} rounded-lg p-4`}>
                <p className={textSecondary}>
                  {t("dispute_already")}{" "}
                  <span
                    className={
                      order.reconciliationStatus === "approved"
                        ? "text-green-600 dark:text-green-400 font-semibold"
                        : "text-red-600 dark:text-red-400 font-semibold"
                    }
                  >
                    {order.reconciliationStatus}
                  </span>
                </p>
              </div>
            ) : (
              <>
                {/* Response to Vendor */}
                <div className="mb-6">
                  <label
                    className={`block text-sm font-medium ${textPrimary} mb-2`}
                  >
                    {t("custom_response")}
                  </label>
                  <textarea
                    value={responseToVendor}
                    onChange={(e) => {
                      setResponseToVendor(e.target.value);
                    }}
                    placeholder={t("custom_response_placeholder")}
                    rows={3}
                    className={`w-full px-4 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                  />
                  <p className={`text-xs ${textTertiary} mt-1`}>
                    {t("custom_response_helper")}
                  </p>
                </div>

                {/* Resolution Action */}
                <div className="mb-4">
                  <label
                    className={`block text-sm font-medium ${textPrimary} mb-3`}
                  >
                    {t("decision")} <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <label
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        resolutionAction === "accept"
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : `border-gray-300 dark:border-gray-600`
                      }`}
                    >
                      <input
                        type="radio"
                        name="resolution"
                        value="accept"
                        checked={resolutionAction === "accept"}
                        onChange={(e) => {
                          setResolutionAction(e.target.value);
                          setErrors({ ...errors, action: undefined });
                        }}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div
                          className={`text-sm font-semibold text-green-600 dark:text-green-400`}
                        >
                          {t("approve_dispute")}
                        </div>
                        <div className={`text-xs ${textTertiary} mt-1`}>
                          {t("approve_full_refund")}
                        </div>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        resolutionAction === "reject"
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                          : `border-gray-300 dark:border-gray-600`
                      }`}
                    >
                      <input
                        type="radio"
                        name="resolution"
                        value="reject"
                        checked={resolutionAction === "reject"}
                        onChange={(e) => {
                          setResolutionAction(e.target.value);
                          setErrors({ ...errors, action: undefined });
                        }}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div
                          className={`text-sm font-semibold text-red-600 dark:text-red-400`}
                        >
                          {t("reject_dispute")}
                        </div>
                        <div className={`text-xs ${textTertiary} mt-1`}>
                          {t("reject_keep_payment")}
                        </div>
                      </div>
                    </label>
                  </div>
                  {errors.action && (
                    <p className="text-red-500 text-xs mt-1">{errors.action}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          className={` ${bgPrimary} border-t ${borderColor} p-6 flex items-center justify-between gap-3`}
        >
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg border ${borderColor} ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {t("cancel_btn")}
          </button>

          {!isResolved && (
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={isLoading || resolutionAction !== "reject"}
                className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                  resolutionAction === "reject"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                {isLoading && resolutionAction === "reject" && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {t("reject_dispute")}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || resolutionAction !== "accept"}
                className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                  resolutionAction === "accept"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                {isLoading && resolutionAction === "accept" && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {t("approve_dispute")}
              </button>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};
