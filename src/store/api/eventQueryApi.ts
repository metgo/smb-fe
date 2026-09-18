import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

interface EventsStatsParams {
  startDate?: string;
  endDate?: string;
  dmoId?: string;
  authorityId?: string;
  eventId?: string;
  minPrice?: string;
  maxPrice?: string;
  status?: string;
}

interface EventListParams {
  page?: number;
  limit?: number;
  search?: string;
  eventType?: string;
  status?: string;
  isRegistration?: boolean;
  isFree?: boolean;
  authorityId?: string;
  dmoId?: string;
  externalApiId?: string[];
  sortOrder?: string;
  sortBy?: string;
  startDate?: string;
  endDate?: string;
}

export const eventQueryApi = createApi({
  reducerPath: "eventQueryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Event"],
  endpoints: (builder) => ({
    getAllTicket: builder.query<any, { eventId: string }>({
      query: (params) => ({
        url: endpoints.tickets,
        method: "GET",
        params,
      }),
      providesTags: ["Event"],
    }),

    getAllSessionTicket: builder.query<
      ITicketResponse,
      { eventId: string; wrapperId?: string }
    >({
      query: (params) => ({
        url: `${endpoints.ticketsForEventSession}/${params.eventId}?wrapperId=${params.wrapperId || ""}`,
        method: "GET",
      }),
      providesTags: ["Event"],
    }),

    getEventTickets: builder.query<
      {
        data: any[];
        totalData: number;
        meta: {
          page: number;
          limit: number;
          data: number;
          pageCount: number;
          hasPreviousPage: boolean;
          hasNextPage: boolean;
        };
      },
      {
        eventId: string;
        page?: number;
        limit?: number;
        search?: string;
        firstName?: string;
        phone?: string;
        email?: string;
      }
    >({
      query: ({ eventId, ...params }) => ({
        url: `${endpoints.eventTickets}/${eventId}`,
        method: "GET",
        params,
      }),
    }),

    getEventTicketsExportCsv: builder.query<Blob, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `${endpoints.eventTickets}/${eventId}/export/csv`,
        method: "GET",
        responseType: "blob",
      }),
    }),

    getEventTicketsExportPdf: builder.query<Blob, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `${endpoints.eventTickets}/${eventId}/export/pdf`,
        method: "GET",
        responseType: "blob",
      }),
    }),

    getEventTicketsExportXlsx: builder.query<Blob, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `${endpoints.eventTickets}/${eventId}/export/xlsx`,
        method: "GET",
        responseType: "blob",
      }),
    }),

    getEventTicketAnswers: builder.query<
      IEventTicketAnswersResponse,
      { ticketId: string; email?: string; phone?: string; orderId?: string }
    >({
      query: ({ ticketId, email, phone, orderId }) => ({
        url: `${endpoints.eventTicketAnswers}/${ticketId}`,
        method: "GET",
        params: { email, phone, orderId },
      }),
    }),

    getAllEvents: builder.query<any, EventListParams>({
      query: (params) => ({
        url: `${endpoints.events}?sortBy=DESC`,
        method: "GET",
        params,
      }),
    }),

    getAllUpcomingEvents: builder.query<IUpcommingEventsResponse, void>({
      query: () => ({
        url: endpoints.upcomingEvents,
        method: "GET",
      }),
    }),

    getEventsStats: builder.query<any, EventsStatsParams>({
      query: (params) => ({
        url: endpoints.eventsStats,
        method: "GET",
        params,
      }),
    }),

    getEventById: builder.query<IEventDetailsRes, { eventId: string | null }>({
      query: ({ eventId }) => ({
        url: `${endpoints.events}/${eventId}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
    }),

    getPublicEventTicket: builder.query<
      any,
      { eventId: string; ticketId: string }
    >({
      query: ({ eventId, ticketId }) => ({
        url: `${endpoints.publicEventTicket}/${eventId}/${ticketId}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
    }),

    getSessionsByEventId: builder.query<
      IEventSessionListResponse,
      { eventId: string }
    >({
      query: ({ eventId }) => ({
        url: endpoints.eventSessions,
        method: "GET",
        params: { eventId },
      }),
      providesTags: ["Event"],
      keepUnusedDataFor: 0,
    }),

    getContentManagementEvents: builder.query<any, any>({
      query: (params) => ({
        url: `${endpoints.contentManagementEvents}?sortBy=DESC`,
        method: "GET",
        params,
      }),
    }),
  }),
});

export const {
  useGetAllTicketQuery,
  useGetAllSessionTicketQuery,
  useGetAllEventsQuery,
  useGetEventByIdQuery,
  useLazyGetEventByIdQuery,
  useGetEventsStatsQuery,
  useGetAllUpcomingEventsQuery,
  useGetEventTicketsQuery,
  useLazyGetEventTicketsQuery,
  useLazyGetEventTicketsExportCsvQuery,
  useLazyGetEventTicketsExportPdfQuery,
  useLazyGetEventTicketsExportXlsxQuery,
  useGetEventTicketAnswersQuery,
  useGetPublicEventTicketQuery,
  useLazyGetPublicEventTicketQuery,
  useGetSessionsByEventIdQuery,
  useGetContentManagementEventsQuery,
} = eventQueryApi;
