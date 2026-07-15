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
  internalNotes: string;
  vendorFacingResponse: string;
}

export interface BulkApproveOrderProductsRequest {
  approveAllDisputed: boolean;
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
    getOrderProductDetails: builder.query<any, string>({
      query: (id) => ({
        url: `${endpoints.orderProductsDetails}/${id}`,
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
          internalNotes: body.internalNotes,
          vendorFacingResponse: body.vendorFacingResponse,
        },
      }),
    }),

    // POST /orders/bulk-approve
    bulkApproveOrderProducts: builder.mutation<
      void,
      BulkApproveOrderProductsRequest
    >({
      query: (body) => ({
        url: "/orders/bulk-approve",
        method: "POST",
        data: body,
      }),
    }),
  }),
});

export const {
  useGetOrderProductsQuery,
  useGetOrderProductDetailsQuery,
  useCancelOrderProductMutation,
  useApproveOrderProductMutation,
  useOpenDisputeMutation,
  useRespondDisputeMutation,
  useGetDisputeDetailsQuery,
  useBulkApproveOrderProductsMutation,
} = reconciliationQueryApi;
