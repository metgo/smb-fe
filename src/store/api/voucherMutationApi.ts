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
    // In your RTK Query api slice
    createVoucher: builder.mutation<any, any>({
      query: (payload) => ({
        url: endpoints.vouchers,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["Voucher"],
    }),

    sendEmail: builder.mutation<any, any>({
      query: (body) => ({
        url: endpoints.sendemail,
        method: "POST",
        data: body,
      }),
    }),
    sendSMS: builder.mutation<any, any>({
      query: (body) => ({
        url: endpoints.sendsms,
        method: "POST",
        data: body,
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
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useBulkVouchersUpdateMutation,
  useSendEmailMutation,
  useSendSMSMutation,
} = voucherMutationApi;
