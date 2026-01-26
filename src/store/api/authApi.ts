import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterStep1Payload {
  email: string;
  firstName: string;
}

interface RegisterStep2Payload {
  userId: string;
  password: string;
  lastName: string;
  phoneNumber: string;
  languagePreference?: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    //  Login
    login: builder.mutation<any, LoginPayload>({
      query: (body) => ({
        url: endpoints.login,
        method: "POST",
        data: body,
      }),
    }),

    //  Register - Step 1
    registerStep1: builder.mutation<any, RegisterStep1Payload>({
      query: (body) => ({
        url: endpoints.registerStep1,
        method: "POST",
        data: body,
      }),
    }),

    //  Register - Step 2
    registerStep2: builder.mutation<any, RegisterStep2Payload>({
      query: ({ userId, ...body }) => ({
        url: `${endpoints.registerStep2}/${userId}`,
        method: "PATCH",
        data: body,
      }),
    }),
  }),
});
export const {
  useLoginMutation,
  useRegisterStep1Mutation,
  useRegisterStep2Mutation,
} = authApi;
