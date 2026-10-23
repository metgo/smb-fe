import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export interface CancelOrderProductRequest {
  orderId: string;
  orderProductId: string;
  cancelReason: string;
  additionalInfo?: string;
  sendEmail?: boolean;
}

export interface ApproveOrderProductRequest {
  orderId: string;
  orderProductId: string;
}

export interface OpenDisputeRequest {
  orderId: string;
  reason: string;
  description: string;
  attachments: string[];
}

export interface RespondDisputeRequest {
  disputeId: string;
  action: string;
  vendorFacingResponse: string;
}

export interface ReopenDisputeRequest {
  disputeId: string;
  reason: string;
  description: string;
  attachments: string[];
}

export interface BulkApproveOrderProductsRequest {
  approveAllDisputed: boolean;
}

export interface BulkMarkAsCompletedRequest {
  markAllAsCompleted: boolean;
  vendorId?: string;
  externalApiId?: string;
  dmoId?: string;
  authorityId?: string;
  startDate?: string;
  endDate?: string;
}

export interface FinalizeClosedOrdersRequest {
  confirmFinalize: boolean;
  year?: number;
  month?: number;
}

export interface FinalizeClosedOrdersResponse {
  finalized: number;
  carriedOver: number;
  sweptMonths: string[];
}

export interface FinalizeSweepPreview {
  targetMonth: string;
  sweptMonths: { label: string; payoutAmount: number }[];
  canFinalize: boolean;
}

