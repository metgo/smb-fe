import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const userMutationApi = createApi({
  reducerPath: "userMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["user"],
  endpoints: (builder) => ({
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
  }),
});

export const { useUpdateProfileInfoMutation } = userMutationApi;
