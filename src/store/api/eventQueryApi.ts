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

    getEventById: builder.query<any, { eventId: string | null }>({
      query: ({ eventId }) => ({
        url: `${endpoints.events}/${eventId}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useGetAllTicketQuery,
  useGetAllEventsQuery,
  useGetEventByIdQuery,
  useLazyGetEventByIdQuery,
  useGetEventsStatsQuery,
  useGetAllUpcomingEventsQuery,
  useGetEventTicketsQuery,
  useLazyGetEventTicketsQuery,
} = eventQueryApi;
