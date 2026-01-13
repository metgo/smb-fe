import { createApi } from '@reduxjs/toolkit/query/react';

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";


interface Stap1Payload {
  name?: string;
  description?: string;
  shortDescription?: string;
  authorityId?: string | null;
  dmoId?: string | null;
  status?: string;
  groupTypesId?: string[];
  accessibilitiesId?: string[];
  subCategoriesId?: string[];
  internalNotes?: string;
}

interface Stap2Payload {
  name?: string;
  description?: string;
  shortDescription?: string;
  authorityId?: string | null;
  dmoId?: string | null;
  status?: string;
  groupTypesId?: string[];
  accessibilitiesId?: string[];
  subCategoriesId?: string[];
  internalNotes?: string;
}


export const eventApi = createApi({
  reducerPath: 'eventApi',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    // Create Event Basic Information
    createEventStep1: builder.mutation<any, Stap1Payload>({
      query: (body) => ({
        url: endpoints.events,
        method: 'POST',
        data: body,
      })
  }),

    // Create Date & Time 
    createEventStep2: builder.mutation<any, Stap2Payload>({
      query: (body) => ({
        url: endpoints.events,
        method: 'PUT',
        data: body,
      })
    }),
  })
});

export const {
  useCreateEventStep1Mutation,
  useCreateEventStep2Mutation,

} = eventApi