import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAppSelector } from "@/hooks/hooks";
import { useCreateSignedUrlMutation } from "@/store/api/mediaMutationApi";
import { uploadWithProgress } from "@/helpers";
import {
  useGetOrderProductDetailsQuery,
  useLazyGetOrderProductDetailsQuery,
  useCancelOrderProductMutation,
  useOpenDisputeMutation,
  useReopenDisputeMutation,
  useBulkMarkOrderAsCompletedMutation,
  useFinalizeClosedOrdersMutation,
  usePreviewFinalizeClosedOrdersQuery,
} from "@/store/api/reconciliationQueryApi";
import { mapOrderProductDetails } from "../helpers";

export interface UseOrderActionsParams {
  language: Language;
  adminView: boolean;
  refetch: () => void;
  refetchReconciliationStats: () => void;
  scopeParams: Record<string, any>;
}

export function useOrderActions({
  language,
  adminView,
  refetch,
  refetchReconciliationStats,
  scopeParams,
}: UseOrderActionsParams) {
  const { t } = useTranslation("reconciliation");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userRole } = useAppSelector((state) => state.auth);

  const [selectedOrder, setSelectedOrder] = useState<IMonthlyOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [isReopenDisputeFlow, setIsReopenDisputeFlow] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAdminDisputeModal, setShowAdminDisputeModal] = useState(false);
  const [showCloseAllOrdersModal, setShowCloseAllOrdersModal] = useState(false);
  const [showBulkCompleteConfirm, setShowBulkCompleteConfirm] = useState(false);
  const [detailsOrderId, setDetailsOrderId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [reopenFetchingId, setReopenFetchingId] = useState<string | null>(null);

  const { data: orderDetailsData, isFetching: isDetailsLoading } =
    useGetOrderProductDetailsQuery(detailsOrderId as string, {
      skip: !detailsOrderId,
      refetchOnMountOrArgChange: true,
    });
  const [cancelOrderProduct] = useCancelOrderProductMutation();
  const [openDispute] = useOpenDisputeMutation();
  const [reopenDispute] = useReopenDisputeMutation();
  const [fetchOrderDetailsForReopen] = useLazyGetOrderProductDetailsQuery();
  const [createSignedUrl] = useCreateSignedUrlMutation();
  const [bulkMarkOrderAsCompleted, { isLoading: isBulkCompleting }] =
    useBulkMarkOrderAsCompletedMutation();
  const [finalizeClosedOrders, { isLoading: isClosingAllOrders }] =
    useFinalizeClosedOrdersMutation();
  // only fetched while the confirmation modal is actually open - no point
  // hitting this on every page load
  const {
    data: finalizeSweepPreview,
    isFetching: isFetchingSweepPreview,
    isError: isSweepPreviewError,
    error: sweepPreviewError,
  } = usePreviewFinalizeClosedOrdersQuery(undefined, {
    skip: !showCloseAllOrdersModal,
  });
  // surface the backend's own message when it has one (e.g. "can't
  // finalize yet, vendors still have time") instead of always showing the
  // generic "couldn't check, try again" text - that generic text is only
  // right for an actual technical failure, not a deliberate block
  const sweepPreviewErrorMessage =
    (sweepPreviewError as any)?.data?.message ?? undefined;

  const displayedOrder = useMemo(() => {
    if (orderDetailsData && detailsOrderId === selectedOrder?._id) {
      return mapOrderProductDetails(orderDetailsData, language);
    }
    // Handle case when navigating from URL with orderProductId
    if (orderDetailsData && detailsOrderId && !selectedOrder) {
      return mapOrderProductDetails(orderDetailsData, language);
    }
    return selectedOrder;
  }, [orderDetailsData, detailsOrderId, selectedOrder, language]);

  // Auto-open order details modal when orderProductId is in URL
  useEffect(() => {
    const orderProductId = searchParams.get("orderProductId");
    const disputeId = searchParams.get("disputeId");
    if (!orderProductId) return;

    setDetailsOrderId(orderProductId);

    if (disputeId && adminView) {
      setShowAdminDisputeModal(true);
    } else {
      setShowOrderDetails(true);
    }
  }, [searchParams, adminView]);

  const handleOpenDispute = (order: IMonthlyOrder) => {
    if (userRole !== "traveller") {
      toast.error(t("only_traveller_can_open_disputes"));
      return;
    }
    setSelectedOrder(order);
    setIsReopenDisputeFlow(false);
    setShowDisputeModal(true);
  };

  const handleReopenDispute = (order: IMonthlyOrder) => {
    if (userRole !== "traveller") {
      toast.error(t("only_traveller_can_open_disputes"));
      return;
    }
    setSelectedOrder(order);
    setShowOrderDetails(false);
    setIsReopenDisputeFlow(true);
    setShowDisputeModal(true);
  };

  // Row actions only have the list-mapped order, whose disputeId is
  // frequently missing - fetch the order's details (whose disputeId is
  // reliable, same as the OrderDetailsModal path) before opening the
  // reopen modal, instead of failing with "dispute not found".
  const handleReopenFromRow = async (order: IMonthlyOrder) => {
    if (userRole !== "traveller") {
      toast.error(t("only_traveller_can_open_disputes"));
      return;
    }
    setReopenFetchingId(order._id);
    try {
      const details = await fetchOrderDetailsForReopen(order._id).unwrap();
      const mapped = mapOrderProductDetails(details, language);
      handleReopenDispute({
        ...order,
        ...mapped,
        disputeId: mapped.disputeId || order.disputeId,
      });
    } catch {
      toast.error(t("reopen_dispute_failed"));
    } finally {
      setReopenFetchingId(null);
    }
  };

  const closeDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
    setDetailsOrderId(null);
    // Clear orderProductId from URL
    searchParams.delete("orderProductId");
    searchParams.delete("disputeId");

    navigate(`${window.location.pathname}?${searchParams.toString()}`, {
      replace: true,
    });
  };

  const handleSubmitReopenDispute = async (
    reason: string,
    details: string,
    files: File[],
  ) => {
    if (!selectedOrder) return;
    // The order's _id is an orderProduct id, not a dispute id - sending it
    // to /disputes/reopen/:disputeId 404s with "dispute not found", so bail
    // out with a clear error instead of silently substituting it.
    if (!selectedOrder.disputeId) {
      toast.error(t("reopen_dispute_failed"));
      return;
    }
    try {
      const attachmentUrls: string[] = [];

      // Upload files if any
      if (files.length > 0) {
        for (const file of files) {
          const res = await createSignedUrl([
            { originalName: file.name, mimeType: file.type },
          ]);
          const { signedUrl, gcsURL } = res.data[0] as {
            signedUrl: string;
            gcsURL: string;
          };

          await uploadWithProgress(file, signedUrl, () => {});
          attachmentUrls.push(gcsURL);
        }
      }

      await reopenDispute({
        disputeId: selectedOrder.disputeId,
        reason,
        description: details,
        attachments: attachmentUrls,
      }).unwrap();

      toast.success(t("dispute_reopened"));
      setShowDisputeModal(false);
      setIsReopenDisputeFlow(false);
      closeDetails();
      refetch();
      refetchReconciliationStats();
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message;
      if (errorMessage?.includes("role")) {
        toast.error(t("only_traveller_can_open_disputes"));
      } else {
        toast.error(t("reopen_dispute_failed"));
      }
    }
  };

  const handleSubmitDispute = async (
    reason: string,
    details: string,
    files: File[],
  ) => {
    if (!selectedOrder) return;
    try {
      const attachmentUrls: string[] = [];

      // Upload files if any
      if (files.length > 0) {
        for (const file of files) {
          const res = await createSignedUrl([
            { originalName: file.name, mimeType: file.type },
          ]);
          const { signedUrl, gcsURL } = res.data[0] as {
            signedUrl: string;
            gcsURL: string;
          };

          await uploadWithProgress(file, signedUrl, () => {});
          attachmentUrls.push(gcsURL);
        }
      }

      await openDispute({
        orderId: selectedOrder._id,
        reason,
        description: details,
        attachments: attachmentUrls,
      }).unwrap();

      toast.success(t("dispute_submitted"));
      setShowDisputeModal(false);
      closeDetails();
      refetch();
      refetchReconciliationStats();
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message;
      if (errorMessage?.includes("cannot be disputed")) {
        toast.error(t("order_cannot_be_disputed"));
      } else if (errorMessage?.includes("role")) {
        toast.error(t("only_traveller_can_open_disputes"));
      } else {
        toast.error(t("dispute_failed"));
      }
    }
  };

  const handleCancelOrder = (order: IMonthlyOrder) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const handleSubmitCancel = async (
    reason: string,
    notes: string,
    sendEmail: boolean,
  ) => {
    if (!selectedOrder) return;
    try {
      await cancelOrderProduct({
        orderId: selectedOrder.orderId,
        orderProductId: selectedOrder._id,
        cancelReason: reason,
        additionalInfo: notes,
        sendEmail,
      }).unwrap();

      toast.success(t("order_cancelled"));
      setShowCancelModal(false);
      closeDetails();
      refetch();
      refetchReconciliationStats();
    } catch (error) {
      toast.error(t("cancel_failed"));
    }
  };

  const handleViewDetails = (order: IMonthlyOrder) => {
    setSelectedOrder(order);
    setDetailsOrderId(order._id);
    setShowOrderDetails(true);
  };

  const handleApproveDispute = (order: IMonthlyOrder) => {
    setSelectedOrder(order);
    setDetailsOrderId(order._id);
    setShowAdminDisputeModal(true);
  };

  const handleAdminResolveDispute = () => {
    toast.success(t("dispute_resolved"));
    setShowAdminDisputeModal(false);
    setSelectedOrder(null);
    setDetailsOrderId(null);
    refetch();
  };

  const handleBulkMarkOrderCompleted = async () => {
    try {
      // act on exactly what's currently shown - same DMO/Authority/vendor/
      // date scope as the list itself, not silently the real current month
      await bulkMarkOrderAsCompleted({
        markAllAsCompleted: true,
        ...scopeParams,
      }).unwrap();

      toast.success(t("orders_mark_as_completed"));
      setSelectedItems(new Set());
      setShowBulkCompleteConfirm(false);
      refetch();
      refetchReconciliationStats();
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message;
      toast.error(errorMessage || t("approve_failed"));
    }
  };

  // prefer the backend's authoritative targetMonth once the preview loads -
  // the client-side guess below is just a placeholder (browser clock/timezone can disagree near month boundaries)
  const targetMonth = finalizeSweepPreview?.targetMonth;
  const closeAllOrdersTargetMonthLabel = useMemo(() => {
    if (targetMonth) {
      const [month, year] = targetMonth.split("/").map(Number);
      if (month && year) {
        return new Date(year, month - 1, 1).toLocaleString(undefined, {
          month: "long",
          year: "numeric",
        });
      }
    }
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return previousMonth.toLocaleString(undefined, {
      month: "long",
      year: "numeric",
    });
  }, [targetMonth]);

  const handleCloseAllOrders = async () => {
    try {
      await finalizeClosedOrders({
        confirmFinalize: true,
      }).unwrap();

      setShowCloseAllOrdersModal(false);
      toast.success(t("orders_closed_successfully"));
      refetch();
      refetchReconciliationStats();
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message;
      toast.error(errorMessage || t("close_orders_failed"));
    }
  };

  return {
    userRole,
    selectedOrder,
    setSelectedOrder,
    showOrderDetails,
    setShowOrderDetails,
    showDisputeModal,
    setShowDisputeModal,
    isReopenDisputeFlow,
    setIsReopenDisputeFlow,
    showCancelModal,
    setShowCancelModal,
    showAdminDisputeModal,
    setShowAdminDisputeModal,
    showCloseAllOrdersModal,
    setShowCloseAllOrdersModal,
    showBulkCompleteConfirm,
    setShowBulkCompleteConfirm,
    detailsOrderId,
    selectedItems,
    setSelectedItems,
    reopenFetchingId,
    isDetailsLoading,
    isBulkCompleting,
    isClosingAllOrders,
    isFetchingSweepPreview,
    isSweepPreviewError,
    sweepPreviewErrorMessage,
    finalizeSweepPreview,
    displayedOrder,
    closeAllOrdersTargetMonthLabel,
    closeDetails,
    handleOpenDispute,
    handleReopenDispute,
    handleReopenFromRow,
    handleSubmitReopenDispute,
    handleSubmitDispute,
    handleCancelOrder,
    handleSubmitCancel,
    handleViewDetails,
    handleApproveDispute,
    handleAdminResolveDispute,
    handleBulkMarkOrderCompleted,
    handleCloseAllOrders,
  };
}
