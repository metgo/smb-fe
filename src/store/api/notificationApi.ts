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
      providesTags: ["NotificationData"],
    }),

    getNotificatonStats: builder.query<INotificationStats, void>({
      query: () => ({
        url: endpoints.notificationStats,
        method: "GET",
      }),
      providesTags: ["NotificationData"],
    }),

    getNotificationCount: builder.query<INotificationStats, void>({
      query: () => ({
        url: endpoints.notificationCount,
        method: "GET",
      }),
      providesTags: ["NotificationData"],
    }),

    markNotificationsAsRead: builder.mutation<INotifListRes, string>({
      query: (notificationId) => ({
        url: `${endpoints.notifications}/${notificationId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["NotificationData"],
    }),

    bulkMarkNotificationsAsRead: builder.mutation<void, string[] | undefined>({
      query: (ids) => ({
        url: endpoints.notificationsBulkMarkRead,
        method: "PATCH",
        data: { ids },
      }),
      invalidatesTags: ["NotificationData"],
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
      invalidatesTags: ["NotificationData"],
    }),
  }),
});

export const {
  useGetAllNotificationsQuery,
  useLazyGetAllNotificationsQuery,
  useMarkNotificationsAsReadMutation,
  useBulkMarkNotificationsAsReadMutation,
  useUpdateNotificationMutation,
  useGetNotificatonStatsQuery,
  useGetNotificationCountQuery,
} = notificationApi;
