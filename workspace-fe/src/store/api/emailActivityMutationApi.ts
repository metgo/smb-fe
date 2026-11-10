import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const emailActivityMutationApi = createApi({
  reducerPath: "emailActivityMutationApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    resendEmailActivity: builder.mutation<
      { datas: IEmailActivityResendResult },
      string
    >({
      query: (id) => ({
        url: `${endpoints.emailActivity}/${id}/resend`,
        method: "POST",
      }),
    }),
  }),
});

export const { useResendEmailActivityMutation } = emailActivityMutationApi;
