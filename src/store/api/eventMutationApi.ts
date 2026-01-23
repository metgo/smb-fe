import { createApi } from '@reduxjs/toolkit/query/react';

import { endpoints } from '@/lib/endpoints';
import { axiosBaseQuery } from './axiosBaseQuery';

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
  reducerPath: 'eventMutationApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Event'],
  endpoints: (builder) => ({
    initEventCreate: builder.mutation<any, void>({
      query: () => ({
        url: endpoints.events,
        method: 'POST',
        data: { name: "" }
      }),
      invalidatesTags: ['Event']
    }),

    updateEvent: builder.mutation<any, { body: EventStepPayload, eventId: string }>({
      query: ({ body, eventId }) => ({
        url: `${endpoints.events}/${eventId}`,
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: ['Event']
    }),

    deleteEvent: builder.mutation<any, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `${endpoints.events}/${eventId}`,
        method: 'DELETE',
      })
    }),

    createTicket: builder.mutation<any, ITicketPayload>({
      query: (body) => ({
        url: endpoints.tickets,
        method: 'POST',
        data: body
      }),
    }),

    updateTicket: builder.mutation<any, { body: ITicketPayload, ticketId: string }>({
      query: ({ body, ticketId }) => ({
        url: `${endpoints.tickets}/${ticketId}`,
        method: 'PATCH',
        data: body
      }),
    }),

    deleteTicket: builder.mutation<any, { ticketId: string }>({
      query: ({ ticketId }) => ({
        url: `${endpoints.tickets}/${ticketId}`,
        method: 'DELETE',
      })
    }),

    createSignedUrl: builder.mutation<any, SignedUrlPayload[]>({
      query: (body) => ({
        url: endpoints.mediaSignedUrl,
        method: 'POST',
        data: { items: body }
      })
    }),
  }),
});

export const {
  useInitEventCreateMutation,
  useUpdateEventMutation,
  useUpdateTicketMutation,
  useCreateSignedUrlMutation,
  useDeleteTicketMutation,
  useCreateTicketMutation,
  useDeleteEventMutation,
} = eventMutationApi;
