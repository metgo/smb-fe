import { createApi } from '@reduxjs/toolkit/query/react';

import { endpoints } from '@/lib/endpoints';
import { axiosBaseQuery } from './axiosBaseQuery';

/* ---------------- Payload Union ---------------- */
export type BusinessStepPayload =
  |BusinessBasicInfoPayload
  | BusinessContactPayload;
  // | BusinessLocationPayload
  // | BusinessCategoriesPayload
  // | BusinessMediaPayload
  // | BusinessHoursPayload
  // | BusinessDeliveryPayload
  // | BusinessSocialMediaPayload;

/* ---------------- API ---------------- */
export const businessMutationApi = createApi({
  reducerPath: 'businessMutationApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Business'],
  endpoints: (builder) => ({
    initBusinessCreate: builder.mutation<any, void>({
      query: () => ({
        url: endpoints.businesses,
        method: 'POST',
        data: { name: "" }
      }),
      invalidatesTags: ['Business']
    }),

    updateBusiness: builder.mutation<any, { body: any, businessId: string }>({
      query: ({ body, businessId }) => ({
        url: `${endpoints.businesses}/${businessId}`,
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: ['Business']
    }),

    
  }),
});

export const {
  useInitBusinessCreateMutation,
  useUpdateBusinessMutation,
  
} = businessMutationApi;
