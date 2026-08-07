import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

interface ChatUsersProps {
  page: number;
  limit: number;
  role?: TUserRole;
  dmoId?: string;
  authrityId?: string;
}

export const chatSystemApi = createApi({
  reducerPath: "chatSystemApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Chat", "Message", "User"],

  endpoints: (builder) => ({
    chatUsers: builder.query<any, ChatUsersProps>({
      query: (params: ChatUsersProps) => ({
        url: endpoints.chatUsers,
        method: "GET",
        params,
      }),
      providesTags: ["User"],
    }),

    sendMessage: builder.mutation<any, { body: any; chatId: string }>({
      query: ({ body, chatId }) => ({
        url: `${endpoints.chatMessages}/${chatId}`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Chat", "Message"],
    }),

    fetchMessages: builder.query<any, { chatId: string; page?: number }>({
      query: ({ chatId, page = 1 }) => ({
        url: `${endpoints.chatMessages}/${chatId}?page=${page}`,
        method: "GET",
      }),
      providesTags: ["Message"],
    }),
  }),
});

export const {
  useChatUsersQuery,
  useSendMessageMutation,
  useFetchMessagesQuery,
} = chatSystemApi;
