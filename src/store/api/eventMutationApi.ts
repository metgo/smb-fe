import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

/* ---------------- Payload Union ---------------- */
export type EventStepPayload =
  | EventBasicInfoPayload
  | EventDateTimePayload
  | EventRegPayload
  | ITicketPayload
  | EventMsgSchedulePayload
  | EventMediaPayload;

/* ---------------- API ---------------- */
export const eventMutationApi = createApi({
  reducerPath: "eventMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Event"],
  endpoints: (builder) => ({
    initEventCreate: builder.mutation<any, { businessId?: string }>({
      query: ({ businessId }) => ({
        url: endpoints.events,
        method: "POST",
        data: { name: "", ...(businessId && { businessId }) },
      }),
      invalidatesTags: ["Event"],
    }),

    updateEvent: builder.mutation<
      any,
      { body: EventStepPayload; eventId: string; language: Language }
    >({
      query: ({ body, eventId, language }) => ({
        url: `${endpoints.events}/${eventId}?locale=${language}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Event"],
    }),

    deleteEvent: builder.mutation<any, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `${endpoints.events}/${eventId}`,
        method: "DELETE",
      }),
    }),

    createTicket: builder.mutation<any, ITicketPayload>({
      query: (body) => ({
        url: endpoints.tickets,
        method: "POST",
        data: body,
      }),
    }),

    updateTicket: builder.mutation<
      any,
      { body: ITicketPayload; ticketId: string }
    >({
      query: ({ body, ticketId }) => ({
        url: `${endpoints.tickets}/${ticketId}`,
        method: "PATCH",
        data: body,
      }),
    }),

    updateTicketReorder: builder.mutation<any, { body: ITicketReorderPayload }>(
      {
        query: ({ body }) => ({
          url: `${endpoints.ticketsReorder}`,
          method: "PATCH",
          data: body,
        }),
      },
    ),

    deleteTicket: builder.mutation<any, { ticketId: string }>({
      query: ({ ticketId }) => ({
        url: `${endpoints.tickets}/${ticketId}`,
        method: "DELETE",
      }),
    }),

    updateEventTicketStatus: builder.mutation<
      any,
      { orderId: string; status: string; cancelReason?: string }
    >({
      query: ({ orderId, status, cancelReason }) => ({
        url: `${endpoints.eventTickets}/order-status`,
        method: "PATCH",
        params: { orderId, status, ...(cancelReason ? { cancelReason } : {}) },
      }),
    }),

    // Check-in toggle (Registrations tab). Separate from order-status because
    // attendance must not overwrite `status` - reconciliation/payout key off it.
    setEventTicketAttendance: builder.mutation<
      any,
      { orderId: string; attended: boolean }
    >({
      query: ({ orderId, attended }) => ({
        url: `${endpoints.eventTickets}/attendance`,
        method: "PATCH",
        params: { orderId, attended },
      }),
    }),

    // Public QR-scan check-in - no auth token required
    markPublicTicketAttendance: builder.mutation<
      any,
      { eventId: string; ticketId: string }
    >({
      query: ({ eventId, ticketId }) => ({
        url: `${endpoints.publicEventTicket}/${eventId}/${ticketId}/attendance`,
        method: "PATCH",
      }),
    }),

    createSession: builder.mutation<
      { data: EventSession },
      CreateSessionPayload
    >({
      query: (body) => ({
        url: endpoints.eventSessions,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Event"],
    }),

    resendTicketEmailToCustomer: builder.mutation<
      any,
      { ordersId: string[]; emailRecipient: "CUSTOMER" }
    >({
      query: (payload) => ({
        url: endpoints.resendTicketEmailToCustomer,
        method: "POST",
        data: payload,
      }),
    }),

    notifyTicketCustomerByEmailSms: builder.mutation<
      any,
      { ordersId: string[]; type: "email" | "sms"; emailRecipient: string }
    >({
      query: (payload) => ({
        url: endpoints.sendOrderNotification,
        method: "POST",
        data: payload,
      }),
    }),
  }),
});

export const {
  useInitEventCreateMutation,
  useUpdateEventMutation,
  useUpdateTicketMutation,
  useDeleteTicketMutation,
  useCreateTicketMutation,
  useDeleteEventMutation,
  useUpdateEventTicketStatusMutation,
  useSetEventTicketAttendanceMutation,
  useMarkPublicTicketAttendanceMutation,
  useUpdateTicketReorderMutation,
  useResendTicketEmailToCustomerMutation,
  useNotifyTicketCustomerByEmailSmsMutation,
} = eventMutationApi;
