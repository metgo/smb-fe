import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

interface IBulkVoucherUpdateParams {
  vouchersId: string[];
  status?: string;
  isDeleted?: boolean;
}

/* ---------------- API ---------------- */
export const voucherMutationApi = createApi({
  reducerPath: "voucherMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Voucher"],
  endpoints: (builder) => ({
    initVoucherCreate: builder.mutation<any, void>({
      query: () => ({
        url: endpoints.vouchers,
        method: "POST",
        data: { name: "" },
      }),
      invalidatesTags: ["Voucher"],
    }),

    deleteVoucher: builder.mutation<any, { voucherId: string }>({
      query: ({ voucherId }) => ({
        url: `${endpoints.vouchers}/${voucherId}`,
        method: "DELETE",
      }),
    }),

    updateVoucher: builder.mutation<any, { body: any; voucherId: string }>({
      query: ({ body, voucherId }) => ({
        url: `${endpoints.vouchers}/${voucherId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Voucher"],
    }),

    bulkVouchersUpdate: builder.mutation<any, IBulkVoucherUpdateParams>({
      query: (body) => ({
        url: endpoints.bulkVouchersUpdate,
        method: "PATCH",
        data: body,
      }),
    }),
  }),
});

export const {
  useInitVoucherCreateMutation,
  useUpdateVoucherMutation,
  useDeleteVoucherMutation,
  useBulkVouchersUpdateMutation,
} = voucherMutationApi;
