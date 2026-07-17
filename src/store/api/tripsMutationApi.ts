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
    bulkDeleteTrips: builder.mutation<any, { ids: string[] }>({
      query: (body) => ({
        url: endpoints.bulkTripsDelete,
        method: "DELETE",
        data: body,
      }),
      invalidatesTags: ["Trips"],
    }),
    bulkUpdateTripsStatus: builder.mutation<
      any,
      { ids: string[]; status: string }
    >({
      query: (body) => ({
        url: endpoints.bulkTripsStatusUpdate,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Trips"],
    }),
  }),
});

export const {
  useCreateTripMutation,
  useUpdateTripMutation,
  useDeleteTripMutation,
  useBulkDeleteTripsMutation,
  useBulkUpdateTripsStatusMutation,
} = tripMutationApi;
