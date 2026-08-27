import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export type PaymentTransactionStatus =
  | "SUCCESS"
  | "FAILURE"
  | "PENDING"
  | "CANCELING"
  | "REFUND_IN_PROCESS"
  | "REFUND_SUCCESS"
  | "UNPAID";

export interface PaymentTransactionUserInfo {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  countryCode: string | null;
  phone: string | null;
}

export interface PaymentTransaction {
  _id: string;
  amount: number;
  currency: string;
  method: string | null;
  paymentRequestId: string;
  orderId: string;
  paymentDate: string;
  paymentStatus: PaymentTransactionStatus | string;
  orderStatus: string;
  orderProductId: string;
  invoiceURL?: string | null;
  userInfo: PaymentTransactionUserInfo;
}

export interface PaymentTransactionsParams {
  page?: number;
  limit?: number;
  search?: string;
  paymentStatus?: string;
  orderStatus?: string;
}

export interface PaymentTransactionsResponse {
  data: PaymentTransaction[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNextPage?: boolean;
  };
  totalData?: number;
}

export const paymentQueryApi = createApi({
  reducerPath: "paymentQueryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["PaymentTransaction"],
  endpoints: (builder) => ({
    getPaymentTransactions: builder.query<
      PaymentTransactionsResponse,
      PaymentTransactionsParams
    >({
      query: (params) => ({
        url: endpoints.paymentTransactions,
        method: "GET",
        params,
      }),
      providesTags: ["PaymentTransaction"],
    }),
  }),
});

export const { useGetPaymentTransactionsQuery } = paymentQueryApi;