export interface ReconciliationStatsParams {
  dmoId?: string;
  authorityId?: string;
  status?: string;
  reconciliationStatus?: string;
  vendorId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface VendorPaymentSummaryParams {
  startDate?: string;
  endDate?: string;
  year?: number;
  month?: number;
  vendorId?: string;
  dmoId?: string;
  authorityId?: string;
  externalApiId?: string;
  search?: string;
  sortBy?: "totalAmount" | "netPayment" | "totalOrders" | "vendorName";
  sortOrder?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

export interface VendorPaymentSummaryRow {
  owner_info: {
    _id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  vendor_info: {
    _id: string;
    name: string | null;
    nameHe: string | null;
    nameAr: string | null;
    businessLogo: { image: string; alt: string } | null;
    phone: string | null;
  };
  bankDetails: {
    _id: string;
    name: string;
    bankNumber: string;
    branchNumber: string;
    accountNumber: string;
    businessNumberByGovt: string;
  } | null;
  hasBankDetails: boolean;
  orderSummary: {
    totalCount: number;
    pendingCount: number;
    processingCount: number;
    shippedCount: number;
    completedCount: number;
    canceledCount: number;
  };
  reconciliationSummary: {
    pendingCount: number;
    approvedCount: number;
    cancelledCount: number;
    rejectedCount: number;
    closedCount: number;
    disputedCount: number;
    pausedCount: number;
  };
  amount: {
    total: number;
    netPayment: number;
    deliveryFee: number;
    platformCharge: number;
    itemsAmount: number;
  };
  platform: Array<{ _id: string; websiteName: string }>;
}

export interface VendorPaymentSummaryResponse {
  data: VendorPaymentSummaryRow[];
  totalData: number;
  overview: {
    totalVendors: number;
    totalRevenue: number;
    totalNetPayment: number;
    totalDeliveryFee: number;
    totalPlatformCharge: number;
  };
  meta: {
    page: number;
    limit: number;
    data: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export const reconciliationQueryApi = createApi({
  reducerPath: "reconciliationQueryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Reconciliation"],
  endpoints: (builder) => ({
    getOrderProducts: builder.query<any, any>({
      query: (params) => ({
        url: endpoints.orderProducts,
        method: "GET",
        params,
      }),
    }),

    // GET /order-products/details/:id
    getOrderProductDetails: builder.query<
      any,
      { id: string; language: Language }
    >({
      query: ({ id, language }) => ({
        url: `${endpoints.orderProductsDetails}/${id}?locale=${language}`,
        method: "GET",
      }),
    }),

    // PATCH /cancel-order-product
    cancelOrderProduct: builder.mutation<void, CancelOrderProductRequest>({
      query: (body) => ({
        url: endpoints.cancelOrderProduct,
        method: "PATCH",
        data: body,
      }),
    }),

    // PATCH /approve-order-product
    approveOrderProduct: builder.mutation<void, ApproveOrderProductRequest>({
      query: (body) => ({
        url: endpoints.approveOrderProduct,
        method: "PATCH",
        data: body,
      }),
    }),

    // POST /orders/dispute/:orderId
    openDispute: builder.mutation<void, OpenDisputeRequest>({
      query: (body) => ({
        url: `${endpoints.openDispute}/${body.orderId}`,
        method: "POST",
        data: {
          reason: body.reason,
          description: body.description,
          attachments: body.attachments,
        },
      }),
    }),

    // GET /disputes/:disputeId
    getDisputeDetails: builder.query<any, string>({
      query: (disputeId) => ({
        url: `/disputes/${disputeId}`,
        method: "GET",
      }),
    }),

    // POST /disputes/respond/:disputeId
    respondDispute: builder.mutation<void, RespondDisputeRequest>({
      query: (body) => ({
        url: `${endpoints.respondDispute}/${body.disputeId}`,
        method: "POST",
        data: {
          action: body.action,
          vendorFacingResponse: body.vendorFacingResponse,
        },
      }),
    }),

    // POST /disputes/reopen/:disputeId
    reopenDispute: builder.mutation<void, ReopenDisputeRequest>({
      query: (body) => ({
        url: `${endpoints.reopenDispute}/${body.disputeId}`,
        method: "POST",
        data: {
          reason: body.reason,
          description: body.description,
          attachments: body.attachments,
        },
      }),
    }),

    // POST /orders/bulk-approve
    bulkApproveOrderProducts: builder.mutation<
      void,
      BulkApproveOrderProductsRequest
    >({
      query: (body) => ({
        url: endpoints.bulkApprove,
        method: "POST",
        data: body,
      }),
    }),

    // POST /bulk-order-product-status
    bulkMarkOrderAsCompleted: builder.mutation<
      void,
      BulkMarkAsCompletedRequest
    >({
      query: (body) => ({
        url: endpoints.bulkMarkAsComplete,
        method: "POST",
        data: body,
      }),
    }),

    // GET /orders/reconciliation-stats
    getReconciliationStats: builder.query<
      any,
      ReconciliationStatsParams | void
    >({
      query: (params) => ({
        url: endpoints.reconciliationStats,
        method: "GET",
        params: params || {},
      }),
    }),

    // POST /admin/monthly-reports/finalize-closed-orders
    finalizeClosedOrders: builder.mutation<
      FinalizeClosedOrdersResponse,
      FinalizeClosedOrdersRequest
    >({
      query: (body) => ({
        url: endpoints.finaliseApprovedOrders,
        method: "POST",
        data: body,
      }),
    }),

    // GET /admin/monthly-reports/finalize-closed-orders/preview
    previewFinalizeClosedOrders: builder.query<
      FinalizeSweepPreview,
      { year?: number; month?: number }
    >({
      query: ({ year, month }) => ({
        url: endpoints.previewFinaliseApprovedOrders,
        method: "GET",
        params: year && month ? { year, month } : undefined,
      }),
    }),

    // GET /payment-summary
    getVendorPaymentSummary: builder.query<
      VendorPaymentSummaryResponse,
      VendorPaymentSummaryParams | void
    >({
      query: (params) => ({
        url: endpoints.paymentSummary,
        method: "GET",
        params: params || {},
      }),
    }),

    exportBankTransferXlsx: builder.mutation<
      Blob,
      { year: number; month: number; locale?: Language }
    >({
      query: (body) => ({
        url: endpoints.exportBankTransferXlsx,
        method: "POST",
        data: body,
        responseType: "blob",
      }),
    }),

    exportVendorwiseXlsx: builder.mutation<
      Blob,
      {
        year: number;
        month: number;
        vendorId?: string | null;
        locale?: Language;
      }
    >({
      query: (body) => ({
        url: endpoints.exportVendorwiseXlsx,
        method: "POST",
        data: body,
        responseType: "blob",
      }),
    }),
  }),
});

export const {
  useGetOrderProductsQuery,
  useGetOrderProductDetailsQuery,
  useLazyGetOrderProductDetailsQuery,
  useCancelOrderProductMutation,
  useApproveOrderProductMutation,
  useOpenDisputeMutation,
  useRespondDisputeMutation,
  useReopenDisputeMutation,
  useGetDisputeDetailsQuery,
  useBulkApproveOrderProductsMutation,
  useBulkMarkOrderAsCompletedMutation,
  useGetReconciliationStatsQuery,
  useFinalizeClosedOrdersMutation,
  usePreviewFinalizeClosedOrdersQuery,
  useGetVendorPaymentSummaryQuery,
  useExportBankTransferXlsxMutation,
  useExportVendorwiseXlsxMutation,
} = reconciliationQueryApi;
