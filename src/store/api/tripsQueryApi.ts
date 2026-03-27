import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export const tripQueryApi = createApi({
  reducerPath: "tripQueryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Trips"],

  endpoints: (builder) => ({
    getAllTrips: builder.query<any, any>({
      query: (params) => ({
        url: endpoints.trips,
        method: "GET",
        params,
      }),
    }),
    getTripById: builder.query<any, { tripId: string | null }>({
      query: ({ tripId }) => ({
        url: `${endpoints.trips}/${tripId}`,
        method: "GET",
      }),
    }),
    getTripsStats: builder.query<any, any>({
      query: (params) => ({
        url: endpoints.trips,
        method: "GET",
        params,
      }),
    }),

    // Stations
    getAllStations: builder.query<any, any>({
      query: (params) => ({
        url: endpoints.stations,
        method: "GET",
        params,
      }),
    }),

    getStationDetails: builder.query<any, string>({
      query: (id) => ({
        url: `${endpoints.stations}/${id}`, // just the base URL
        method: "GET",
      }),
    }),
  }),
});
export const {
  useGetAllTripsQuery,
  useGetTripByIdQuery,
  useGetStationDetailsQuery,
  useGetAllStationsQuery,
} = tripQueryApi;
