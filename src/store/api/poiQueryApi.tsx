import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export const poiQueryApi = createApi({
  reducerPath: "poiQueryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Trips"],

  endpoints: (builder) => ({
    getAllPOI: builder.query<any, any>({
      query: (params) => ({
        url: endpoints.popularPoiStats,
        method: "GET",
        params,
      }),
    }),
  }),
});
export const { useGetAllPOIQuery } = poiQueryApi;
