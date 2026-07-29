import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

interface GetAllEventSessionsParams {
  page?: number;
  limit?: number;
  search?: string;
  theme?: string;
}

interface EventSessionListResponse {
  data: IEventSession[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
  };
}

type CreateEventSessionPayload = Omit<IAdminConfig, "id">;
type UpdateEventSessionPayload = Partial<CreateEventSessionPayload>;

export const eventSessionApi = createApi({
  reducerPath: "eventSessionApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["EventSession"],
  endpoints: (builder) => ({


    initCreateSessionWrapper: builder.mutation<{ message: string, id: string }, any>({
      query: (payload) => ({
        url: endpoints.initWrapperCreate,
        method: "POST",
        data: payload
      }),
    }),

    getAllEventSessions: builder.query<
      EventSessionListResponse,
      GetAllEventSessionsParams
    >({
      query: (params) => ({
        url: endpoints.eventSessions,
        method: "GET",
        params,
      }),
      providesTags: ["EventSession"],
    }),

    deleteLandingPage: builder.mutation<void, string>({
      query: (wrapperId) => ({
        url: `${endpoints.eventSessions}/${wrapperId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EventSession"],
    }),

    getEventSessionById: builder.query<IAdminConfig, string>({
      query: (sessionId) => ({
        url: `${endpoints.eventSessions}/${sessionId}`,
        method: "GET",
      }),
      providesTags: ["EventSession"],
    }),

    genSessionPrivewLink: builder.query<
      { success: boolean; data: { previewLink: string } },
      string
    >({
      query: (sessionId) => ({
        url: `${endpoints.eventSessionPreviwLink}/${sessionId}`,
        method: "GET",
      }),
      providesTags: ["EventSession"],
    }),

    eventSessionRegList: builder.query<
      IRegistrationsResponse,
      { page: number; limit: number; wrapperId: string }
    >({
      query: (params) => ({
        url: `${endpoints.eventSessionReg}/${params.wrapperId}`,
        method: "GET",
        params: {
          page: params.page,
          limit: params.limit,
        },
      }),
      providesTags: ["EventSession"],
    }),

    eventSessionTargetAudience: builder.query<
      ITargetAudienceResponse,
      { page: number; limit: number; wrapperId: string }
    >({
      query: (params) => ({
        url: `${endpoints.eventSessionTargetAudience}/${params.wrapperId}`,
        method: "GET",
        params: {
          page: params.page,
          limit: params.limit,
        },
      }),
      providesTags: ["EventSession"],
    }),

    getCapacityReport: builder.query<ISessionSummaryResponse, string>({
      query: (wrapperId) => ({
        url: `${endpoints.eventSessionCapacityReport}/${wrapperId}`,
        method: "GET",
      }),
      providesTags: ["EventSession"],
    }),

    createEventSession: builder.mutation<
      { id: string; message: string },
      CreateEventSessionPayload
    >({
      query: (body) => ({
        url: endpoints.eventSessions,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["EventSession"],
    }),

    updateEventSession: builder.mutation<
      IEventSession,
      { sessionId: string; body: UpdateEventSessionPayload }
    >({
      query: ({ sessionId, body }) => ({
        url: `${endpoints.eventSessions}/${sessionId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["EventSession"],
    }),

    deleteEventSession: builder.mutation<void, string>({
      query: (sessionId) => ({
        url: `${endpoints.eventSessions}/${sessionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EventSession"],
    }),

    // Notificaiton send
    sendSessionNotification: builder.mutation<
      any,
      { wrapperId: string; data: ISendNotificationPayload }
    >({
      query: ({ wrapperId, data }) => ({
        url: `${endpoints.eventSessionSendNotification}/${wrapperId}`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["EventSession"],
    }),

    reSendSessionNotification: builder.mutation<any, string>({
      query: (historyId) => ({
        url: `${endpoints.eventSessionResendNotification}/${historyId}`,
        method: "POST",
      }),
      invalidatesTags: ["EventSession"],
    }),

    getSendNotificationHistory: builder.query<
      INotificationHistoryResponse,
      { wrapperId: string; page: number; limit: number }
    >({
      query: ({ wrapperId, page, limit }) => ({
        url: `${endpoints.eventSessionSendHistory}/${wrapperId}`,
        method: "GET",
        params: {
          page,
          limit,
        },
      }),
      providesTags: ["EventSession"],
    }),

    getSendNotificationHistoryDetails: builder.query<
      INotificationDetailResponse,
      string
    >({
      query: (historyId) => ({
        url: `${endpoints.eventSessionSendHistoryDetails}/${historyId}`,
        method: "GET",
      }),
    }),


    getAllLandingPageSessions: builder.query<unknown, string>({
      query: (wrapperId) => ({
        url: `${endpoints.eventSessions}/${wrapperId}`,
        method: "GET",
      }),
      providesTags: ["EventSession"],
    }),

    // Landing page session block
    createLandingPageSessionBlock: builder.mutation<any, { wrapperId: string; data: any, method?: TMethod }>({
      query: ({ wrapperId, data, method = "POST" }) => ({
        url: `${endpoints.createWrapperSessionBlock}/${wrapperId}`,
        method,
        data,
      }),
      invalidatesTags: ["EventSession"],
    }),

    deleteSessionBlock: builder.mutation<any, { wrapperId: string, blockId: string }>({
      query: ({ wrapperId, blockId }) => ({
        url: `${endpoints.createWrapperSessionBlock}/${wrapperId}/${blockId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EventSession"],
    }),

    // Landing page session 
    createLandingPageSession: builder.mutation<any, { wrapperId: string; data: any, method?: TMethod }>({
      query: ({ wrapperId, data, method = "POST" }) => ({
        url: `${endpoints.createWrapperSession}/${wrapperId}`,
        method,
        data,
      }),
      invalidatesTags: ["EventSession"],
    }),

    deleteSession: builder.mutation<any, { wrapperId: string, sessionId: string }>({
      query: ({ wrapperId, sessionId }) => ({
        url: `${endpoints.eventSessions}/sessions/${wrapperId}/${sessionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EventSession"],
    }),

  }),
});

export const {
  useInitCreateSessionWrapperMutation,

  useGetAllEventSessionsQuery,
  useDeleteLandingPageMutation,
  useGetEventSessionByIdQuery,
  useCreateEventSessionMutation,
  useUpdateEventSessionMutation,
  useDeleteEventSessionMutation,
  useGenSessionPrivewLinkQuery,
  useGetCapacityReportQuery,
  useEventSessionRegListQuery,
  useEventSessionTargetAudienceQuery,

  useSendSessionNotificationMutation,
  useReSendSessionNotificationMutation,
  useGetSendNotificationHistoryQuery,
  useGetSendNotificationHistoryDetailsQuery,

  useCreateLandingPageSessionMutation,
  useCreateLandingPageSessionBlockMutation,
  useGetAllLandingPageSessionsQuery,
  useDeleteSessionBlockMutation,
  useDeleteSessionMutation,
} = eventSessionApi;
