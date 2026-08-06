import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  RotateCcw,
  XCircle,
} from "lucide-react";
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

  // Merge the original raise, the admin's response (if any), and every
  // reopen into a single chronological timeline - oldest first, so it
  // reads top-to-bottom the way the dispute actually unfolded. `history`
  // entries carry their own `type` ("raised" | "resolved" | "reopened") and
  // can duplicate the top-level raisedBy/resolution snapshot for the same
  // event - map by type instead of assuming every history entry is a
  // reopen, and skip the top-level snapshot whenever history already has
  // an entry of that type so nothing is shown twice.
  const disputeTimeline = useMemo(() => {
    if (!disputeDetails) return [];
    const historyEntries: any[] = disputeDetails.history || [];
    const hasRaisedInHistory = historyEntries.some(
      (entry) => entry.type === "raised",
    );
    const hasResolvedInHistory = historyEntries.some(
      (entry) => entry.type === "resolved",
    );

    const entries: Array<{
      kind: "raised" | "responded" | "reopened";
      createdAt: string;
      performedBy?: { firstName?: string; lastName?: string; email?: string };
      reason?: string;
      description?: string;
      attachments?: string[];
      action?: string;
    }> = [];

    if (!hasRaisedInHistory) {
      entries.push({
        kind: "raised",
        createdAt: disputeDetails.createdAt,
        performedBy: disputeDetails.raisedBy,
        reason: disputeDetails.reason,
        description: disputeDetails.description,
        attachments: disputeDetails.attachments,
      });
    }

    if (disputeDetails.resolution && !hasResolvedInHistory) {
      entries.push({
        kind: "responded",
        createdAt: disputeDetails.resolution.respondedAt,
        performedBy: disputeDetails.respondedBy,
        description: disputeDetails.resolution.vendorFacingResponse,
        action: disputeDetails.resolution.action,
      });
    }

    historyEntries.forEach((entry) => {
      if (entry.type === "raised") {
        entries.push({
          kind: "raised",
          createdAt: entry.createdAt,
          performedBy: entry.performedBy,
          reason: entry.reason,
          description: entry.description,
          attachments: entry.attachments,
        });
      } else if (entry.type === "resolved") {
        entries.push({
          kind: "responded",
          createdAt: entry.createdAt,
          performedBy: entry.performedBy,
          description: entry.vendorFacingResponse,
          action: entry.action,
        });
      } else if (entry.type === "reopened") {
        entries.push({
          kind: "reopened",
          createdAt: entry.createdAt,
          performedBy: entry.performedBy,
          reason: entry.reason,
          description: entry.description,
          attachments: entry.attachments,
        });
      }
    });

    return entries.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [disputeDetails]);

  const [activeTab, setActiveTab] = useState<"info" | "dispute">("info");
  const [responseToVendor, setResponseToVendor] = useState("");
  const [resolutionAction, setResolutionAction] = useState("");
  const [errors, setErrors] = useState<{ action?: string; response?: string }>(
    {},
  );

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

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mt-4">
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "info"
                ? "border-orange-500 text-orange-600 dark:text-orange-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {t("order_product_info")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dispute")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "dispute"
                ? "border-orange-500 text-orange-600 dark:text-orange-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {t("dispute_and_resolution")}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
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

              {/* Vendor's Dispute Information */}
              {isLoadingDispute ? (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
              ) : disputeDetails ? (
                <div className="space-y-3">
                  {/* Unified timeline: original raise, admin's response (if any), and every reopen, in the order they happened */}
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-200">
                        {t("dispute_information")}
                      </h3>
                      {disputeDetails.reopenCount > 0 && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200">
                          {t("reopened")} {disputeDetails.reopenCount}x
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      {disputeTimeline.map((entry, idx) => {
                        const name = [
                          entry.performedBy?.firstName,
                          entry.performedBy?.lastName,
                        ]
                          .filter(Boolean)
                          .join(" ");
                        const isLast = idx === disputeTimeline.length - 1;
                        const isRejected =
                          entry.kind === "responded" &&
                          entry.action !== "accept";

                        const accent =
                          entry.kind === "responded"
                            ? isRejected
                              ? {
                                  line: "border-red-300 dark:border-red-700",
                                  dot: "bg-red-500",
                                  label: "text-red-800 dark:text-red-200",
                                  badge:
                                    "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200",
                                  body: "text-red-900 dark:text-red-100",
                                  meta: "text-red-700 dark:text-red-400",
                                }
                              : {
                                  line: "border-green-300 dark:border-green-700",
                                  dot: "bg-green-500",
                                  label: "text-green-800 dark:text-green-200",
                                  badge:
                                    "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200",
                                  body: "text-green-900 dark:text-green-100",
                                  meta: "text-green-700 dark:text-green-400",
                                }
                            : entry.kind === "reopened"
                              ? {
                                  line: "border-amber-300 dark:border-amber-700",
                                  dot: "bg-amber-500",
                                  label: "text-amber-800 dark:text-amber-200",
                                  badge:
                                    "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200",
                                  body: "text-amber-900 dark:text-amber-100",
                                  meta: "text-amber-700 dark:text-amber-400",
                                }
                              : {
                                  line: "border-orange-300 dark:border-orange-700",
                                  dot: "bg-orange-500",
                                  label: "text-orange-800 dark:text-orange-200",
                                  badge:
                                    "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200",
                                  body: "text-orange-900 dark:text-orange-100",
                                  meta: "text-orange-700 dark:text-orange-400",
                                };

                        const Icon =
                          entry.kind === "reopened"
                            ? RotateCcw
                            : entry.kind === "responded"
                              ? isRejected
                                ? XCircle
                                : CheckCircle2
                              : AlertTriangle;

                        const label =
                          entry.kind === "raised"
                            ? t("dispute_raised")
                            : entry.kind === "reopened"
                              ? t("reopened")
                              : isRejected
                                ? t("reject_dispute")
                                : t("approve_dispute");

                        return (
                          <div
                            key={idx}
                            className={`relative pl-3 border-l-2 ${accent.line} ${
                              isLast ? "" : "pb-3"
                            }`}
                          >
                            <span
                              className={`absolute -left-1.25 top-0.5 w-2 h-2 rounded-full ${accent.dot}`}
                            />
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-semibold ${accent.label}`}
                              >
                                <Icon className="w-3 h-3" />
                                {label}
                              </span>
                              <span
                                className={`text-[11px] whitespace-nowrap ${accent.meta}`}
                              >
                                {formatDate(entry.createdAt)}
                              </span>
                            </div>
                            <div
                              className={`text-[11px] mt-0.5 ${accent.meta}`}
                            >
                              {name || entry.performedBy?.email || "—"}
                            </div>
                            {entry.reason && (
                              <span
                                className={`inline-block mt-1.5 text-[11px] font-medium capitalize px-2 py-0.5 rounded ${accent.badge}`}
                              >
                                {entry.reason.replace(/_/g, " ")}
                              </span>
                            )}
                            {entry.description && (
                              <p className={`text-xs mt-1.5 ${accent.body}`}>
                                {entry.description}
                              </p>
                            )}
                            {entry.attachments &&
                              entry.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                                  {entry.attachments.map(
                                    (attachment: string, i: number) => (
                                      <a
                                        key={i}
                                        href={attachment}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                                      >
                                        <Download className="w-3 h-3" />
                                        {t("attachment")} {i + 1}
                                      </a>
                                    ),
                                  )}
                                </div>
                              )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
          className={` ${bgPrimary} border-t ${borderColor} p-6 flex items-center justify-between gap-3`}
        >
          {!isResolved && activeTab === "dispute" && (
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
