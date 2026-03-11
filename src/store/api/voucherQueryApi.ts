import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export const voucherQueryApi = createApi({
  reducerPath: "voucherQueryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Voucher"],

  endpoints: (builder) => ({
    getAllVouchers: builder.query<any, any>({
      query: (params) => ({
        url: endpoints.vouchers,
        method: "GET",
        params,
      }),
    }),

    getVoucherStats: builder.query<any, any>({
      query: (params) => ({
        url: endpoints.voucherStatDashboard,
        method: "GET",
        params,
      }),
    }),

    getIndividualVoucherStats: builder.query<any, any>({
      query: ({ voucherId }) => ({
        url: `${endpoints.voucherStatDashboard}/${voucherId}`,
        method: "GET",
      }),
    }),

    getVoucherById: builder.query<any, any>({
      query: ({ voucherId }) => ({
        url: `${endpoints.voucher}/${voucherId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetAllVouchersQuery,
  useGetVoucherStatsQuery,
  useGetIndividualVoucherStatsQuery,
  useLazyGetIndividualVoucherStatsQuery,
  useGetVoucherByIdQuery,
} = voucherQueryApi;
