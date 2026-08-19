import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/hooks/hooks";
import {
  useRespondDisputeMutation,
  useGetDisputeDetailsQuery,
} from "@/store/api/reconciliationQueryApi";
import ModalWrapper from "@/components/wrapper/ModalWrapper";
import DisputeTimeline from "./DisputeTimeline";

interface AdminDisputeResponseModalProps {
  order: IMonthlyOrder;
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

      refetchOnMountOrArgChange: true,
    });

  const [activeTab, setActiveTab] = useState<"info" | "dispute">("info");
  const [responseToVendor, setResponseToVendor] = useState("");
  const [resolutionAction, setResolutionAction] = useState("");
  const [errors, setErrors] = useState<{ action?: string; response?: string }>(
    {},
  );

  const isResolved =
    order.reconciliationStatus === "approved" ||
    order.reconciliationStatus === "rejected" ||
    order.reconciliationStatus === "closed";

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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const validate = () => {
    const newErrors: { response?: string; action?: string } = {};

    if (!resolutionAction) {
      newErrors.action = t("please_select_resolution_action");
    }

    if (resolutionAction === "reject" && !responseToVendor.trim()) {
      newErrors.response = t("response_required_for_rejection");
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
        className={`${bgPrimary} rounded-lg w-full max-h-[90vh] flex flex-col overflow-hidden`}
      >
        {/* Header */}

        <div className="flex items-center gap-3 shrink-0 px-4 pt-4">
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
              {t("dispute_resolution")}
            </h2>
            <p className={`text-sm ${textTertiary}`}>
              {t("order_number")} #{order._id}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div
          className={`flex border-b mt-4 px-4 shrink-0 ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "info"
                ? `border-orange-500 ${isDark ? "text-orange-400" : "text-orange-600"}`
                : isDark
                  ? "border-transparent text-gray-400 hover:text-gray-300"
                  : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("order_product_info")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dispute")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "dispute"
                ? `border-orange-500 ${isDark ? "text-orange-400" : "text-orange-600"}`
                : isDark
                  ? "border-transparent text-gray-400 hover:text-gray-300"
                  : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("dispute_history")}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "info" && (
            <>
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
                      {t("total_amount")}
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
            </>
          )}

          {activeTab === "dispute" && (
            <>
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {isResolved ? (
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      order.reconciliationStatus === "approved"
                        ? isDark
                          ? "bg-green-900/20 text-green-400"
                          : "bg-green-100 text-green-800"
                        : isDark
                          ? "bg-red-900/20 text-red-400"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {t(order.reconciliationStatus)}
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      isDark
                        ? "bg-red-900/20 text-red-400"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {t("awaiting_response")}
                  </span>
                )}
              </div>

              {/* Vendor's Dispute Information */}
              <DisputeTimeline
                disputeDetails={disputeDetails}
                isLoading={isLoadingDispute}
              />

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
                        className={`font-semibold ${
                          order.reconciliationStatus === "approved"
                            ? isDark
                              ? "text-green-400"
                              : "text-green-600"
                            : isDark
                              ? "text-red-400"
                              : "text-red-600"
                        }`}
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
                        {resolutionAction === "reject" && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <textarea
                        value={responseToVendor}
                        onChange={(e) => {
                          setResponseToVendor(e.target.value);
                          if (errors.response) {
                            setErrors({ ...errors, response: undefined });
                          }
                        }}
                        placeholder={t("custom_response_placeholder")}
                        rows={3}
                        className={`w-full px-4 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.response ? "border-red-500" : ""}`}
                      />
                      {errors.response && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.response}
                        </p>
                      )}
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
                          className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
                          } ${
                            resolutionAction === "accept"
                              ? isDark
                                ? "border-green-500 bg-green-900/20"
                                : "border-green-500 bg-green-50"
                              : isDark
                                ? "border-gray-600"
                                : "border-gray-300"
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
                              className={`text-sm font-semibold ${isDark ? "text-green-400" : "text-green-600"}`}
                            >
                              {t("approve_dispute")}
                            </div>
                            <div className={`text-xs ${textTertiary} mt-1`}>
                              {t("approve_full_refund")}
                            </div>
                          </div>
                        </label>

                        <label
                          className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"
                          } ${
                            resolutionAction === "reject"
                              ? isDark
                                ? "border-red-500 bg-red-900/20"
                                : "border-red-500 bg-red-50"
                              : isDark
                                ? "border-gray-600"
                                : "border-gray-300"
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
                              className={`text-sm font-semibold ${isDark ? "text-red-400" : "text-red-600"}`}
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
                        <p className="text-red-500 text-xs mt-1">
                          {errors.action}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div
          className={`${bgPrimary} border-t ${borderColor} p-6 flex items-center justify-between gap-3 shrink-0`}
        >
          {!isResolved && activeTab === "dispute" && (
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={isLoading || resolutionAction !== "reject"}
                className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                  resolutionAction === "reject"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : isDark
                      ? "bg-gray-700 text-gray-400"
                      : "bg-gray-200 text-gray-600"
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
                    : isDark
                      ? "bg-gray-700 text-gray-400"
                      : "bg-gray-200 text-gray-600"
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
