import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";


interface QueryParams {
  createdAfter?: string;
}

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["NotificationData"],
  endpoints: (builder) => ({
    getAllNotifications: builder.query<INotifListRes, QueryParams>({
      query: (params) => ({
        url: endpoints.notifications,
        method: "GET",
        params
      }),
    }),

    markNotificationsAsRead: builder.mutation<INotifListRes, string>({
      query: (notificationId) => ({
        url: `${endpoints.notifications}/${notificationId}`,
        method: "PATCH",
      }),
    }),

  }),
});

export const {
  useGetAllNotificationsQuery,
  useLazyGetAllNotificationsQuery,
  useMarkNotificationsAsReadMutation,
} = notificationApi;
