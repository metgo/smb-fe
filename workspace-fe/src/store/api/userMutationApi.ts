import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const userMutationApi = createApi({
  reducerPath: "userMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["user"],
  endpoints: (builder) => ({
    createUser: builder.mutation<any, any>({
      query: (body) => ({
        url: endpoints.createUser,
        method: "POST",
        data: body,
      }),
    }),

    updateUser: builder.mutation<any, { userId: string; body: any }>({
      query: ({ userId, body }) => ({
        url: `${endpoints.users}/${userId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["user"],
    }),

    updateProfileInfo: builder.mutation<
      any,
      { body: UserProfilePayload; userId: string }
    >({
      query: ({ body, userId }) => ({
        url: `${endpoints.users}/${userId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["user"],
    }),

    deleteUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `${endpoints.users}/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["user"],
    }),

    sendEmailSms: builder.mutation<
      any,
      { userId: string; type: "sms" | "email" }
    >({
      query: ({ userId, type }) => ({
        url: endpoints.notifyUserByEmailSms,
        method: "POST",
        data: { vendorId: userId, type },
      }),
      invalidatesTags: ["user"],
    }),
  }),
});

export const {
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateProfileInfoMutation,
  useDeleteUserMutation,
  useSendEmailSmsMutation,
} = userMutationApi;
