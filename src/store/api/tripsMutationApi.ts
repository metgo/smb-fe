import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export const tripMutationApi = createApi({
  reducerPath: "tripMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Trips"],
  endpoints: (builder) => ({
    createTrip: builder.mutation<any, any>({
      query: (body) => ({
        url: endpoints.trips,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Trips"],
    }),
    updateTrip: builder.mutation<any, { body: any; tripId: string }>({
      query: ({ body, tripId }) => ({
        url: `${endpoints.trips}/${tripId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Trips"],
    }),
    deleteTrip: builder.mutation<any, { tripId: string }>({
      query: ({ tripId }) => ({
        url: `${endpoints.trips}/${tripId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Trips"],
    }),
  }),
});

export const {
  useCreateTripMutation,
  useUpdateTripMutation,
  useDeleteTripMutation,
} = tripMutationApi;
