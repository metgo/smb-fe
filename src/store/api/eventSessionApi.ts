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
      IAdminConfig & { _id: string },
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
  }),
});

export const {
  useGetAllEventSessionsQuery,
  useGetEventSessionByIdQuery,
  useCreateEventSessionMutation,
  useUpdateEventSessionMutation,
  useDeleteEventSessionMutation,
  useGenSessionPrivewLinkQuery,
  useGetCapacityReportQuery,
  useEventSessionRegListQuery,
  useEventSessionTargetAudienceQuery,
} = eventSessionApi;
