import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export const sessionQueryApi = createApi({
  reducerPath: "sessionQueryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Session"],
  endpoints: (builder) => ({
    getPublicSessionTicket: builder.query<
      any,
      { wrapperId: string; sessionBookingId: string }
    >({
      query: ({ wrapperId, sessionBookingId }) => ({
        url: `${endpoints.publicSessionTicket}/${wrapperId}/${sessionBookingId}`,
        method: "GET",
      }),
      transformResponse: (response: { success: boolean; data: any }) =>
        response.data,
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useGetPublicSessionTicketQuery } = sessionQueryApi;
