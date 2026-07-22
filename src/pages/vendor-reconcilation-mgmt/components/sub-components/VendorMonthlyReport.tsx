import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import OrderDetailsModal from "./OrderDetailsModal";
import DisputeModal from "./DisputeModal";
import CancelOrderModal from "./CancelOrderModal";
import CloseAllOrdersModal from "./CloseAllOrdersModal";
import { AdminDisputeResponseModal } from "./AdminDisputeReponseModal";
import ExportOrdersButton from "../ExportOrdersButton";
import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useCreateSignedUrlMutation } from "@/store/api/mediaMutationApi";
import { useGetAllWebsitesQuery } from "@/store/api/websiteConfigApi";
import { uploadWithProgress } from "@/helpers";
import {
  useGetOrderProductsQuery,
  useGetOrderProductDetailsQuery,
  useCancelOrderProductMutation,
  useOpenDisputeMutation,
  // useRespondDisputeMutation,
  // useBulkApproveOrderProductsMutation,
  useGetReconciliationStatsQuery,
  useBulkMarkOrderAsCompletedMutation,
  useFinalizeClosedOrdersMutation,
  usePreviewFinalizeClosedOrdersQuery,
} from "@/store/api/reconciliationQueryApi";
import { useLazyGetBusinessForProductQuery } from "@/store/api/businessQueryApi";
import SearchInput from "@/components/shared/SearchInput";
import {
  ReordableDataTable,
  FilterChips,
  ImageWithFallback,
} from "@/components/shared";
import MonthFilter from "@/pages/orders-mgmt/components/MonthFilter";
import FilterButton from "@/components/btns/FilterButton";
import clsx from "clsx";

interface OrderProduct {
  _id: string;
  orderId: string;
  productInformation: {
    _id: string;
    name: string;
    image: string;
    category: { _id: string; name: string };
  };
  orderInformation: {
    orderId: string;
    purchaseDate: string;
    status: "pending" | "shipped" | "canceled" | "processing" | "completed";
    quantity: number;
    unitPrice: number;
    total: number;
    platformFee: number;
    disputeId?: string;
    reconciliationStatus?:
    | "pending"
    | "approved"
    | "canceled"
    | "disputed"
    | "rejected"
    | "closed";
    rejectedReason?: string;
  };
  customerInformation: {
    name: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
  };
  deliveryInformation: {
    deliveryMethod: string;
    address: {
      houseNo?: string;
      apartment?: string;
      street?: string;
      city?: string;
    };
    specialInstructions?: string;
  };
  paymentInformation: {
    paymentMethod: string[];
    paymentStatus: string;
    totalAmount: number;
  };
  vendorInformation: {
    _id: string;
    name: string;
  };
}

