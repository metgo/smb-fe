import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export const sessionMutationApi = createApi({
  reducerPath: "sessionMutationApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    markSessionAttended: builder.mutation<any, { sessionBookingId: string }>({
      query: ({ sessionBookingId }) => ({
        url: `${endpoints.publicSessionTicket}/${sessionBookingId}`,
        method: "PATCH",
      }),
    }),
  }),
});

export const { useMarkSessionAttendedMutation } = sessionMutationApi;
