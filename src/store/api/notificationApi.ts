import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

interface QueryParams {
  page?: number;
  limit?: number;
  notifType?: TNotifType;
  readType?: TNotifStatus;
  itemType?: TItemType;
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
        params,
      }),
    }),

    getNotificatonStats: builder.query<INotificationStats, void>({
      query: () => ({
        url: endpoints.notificationStats,
        method: "GET",
      }),
    }),

    markNotificationsAsRead: builder.mutation<INotifListRes, string>({
      query: (notificationId) => ({
        url: `${endpoints.notifications}/${notificationId}`,
        method: "PATCH",
      }),
    }),

    updateNotification: builder.mutation<
      INotification,
      {
        notificationId: string;
        body: Partial<Pick<INotification, "status" | "isRead">>;
      }
    >({
      query: ({ notificationId, body }) => ({
        url: `${endpoints.notifications}/${notificationId}`,
        method: "PATCH",
        data: body,
      }),
    }),
  }),
});

export const {
  useGetAllNotificationsQuery,
  useLazyGetAllNotificationsQuery,
  useMarkNotificationsAsReadMutation,
  useUpdateNotificationMutation,
  useGetNotificatonStatsQuery,
} = notificationApi;