function mapOrderProductList(d: any) {
  const customerName =
    [d.customer?.firstName, d.customer?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || "";

  return {
    _id: d._id,
    orderId: d.orderId,
    productName: d.product?.name || "",
    productImage: d.product?.image?.image || "",
    productCategory: "",
    customerName,
    customerEmail: d.customer?.email || "",
    customerPhone: d.customer?.phone || "",
    purchaseDate: d.createdAt || "",
    quantity: d.quantity || 0,
    unitPrice: d.price || 0,
    totalPrice: d.totalAmount || 0,
    platformFee: d.fee || 0,
    netToVendor: (d.totalAmount || 0) - (d.fee || 0),
    status: d.status,
    reconciliationStatus: d.reconciliationStatus,
    paymentStatus: d.reconciliationStatus || "",
    externalApiId: d.externalApiId || "",

    paymentMethod: "",
    deliveryMethod: "",
    deliveryAddress: "",
    specialInstructions: "",
    disputeId: d.disputeId,
  };
}
function mapOrderProductDetails(d: OrderProduct & { _id?: string }) {
  const address = [
    d.deliveryInformation?.address?.houseNo,
    d.deliveryInformation?.address?.apartment,
    d.deliveryInformation?.address?.street,
    d.deliveryInformation?.address?.city,
  ]
    .filter(Boolean)
    .join(", ");

  const status =
    d.orderInformation?.status === "completed"
      ? "completed"
      : d.orderInformation?.status === "processing"
        ? "processing"
        : d.orderInformation?.status;

  // Use reconciliationStatus from API response, fallback to status if not available
  const reconciliationStatus =
    d?.orderInformation?.reconciliationStatus || status;

  return {
    _id: d._id,
    orderId: d.orderId,
    productName: d?.productInformation?.name || "",
    productImage: d?.productInformation?.image || "",
    productCategory: d?.productInformation?.category?.name || "",
    customerName: d?.customerInformation?.name?.trim() || "",
    customerEmail: d?.customerInformation?.email || "",
    customerPhone: d?.customerInformation?.phone || "",
    purchaseDate: d?.orderInformation?.purchaseDate || "",
    quantity: d?.orderInformation?.quantity || 0,
    unitPrice: d?.orderInformation?.unitPrice || 0,
    totalPrice: d?.orderInformation?.total || 0,
    platformFee: d?.orderInformation?.platformFee || 0,
    rejectedReason: d?.orderInformation?.rejectedReason || "",

    netToVendor:
      (d?.orderInformation?.total || 0) - (d?.orderInformation?.platformFee || 0),
    status,
    reconciliationStatus,
    externalApiId: (d as any).externalApiId || "",
    paymentMethod: d?.paymentInformation?.paymentMethod?.join(", ") || "",
    paymentStatus: d?.paymentInformation?.paymentStatus || "",
    deliveryMethod: d?.deliveryInformation?.deliveryMethod || "",
    deliveryAddress: address,
    specialInstructions: d?.deliveryInformation?.specialInstructions || "",
    disputeId: d.orderInformation?.disputeId,
  };
}

export type MonthlyOrder = ReturnType<typeof mapOrderProductList> & {
  disputeId?: string;
};

export const VendorMonthlyReport = () => {
  const { t } = useTranslation("reconciliation");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    bgPrimary,
    bgSecondary,
    textPrimary,
    borderColor,
    textSecondary,
    textTertiary,
    isDark,
  } = useThemeClasses();
  const { dmoId, authorityId, userRole } = useAppSelector(
    (state) => state.auth,
  );
  const adminView = userRole === "superadmin";

  const businessSearchDebounceRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [orders, setOrders] = useState<MonthlyOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<MonthlyOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAdminDisputeModal, setShowAdminDisputeModal] = useState(false);
  const [showCloseAllOrdersModal, setShowCloseAllOrdersModal] = useState(false);
  const [detailsOrderId, setDetailsOrderId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [_disputedCount, setDisputedCount] = useState(0);

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "all",
    reconciliationStatus: "all",
    startDate: "",
    endDate: "",
    month: "all",
    businessId: "",
  });
  const [businessSearch, setBusinessSearch] = useState("");
  const [businesses, setBusinesses] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const [isSearchingBusinesses, setIsSearchingBusinesses] = useState(false);
  const [selectedBusinessName, setSelectedBusinessName] = useState("");
  const isLoadingNextPageRef = useRef(false);
  const [searchBusinessesTrigger] = useLazyGetBusinessForProductQuery();

  const apiParams = useMemo(() => {
    const params: any = {
      page,
      limit: 20,
      dmoId,
      authorityId,
    };

    if (filters.businessId) params.vendorId = filters.businessId;
    if (filters.status !== "all") {
      params.status = filters.status;
    }
    if (filters.reconciliationStatus !== "all") {
      params.reconciliationStatus = filters.reconciliationStatus;
    }

    if (searchTerm) params.search = searchTerm;

    if (filters.month !== "all" && filters.month !== "custom") {
      const [month, year] = filters.month.split("-");

      // format from the Date's own local year/month/day, not
      // toISOString() - that converts to UTC first, which silently shifts
      // the date back a day for any timezone ahead of UTC (midnight local
      // time is still "yesterday evening" in UTC)
      const formatLocalDate = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };

      const firstDay = new Date(Number(year), Number(month) - 1, 1);
      const lastDay = new Date(Number(year), Number(month), 0);

      params.startDate = formatLocalDate(firstDay);
      params.endDate = formatLocalDate(lastDay);
    }

    // Custom date range
    if (filters.month === "custom") {
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
    }
    return params;
  }, [page, filters, searchTerm, dmoId, authorityId]);

  const {
    data: orderProductsData,
    isLoading,
    refetch: refetchOrders,
  } = useGetOrderProductsQuery(apiParams);
  const { data: orderDetailsData, isFetching: isDetailsLoading } =
    useGetOrderProductDetailsQuery(detailsOrderId as string, {
      skip: !detailsOrderId,
    });
  const [cancelOrderProduct] = useCancelOrderProductMutation();
  const [openDispute] = useOpenDisputeMutation();
  // const [respondDispute] = useRespondDisputeMutation();
  const [createSignedUrl] = useCreateSignedUrlMutation();
  const [bulkMarkOrderAsCompleted] = useBulkMarkOrderAsCompletedMutation();
  // const [bulkApproveOrderProducts] = useBulkApproveOrderProductsMutation();
  const [finalizeClosedOrders, { isLoading: isClosingAllOrders }] =
    useFinalizeClosedOrdersMutation();
  // only fetched while the confirmation modal is actually open - no point
  // hitting this on every page load
  const {
    data: finalizeSweepPreview,
    isFetching: isFetchingSweepPreview,
    isError: isSweepPreviewError,
  } = usePreviewFinalizeClosedOrdersQuery(undefined, {
    skip: !showCloseAllOrdersModal,
  });
  const { data: reconciliationStats, refetch: refetchReconciliationStats } =
    useGetReconciliationStatsQuery();
  const { data: allWebsites } = useGetAllWebsitesQuery();

  const websiteMap = useMemo(() => {
    if (!allWebsites) return {} as Record<string, any>;
    return allWebsites.reduce(
      (map, w) => {
        map[w._id] = w;
        return map;
      },
      {} as Record<string, any>,
    );
  }, [allWebsites]);

  const displayedOrder = useMemo(() => {
    if (orderDetailsData && detailsOrderId === selectedOrder?._id) {
      return mapOrderProductDetails(orderDetailsData);
    }
    // Handle case when navigating from URL with orderProductId
    if (orderDetailsData && detailsOrderId && !selectedOrder) {
      return mapOrderProductDetails(orderDetailsData);
    }
    return selectedOrder;
  }, [orderDetailsData, detailsOrderId, selectedOrder]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.status !== "all" ||
      filters.reconciliationStatus !== "all" ||
      filters.businessId !== "" ||
      filters.month !== "all" ||
      filters.startDate !== "" ||
      filters.endDate !== ""
    );
  }, [filters]);

  const handleClearAllFilters = () => {
    setFilters({
      status: "all",
      reconciliationStatus: "all",
      startDate: "",
      endDate: "",
      month: "all",
      businessId: "",
    });
    setSelectedBusinessName("");
    setBusinessSearch("");
    fetchDefaultBusinesses();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchDefaultBusinesses = useCallback(async () => {
    try {
      setIsSearchingBusinesses(true);
      const result = await searchBusinessesTrigger({
        search: "",
        locale: "en" as any,
        limit: 10,
      });
      if (result.data?.data) {
        setBusinesses(result.data.data);
      }
    } catch (error) {
      console.error("Error fetching default businesses:", error);
      setBusinesses([]);
    } finally {
      setIsSearchingBusinesses(false);
    }
  }, []);

  const searchBusinesses = (search: string) => {
    setBusinessSearch(search);

    if (businessSearchDebounceRef.current) {
      clearTimeout(businessSearchDebounceRef.current);
    }

    if (!search.trim()) {
      // Back to empty input -> show default list again
      fetchDefaultBusinesses();
      return;
    }

    businessSearchDebounceRef.current = setTimeout(async () => {
      try {
        setIsSearchingBusinesses(true);
        const result = await searchBusinessesTrigger({
          search,
          locale: "en" as any,
          limit: 10,
        });
        if (result.data?.data) {
          setBusinesses(result.data.data);
        }
      } catch (error) {
        console.error("Error searching businesses:", error);
        setBusinesses([]);
      } finally {
        setIsSearchingBusinesses(false);
      }
    }, 400);
  };
  useEffect(() => {
    fetchDefaultBusinesses();
  }, [fetchDefaultBusinesses]);
  useEffect(() => {
    return () => {
      if (businessSearchDebounceRef.current) {
        clearTimeout(businessSearchDebounceRef.current);
      }
    };
  }, []);

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

  useEffect(() => {
    if (orderProductsData?.data) {
      const mappedOrders = orderProductsData.data.map(mapOrderProductList);

      if (page === 1) {
        setOrders(mappedOrders);
      } else {
        setOrders((prev) => {
          const existingIds = new Set(prev.map((o: MonthlyOrder) => o._id));
          const newOrders = mappedOrders.filter(
            (o: MonthlyOrder) => !existingIds.has(o._id),
          );
          return [...prev, ...newOrders];
        });
      }
    }
  }, [orderProductsData, page]);

  const hasMore = orderProductsData?.meta?.hasNextPage ?? false;

  const loadNextPage = () => {
    if (!hasMore || isLoading || isLoadingNextPageRef.current) return;
    isLoadingNextPageRef.current = true;
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    isLoadingNextPageRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    filters.status,
    filters.reconciliationStatus,
    filters.month,
    filters.startDate,
    filters.endDate,
    filters.businessId,
  ]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".business-search-container")) {
        setShowBusinessDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const stats = useMemo(() => {
    if (!reconciliationStats) {
      return {
        pending: 0,
        approved: 0,
        disputed: 0,
        cancelled: 0,
        totalOrders: 0,
        totalRevenue: 0,
        netPayout: 0,
        heldForDisputes: 0,
        orderProductPending: 0,
        orderProductProcessing: 0,
        orderProductShipped: 0,
      };
    }

    const disputed = reconciliationStats.statusOverview?.disputed || 0;

    return {
      pending: reconciliationStats.statusOverview?.pending || 0,
      approved: reconciliationStats.statusOverview?.approved || 0,
      disputed,
      cancelled: reconciliationStats.statusOverview?.cancelled || 0,
      totalOrders: reconciliationStats.totalOrders || 0,
      totalRevenue: reconciliationStats.totalRevenue || 0,
      netPayout: reconciliationStats.netPayout || 0,
      heldForDisputes: 0,
      orderProductPending:
        reconciliationStats.orderProductOverview?.pending || 0,
      orderProductProcessing:
        reconciliationStats.orderProductOverview?.processing || 0,
      orderProductShipped:
        reconciliationStats.orderProductOverview?.shipped || 0,
    };
  }, [reconciliationStats]);

  useEffect(() => {
    if (reconciliationStats) {
      setDisputedCount(reconciliationStats.statusOverview?.disputed || 0);
    }
  }, [reconciliationStats]);

  const handleOpenDispute = (order: MonthlyOrder) => {
    if (userRole !== "traveller") {
      toast.error(t("only_traveller_can_open_disputes"));
      return;
    }
    setSelectedOrder(order);
    setShowDisputeModal(true);
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

          await uploadWithProgress(file, signedUrl, () => { });
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
      setSelectedOrder(null);
      refetchOrders();
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

  // const handleApprove = async (order: MonthlyOrder) => {
  //   try {
  //     if (!order._id || !order.disputeId) {
  //       toast.error(t("invalid_order_data"));
  //       return;
  //     }

  //     // Use actual disputeId from order data
  //     await respondDispute({
  //       disputeId: order.disputeId,
  //       action: "accept",
  //       internalNotes: "Approved by admin",
  //       vendorFacingResponse:
  //         "Your dispute has been accepted. Refund will be processed.",
  //     }).unwrap();

  //     toast.success(t("order_approved"));
  //     refetchOrders();
  //     refetchReconciliationStats();
  //   } catch (error: any) {
  //     const errorMessage = error?.data?.message || error?.message;
  //     toast.error(errorMessage || t("approve_failed"));
  //     console.error("Approve error:", error);
  //   }
  // };

  // const handleReject = async (order: MonthlyOrder) => {
  //   try {
  //     if (!order._id || !order.disputeId) {
  //       toast.error(t("invalid_order_data"));
  //       return;
  //     }

  //     // Use actual disputeId from order data
  //     await respondDispute({
  //       disputeId: order.disputeId,
  //       action: "reject",
  //       internalNotes: "Rejected by admin",
  //       vendorFacingResponse: "Your dispute has been rejected.",
  //     }).unwrap();

  //     toast.success(t("status_updated"));
  //     refetchOrders();
  //     refetchReconciliationStats();
  //   } catch (error: any) {
  //     const errorMessage = error?.data?.message || error?.message;
  //     toast.error(errorMessage || t("approve_failed"));
  //     console.error("Update error:", error);
  //   }
  // };

  const handleCancelOrder = (order: MonthlyOrder) => {
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
      setSelectedOrder(null);
      refetchOrders();
      refetchReconciliationStats();
    } catch (error) {
      toast.error(t("cancel_failed"));
    }
  };

  const handleViewDetails = (order: MonthlyOrder) => {
    setSelectedOrder(order);
    setDetailsOrderId(order._id);
    setShowOrderDetails(true);
  };

  const handleApproveDispute = (order: MonthlyOrder) => {
    setSelectedOrder(order);
    setDetailsOrderId(order._id);
    setShowAdminDisputeModal(true);
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

  const handleAdminResolveDispute = () => {
    toast.success(t("dispute_resolved"));
    setShowAdminDisputeModal(false);
    setSelectedOrder(null);
    setDetailsOrderId(null);
    refetchOrders();
  };

  const handleSelectionChange = (newSelection: Set<string>) => {
    const disputedOrders = new Set<string>();
    newSelection.forEach((id) => {
      const order = orders.find((o) => o._id === id);
      if (order?.reconciliationStatus === "disputed") {
        disputedOrders.add(id);
      }
    });
    setSelectedItems(disputedOrders);
  };

  // const handleBulkApprove = async () => {
  //   try {
  //     await bulkApproveOrderProducts({
  //       approveAllDisputed: true,
  //     }).unwrap();

  //     toast.success(t("order_approved"));
  //     setSelectedItems(new Set());
  //     refetchOrders();
  //     refetchReconciliationStats();
  //   } catch (error: any) {
  //     const errorMessage = error?.data?.message || error?.message;
  //     toast.error(errorMessage || t("approve_failed"));
  //   }
  // };

  const handleBulkMarkOrderCompleted = async () => {
    try {
      await bulkMarkOrderAsCompleted({
        markAllAsCompleted: true,
      }).unwrap();

      toast.success(t("orders_mark_as_completed"));
      setSelectedItems(new Set());
      refetchOrders();
      refetchReconciliationStats();
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message;
      toast.error(errorMessage || t("approve_failed"));
    }
  };

  // Prefer the backend's own authoritative targetMonth (computed in
  // Asia/Jerusalem time, same as the actual finalize call) once the preview
  // loads - the client-side "last calendar month" guess below is only a
  // placeholder shown for the brief moment before that response arrives,
  // since the browser's local clock/timezone can disagree with the server
  // near a month boundary or under clock skew, and this label is what the
  // CFO confirms against.
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
      refetchOrders();
      refetchReconciliationStats();
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message;
      toast.error(errorMessage || t("close_orders_failed"));
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<
      string,
      { bg: string; text: string; icon: any; label: string }
    > = {
      pending: {
        bg: isDark ? "bg-yellow-900/20" : "bg-yellow-100",
        text: isDark ? "text-yellow-400" : "text-yellow-800",
        icon: Clock,
        label: t("pending"),
      },
      processing: {
        bg: isDark ? "bg-yellow-900/20" : "bg-yellow-100",
        text: isDark ? "text-yellow-400" : "text-yellow-800",
        icon: Clock,
        label: t("processing"),
      },
      approved: {
        bg: isDark ? "bg-green-900/20" : "bg-green-100",
        text: isDark ? "text-green-400" : "text-green-800",
        icon: CheckCircle,
        label: t("approved"),
      },
      completed: {
        bg: isDark ? "bg-green-900/20" : "bg-green-100",
        text: isDark ? "text-green-400" : "text-green-800",
        icon: CheckCircle,
        label: t("completed"),
      },
      disputed: {
        bg: isDark ? "bg-orange-900/20" : "bg-orange-100",
        text: isDark ? "text-orange-400" : "text-orange-800",
        icon: AlertTriangle,
        label: t("disputed"),
      },
      canceled: {
        bg: isDark ? "bg-red-900/20" : "bg-red-100",
        text: isDark ? "text-red-400" : "text-red-800",
        icon: XCircle,
        label: t("canceled"),
      },
      rejected: {
        bg: isDark ? "bg-red-900/20" : "bg-red-100",
        text: isDark ? "text-red-400" : "text-red-800",
        icon: XCircle,
        label: t("rejected"),
      },
    };

    const badge = badges[status] || badges.pending || badges.processing;
    if (!badge) {
      return <span>{status}</span>;
    }
    const Icon = badge.icon;

    return (
      <span
        className={clsx(
          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
          badge.bg,
          badge.text,
        )}
      >
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const formatCurrency = (amount?: number) => {
    if (amount === null || amount === undefined) return "-";
    return `₪${amount.toLocaleString()}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns = [
    {
      key: "product",
      sortable: false,
      label: t("product"),
      minWidth: 200,
      render: (order: MonthlyOrder) => (
        <div className="flex items-center gap-4 min-w-[200px]">
          <ImageWithFallback
            src={order.productImage}
            alt={order.productName}
            className="w-12 h-12 rounded-lg object-cover shrink-0"
          />
          <div className="min-w-0">
            <div className={`font-medium text-base ${textPrimary} truncate`}>
              {order.productName}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      sortable: false,
      label: t("customer"),
      render: (order: MonthlyOrder) => (
        <div>
          <div className={`font-medium ${textPrimary}`}>
            {order.customerName}
          </div>
          <div className={`text-xs ${textTertiary}`}>{order.customerEmail}</div>
        </div>
      ),
    },
    {
      key: "purchaseDate",
      sortable: true,
      label: t("date"),
      render: (order: MonthlyOrder) => (
        <span className={textSecondary}>{formatDate(order.purchaseDate)}</span>
      ),
    },
    {
      key: "quantity",
      sortable: true,
      label: t("quantity"),
      render: (order: MonthlyOrder) => (
        <span className={textSecondary}>{order.quantity}</span>
      ),
    },
    {
      key: "totalPrice",
      sortable: true,
      label: t("price"),
      render: (order: MonthlyOrder) => (
        <div>
          <div className={`font-medium ${textPrimary}`}>
            {formatCurrency(order.totalPrice)}
          </div>
          <div className={`text-xs ${textTertiary}`}>
            {t("fee")}: {formatCurrency(order.platformFee)}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      sortable: false,
      label: t("order_status"),
      render: (order: MonthlyOrder) => getStatusBadge(order.status),
    },
    {
      key: "reconciliationStatus",
      sortable: false,
      label: t("reconciliation_status"),
      render: (order: MonthlyOrder) =>
        getStatusBadge(order.reconciliationStatus),
    },
    {
      key: "externalApiId",
      sortable: false,
      label: t("website"),
      render: (order: MonthlyOrder) => {
        const website = websiteMap[order.externalApiId ?? ""];
        if (!website)
          return <span className={`text-sm ${textTertiary}`}>-</span>;
        return (
          <div className="flex items-center gap-1.5">
            {website.logoUrl && (
              <img
                src={website.logoUrl}
                alt={website.websiteName}
                className="w-5 h-5 object-contain rounded"
              />
            )}
            <span className="text-sm">{website.websiteName}</span>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: t("actions"),
      render: (order: MonthlyOrder) => (
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {order.status !== "canceled" &&
            order.reconciliationStatus !== "approved" &&
            order.reconciliationStatus !== "disputed" &&
            order.reconciliationStatus !== "rejected" &&
            userRole === "traveller" && (
              <button
                onClick={() => handleOpenDispute(order)}
                className="p-1.5 rounded text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                title={t("dispute")}
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            )}
          {order.reconciliationStatus === "disputed" && adminView && (
            <button
              onClick={() => handleApproveDispute(order)}
              className="p-1.5 rounded-full text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              title={t("approve")}
            >
              <CheckCircle className="w-5 h-5" />
            </button>
          )}
          {order.status !== "canceled" &&
            order.reconciliationStatus !== "disputed" &&
            order.reconciliationStatus !== "approved" &&
            order.reconciliationStatus !== "rejected" &&
            order.status !== "completed" && (
              <button
                onClick={() => handleCancelOrder(order)}
                className="p-1.5 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title={t("cancel")}
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
        </div>
      ),
    },
  ];

  if (isLoading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className={textSecondary}>{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className={`${bgPrimary} rounded-lg border ${borderColor} p-6 mb-6`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary} mb-1`}>
              {t("vendor_reconciliation")}
            </h1>
            <p className={textTertiary}>{t("review_and_approve_orders")}</p>
          </div>
          {adminView && (
            <button
              onClick={() => setShowCloseAllOrdersModal(true)}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              {t("close_all_orders")}
            </button>
          )}
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className={`${bgPrimary} rounded-lg border ${borderColor} p-6 mb-6`}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
          <div className={`${bgSecondary} rounded-lg p-4`}>
            <div className={`text-xs ${textTertiary} mb-1`}>
              {t("total_orders")}
            </div>
            <div className={`text-2xl font-bold ${textPrimary}`}>
              {stats.totalOrders}
            </div>
          </div>
          <div className={`${bgSecondary} rounded-lg p-4`}>
            <div className={`text-xs ${textTertiary} mb-1`}>
              {t("total_revenue")}
            </div>
            <div className={`text-2xl font-bold ${textPrimary}`}>
              ₪{(stats.totalRevenue || 0).toLocaleString()}
            </div>
          </div>

          <div className={`${bgSecondary} rounded-lg p-4`}>
            <div className={`text-xs ${textTertiary} mb-1`}>
              {t("net_payout")}
            </div>
            <div
              className={`text-2xl font-bold text-green-600 dark:text-green-400`}
            >
              ₪{(stats.netPayout || 0).toLocaleString()}
            </div>
          </div>
          <div className={`${bgSecondary} rounded-lg p-4 col-span-2`}>
            <div className={`text-xs ${textTertiary} mb-2`}>
              {t("status_overview")}
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className={textSecondary}>
                  {stats.pending} {t("pending")}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className={textSecondary}>
                  {stats.approved} {t("approved")}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className={textSecondary}>
                  {stats.disputed} {t("disputed")}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className={textSecondary}>
                  {stats.cancelled} {t("canceled")}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`$ p-4 mb-6`}>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 w-full min-w-0">
            <SearchInput
              placeholder={t("search_by_order")}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              storageKey="vendorReconSearchTerm"
            />
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            {/* {disputedCount > 0 && adminView && (
              <button
                onClick={handleBulkApprove}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {t("approve_disputed_orders")}
              </button>
            )} */}

            {(stats.orderProductPending > 0 ||
              stats.orderProductProcessing > 0 ||
              stats.orderProductShipped > 0) && (
                <button
                  onClick={handleBulkMarkOrderCompleted}
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {t("approve_pending_orders")}
                </button>
              )}

            <ExportOrdersButton
              orders={orders}
              selectedOrders={selectedItems}
              t={t}
            />
            <FilterButton value={showFilters} onChange={setShowFilters} />
          </div>
        </div>

        {showFilters && (
          <div
            className={`mt-4 pt-4 border-t ${borderColor} grid grid-cols-1 md:grid-cols-3 gap-4`}
          >
            <div>
              <label className={`block text-xs ${textTertiary} mb-1`}>
                {t("order_status")}
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} text-sm`}
              >
                <option value="all">{t("all_statuses")}</option>
                <option value="pending">{t("pending")}</option>
                <option value="processing">{t("processing")}</option>
                <option value="shipped">{t("shipped")}</option>
                <option value="completed">{t("completed")}</option>
                <option value="cancelled">{t("canceled")}</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs ${textTertiary} mb-1`}>
                {t("reconciliation_status")}
              </label>
              <select
                value={filters.reconciliationStatus}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    reconciliationStatus: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} text-sm`}
              >
                <option value="all">{t("all_statuses")}</option>
                <option value="pending">{t("pending")}</option>
                <option value="approved">{t("approved")}</option>
                <option value="disputed">{t("disputed")}</option>
                <option value="rejected">{t("rejected")}</option>
                <option value="closed">{t("closed")}</option>
              </select>
            </div>

            <div className="relative business-search-container">
              <label className={`block text-xs ${textTertiary} mb-1`}>
                {t("vendor_business")}
              </label>
              <input
                type="text"
                placeholder={
                  filters.businessId
                    ? t("selected_vendor")
                    : t("search_vendors")
                }
                value={businessSearch}
                onChange={(e) => searchBusinesses(e.target.value)}
                onFocus={() => {
                  if (!filters.businessId && !showBusinessDropdown) {
                    setShowBusinessDropdown(true);
                  }
                }}
                className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgPrimary} ${textPrimary} text-sm`}
              />
              {(showBusinessDropdown || businessSearch) && (
                <div
                  className={`absolute top-full left-0 right-0 mt-1 border ${borderColor} rounded-lg ${bgSecondary} shadow-lg z-50 max-h-48 overflow-y-auto`}
                >
                  {isSearchingBusinesses ? (
                    <div className={`p-2 text-center text-sm ${textTertiary}`}>
                      {t("loading")}
                    </div>
                  ) : businesses.length > 0 ? (
                    businesses.map((business) => (
                      <button
                        key={business._id}
                        onClick={() => {
                          setFilters({ ...filters, businessId: business._id });
                          setSelectedBusinessName(business.name);
                          setShowBusinessDropdown(false);
                          setBusinessSearch("");
                          setBusinesses([]);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors ${textPrimary}`}
                      >
                        {business.name}
                      </button>
                    ))
                  ) : (
                    <div className={`p-2 text-center text-sm ${textTertiary}`}>
                      {t("no_businesses_found")}
                    </div>
                  )}
                </div>
              )}
            </div>

            <MonthFilter
              label={t("month")}
              value={filters.month}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, month: value }))
              }
              dateFrom={filters.startDate}
              dateTo={filters.endDate}
              onDateFromChange={(value) =>
                setFilters((prev) => ({ ...prev, startDate: value }))
              }
              onDateToChange={(value) =>
                setFilters((prev) => ({ ...prev, endDate: value }))
              }
              t={t}
            />

            {hasActiveFilters && (
              <div className="col-span-full w-full">
                <div className="flex flex-wrap gap-1.5 items-center pt-2">
                  {filters.status !== "all" && (
                    <FilterChips
                      label={t(filters.status)}
                      onRemove={() => setFilters({ ...filters, status: "all" })}
                    />
                  )}
                  {filters.reconciliationStatus !== "all" && (
                    <FilterChips
                      label={t(filters.reconciliationStatus)}
                      onRemove={() =>
                        setFilters({ ...filters, reconciliationStatus: "all" })
                      }
                    />
                  )}
                  {filters.businessId && (
                    <FilterChips
                      label={selectedBusinessName || filters.businessId}
                      onRemove={() => {
                        setFilters({ ...filters, businessId: "" });
                        setSelectedBusinessName("");
                        setBusinessSearch("");
                        fetchDefaultBusinesses();
                      }}
                    />
                  )}
                  {filters.month !== "all" && filters.month !== "custom" && (
                    <FilterChips
                      label={filters.month}
                      onRemove={() => setFilters({ ...filters, month: "all" })}
                    />
                  )}
                  {filters.month === "custom" && filters.startDate && (
                    <FilterChips
                      label={`From: ${filters.startDate}`}
                      onRemove={() => setFilters({ ...filters, startDate: "" })}
                    />
                  )}
                  {filters.month === "custom" && filters.endDate && (
                    <FilterChips
                      label={`To: ${filters.endDate}`}
                      onRemove={() => setFilters({ ...filters, endDate: "" })}
                    />
                  )}

                  {hasActiveFilters && (
                    <button
                      onClick={handleClearAllFilters}
                      className="px-2.5 py-1 bg-red-500/20 text-red-500 rounded-full text-xs hover:bg-red-500/30 transition-colors shrink-0"
                    >
                      {t("clear_filters")}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Orders Table */}
      <ReordableDataTable
        rowKey="_id"
        data={orders}
        isDataLoading={isLoading}
        onRowClick={(order: MonthlyOrder) => handleViewDetails(order)}
        storageKey="vendorMonthlyReportColumnOrder"
        columns={columns}
        hasMore={hasMore}
        next={loadNextPage}
        selectedItems={adminView ? selectedItems : undefined}
        onSelectionChange={adminView ? handleSelectionChange : undefined}
      />

      {/* Modals */}
      {showOrderDetails && displayedOrder && (
        <OrderDetailsModal
          order={displayedOrder}
          loading={isDetailsLoading}
          onClose={closeDetails}
          onDispute={() => {
            setShowOrderDetails(false);
            setShowDisputeModal(true);
          }}
          onCancel={() => {
            setShowOrderDetails(false);
            setShowCancelModal(true);
          }}
          // onApprove={() => {
          //   if (displayedOrder.reconciliationStatus === "disputed") {
          //     setShowOrderDetails(false);
          //     setShowAdminDisputeModal(true);
          //   } else {
          //     handleApprove(displayedOrder);
          //     closeDetails();
          //   }
          // }}
          // onReject={() => {
          //   if (displayedOrder.reconciliationStatus === "disputed") {
          //     setShowOrderDetails(false);
          //     setShowAdminDisputeModal(true);
          //   } else {
          //     handleReject(displayedOrder);
          //     closeDetails();
          //   }
          // }}
          adminView={adminView}
        />
      )}

      {showDisputeModal && selectedOrder && (
        <DisputeModal
          order={selectedOrder}
          onClose={() => {
            setShowDisputeModal(false);
            setSelectedOrder(null);
          }}
          onSubmit={handleSubmitDispute}
        />
      )}

      {showCancelModal && selectedOrder && (
        <CancelOrderModal
          order={selectedOrder}
          // loading={isCancelling}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedOrder(null);
          }}
          onSubmit={handleSubmitCancel}
        />
      )}

      {showAdminDisputeModal && displayedOrder && (
        <AdminDisputeResponseModal
          order={displayedOrder}
          disputeId={displayedOrder.disputeId}
          // loading={isDetailsLoading}
          onClose={() => {
            setShowAdminDisputeModal(false);
            setSelectedOrder(null);
            setDetailsOrderId(null);
            closeDetails()
          }}
          onResolve={handleAdminResolveDispute}
        />
      )}

      {showCloseAllOrdersModal && (
        <CloseAllOrdersModal
          targetMonthLabel={closeAllOrdersTargetMonthLabel}
          sweptMonths={finalizeSweepPreview?.sweptMonths ?? []}
          isLoadingPreview={isFetchingSweepPreview}
          hasPreviewError={isSweepPreviewError}
          isConfirming={isClosingAllOrders}
          onClose={() => setShowCloseAllOrdersModal(false)}
          onConfirm={handleCloseAllOrders}
        />
      )}
    </div>
  );
};
