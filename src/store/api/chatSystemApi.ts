import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

interface ChatUsersProps {
  search?: string;
  email?: string;
  role?: TUserRole;
  dmoId?: string;
  authorityId?: string;
  businessTagsId?: string;
  dmoName?: string;
  authorityName?: string;
  businessName?: string;
  businessTag?: string;
  page?: number;
  limit?: number;
}

interface ChatConversationsProps {
  type?: TChatConversationType;
  includeArchived?: boolean;
  page?: number;
  limit?: number;
}

interface ChatConversationMessagesProps {
  conversationId: string;
  before?: string;
  limit?: number;
}

interface ChatBroadcastListsProps {
  search?: string;
  page?: number;
  limit?: number;
}

interface ChatBroadcastMessagesProps {
  broadcastListId: string;
  page?: number;
  limit?: number;
}

export const chatSystemApi = createApi({
  reducerPath: "chatSystemApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Chat", "Message", "User", "Group", "Broadcast"],

  endpoints: (builder) => ({
    chatUsers: builder.query<IChatUsersRes, ChatUsersProps>({
      query: (params: ChatUsersProps) => ({
        url: endpoints.chatUsers,
        method: "GET",
        params,
      }),
      providesTags: ["User"],
    }),

    // Send a direct message; auto-creates the DM conversation if needed
    sendDirectMessage: builder.mutation<
      ISendMessageRes,
      { targetUserId: string; content: string }
    >({
      query: (body) => ({
        url: endpoints.chatMessages,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Chat"],
    }),

    chatConversations: builder.query<
      IChatConversationsRes,
      ChatConversationsProps
    >({
      query: (params) => ({
        url: endpoints.chatConversations,
        method: "GET",
        params,
      }),
      providesTags: ["Chat"],
    }),

    chatUnreadCount: builder.query<IChatUnreadCountRes, void>({
      query: () => ({
        url: endpoints.chatUnreadCount,
        method: "GET",
      }),
      providesTags: ["Chat"],
    }),

    chatPresence: builder.query<IChatPresenceRes, { userIds: string[] }>({
      query: ({ userIds }) => ({
        url: endpoints.chatPresence,
        method: "GET",
        params: { userIds: userIds.join(",") },
      }),
    }),

    fetchConversationMessages: builder.query<
      IChatMessagesRes,
      ChatConversationMessagesProps
    >({
      query: ({ conversationId, before, limit }) => ({
        url: `${endpoints.chatConversations}/${conversationId}/messages`,
        method: "GET",
        params: { before, limit },
      }),
      providesTags: ["Message"],
    }),

    sendMessage: builder.mutation<
      IChatMessage,
      { conversationId: string; content: string }
    >({
      query: ({ conversationId, content }) => ({
        url: `${endpoints.chatConversations}/${conversationId}/messages`,
        method: "POST",
        data: { content },
      }),
      invalidatesTags: ["Chat", "Message"],
    }),

    editMessage: builder.mutation<
      IChatMessage,
      { conversationId: string; messageId: string; content: string }
    >({
      query: ({ conversationId, messageId, content }) => ({
        url: `${endpoints.chatConversations}/${conversationId}/messages/${messageId}`,
        method: "PATCH",
        data: { content },
      }),
      invalidatesTags: ["Message"],
    }),

    deleteMessage: builder.mutation<
      IChatMessage,
      { conversationId: string; messageId: string }
    >({
      query: ({ conversationId, messageId }) => ({
        url: `${endpoints.chatConversations}/${conversationId}/messages/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Message", "Chat"],
    }),

    markConversationRead: builder.mutation<IChatReadRes, string>({
      query: (conversationId) => ({
        url: `${endpoints.chatConversations}/${conversationId}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Chat"],
    }),

    updateConversationSettings: builder.mutation<
      IChatSettingsRes,
      { conversationId: string; isMuted?: boolean; isArchived?: boolean }
    >({
      query: ({ conversationId, ...body }) => ({
        url: `${endpoints.chatConversations}/${conversationId}/settings`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Chat"],
    }),

    createGroup: builder.mutation<IChatGroupConversation, ICreateGroupReq>({
      query: (body) => ({
        url: endpoints.chatGroups,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Chat"],
    }),

    groupDetails: builder.query<IChatGroupDetails, string>({
      query: (conversationId) => ({
        url: `${endpoints.chatGroups}/${conversationId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, conversationId) => [
        { type: "Group", id: conversationId },
      ],
    }),

    updateGroup: builder.mutation<IChatGroupConversation, IUpdateGroupReq>({
      query: ({ conversationId, ...body }) => ({
        url: `${endpoints.chatGroups}/${conversationId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (_result, _error, { conversationId }) => [
        "Chat",
        { type: "Group", id: conversationId },
      ],
    }),

    addGroupMembers: builder.mutation<
      IChatGroupConversation,
      { conversationId: string; memberIds: string[] }
    >({
      query: ({ conversationId, memberIds }) => ({
        url: `${endpoints.chatGroups}/${conversationId}/members`,
        method: "POST",
        data: { memberIds },
      }),
      invalidatesTags: (_result, _error, { conversationId }) => [
        "Chat",
        { type: "Group", id: conversationId },
      ],
    }),

    removeGroupMember: builder.mutation<
      IRemoveGroupMemberRes,
      { conversationId: string; userId: string }
    >({
      query: ({ conversationId, userId }) => ({
        url: `${endpoints.chatGroups}/${conversationId}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { conversationId }) => [
        "Chat",
        { type: "Group", id: conversationId },
      ],
    }),

    leaveGroup: builder.mutation<ILeaveGroupRes, string>({
      query: (conversationId) => ({
        url: `${endpoints.chatGroups}/${conversationId}/leave`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, conversationId) => [
        "Chat",
        { type: "Group", id: conversationId },
      ],
    }),

    // Broadcast lists — saved recipient lists; sending fans out into
    // independent 1-on-1 DMs. See FE integration guide for the full model.
    broadcastLists: builder.query<
      IChatBroadcastListsRes,
      ChatBroadcastListsProps
    >({
      query: (params) => ({
        url: endpoints.chatBroadcasts,
        method: "GET",
        params,
      }),
      providesTags: ["Broadcast"],
    }),

    createBroadcastList: builder.mutation<
      IChatBroadcastList,
      ICreateBroadcastListReq
    >({
      query: (body) => ({
        url: endpoints.chatBroadcasts,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Broadcast"],
    }),

    broadcastListDetails: builder.query<IChatBroadcastListDetails, string>({
      query: (broadcastListId) => ({
        url: `${endpoints.chatBroadcasts}/${broadcastListId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, broadcastListId) => [
        { type: "Broadcast", id: broadcastListId },
      ],
    }),

    updateBroadcastList: builder.mutation<
      IChatBroadcastList,
      IUpdateBroadcastListReq
    >({
      query: ({ broadcastListId, ...body }) => ({
        url: `${endpoints.chatBroadcasts}/${broadcastListId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: (_result, _error, { broadcastListId }) => [
        "Broadcast",
        { type: "Broadcast", id: broadcastListId },
      ],
    }),

    addBroadcastMembers: builder.mutation<
      IChatBroadcastList,
      { broadcastListId: string; memberIds: string[] }
    >({
      query: ({ broadcastListId, memberIds }) => ({
        url: `${endpoints.chatBroadcasts}/${broadcastListId}/members`,
        method: "POST",
        data: { memberIds },
      }),
      invalidatesTags: (_result, _error, { broadcastListId }) => [
        "Broadcast",
        { type: "Broadcast", id: broadcastListId },
      ],
    }),

    removeBroadcastMember: builder.mutation<
      IRemoveBroadcastMemberRes,
      { broadcastListId: string; userId: string }
    >({
      query: ({ broadcastListId, userId }) => ({
        url: `${endpoints.chatBroadcasts}/${broadcastListId}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { broadcastListId }) => [
        "Broadcast",
        { type: "Broadcast", id: broadcastListId },
      ],
    }),

    deleteBroadcastList: builder.mutation<IDeleteBroadcastListRes, string>({
      query: (broadcastListId) => ({
        url: `${endpoints.chatBroadcasts}/${broadcastListId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, broadcastListId) => [
        "Broadcast",
        { type: "Broadcast", id: broadcastListId },
      ],
    }),

    sendBroadcast: builder.mutation<ISendBroadcastRes, ISendBroadcastReq>({
      query: ({ broadcastListId, content }) => ({
        url: `${endpoints.chatBroadcasts}/${broadcastListId}/send`,
        method: "POST",
        data: { content },
      }),
      invalidatesTags: (_result, _error, { broadcastListId }) => [
        { type: "Broadcast", id: broadcastListId },
      ],
    }),

    broadcastMessages: builder.query<
      IChatBroadcastMessagesRes,
      ChatBroadcastMessagesProps
    >({
      query: ({ broadcastListId, ...params }) => ({
        url: `${endpoints.chatBroadcasts}/${broadcastListId}/messages`,
        method: "GET",
        params,
      }),
      providesTags: (_result, _error, { broadcastListId }) => [
        { type: "Broadcast", id: `${broadcastListId}-messages` },
      ],
    }),
  }),
});

export const {
  useChatUsersQuery,
  useSendDirectMessageMutation,
  useChatConversationsQuery,
  useChatUnreadCountQuery,
  useLazyChatUnreadCountQuery,
  useChatPresenceQuery,
  useFetchConversationMessagesQuery,
  useLazyFetchConversationMessagesQuery,
  useSendMessageMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,
  useMarkConversationReadMutation,
  useUpdateConversationSettingsMutation,
  useCreateGroupMutation,
  useGroupDetailsQuery,
  useUpdateGroupMutation,
  useAddGroupMembersMutation,
  useRemoveGroupMemberMutation,
  useLeaveGroupMutation,
  useBroadcastListsQuery,
  useCreateBroadcastListMutation,
  useBroadcastListDetailsQuery,
  useUpdateBroadcastListMutation,
  useAddBroadcastMembersMutation,
  useRemoveBroadcastMemberMutation,
  useDeleteBroadcastListMutation,
  useSendBroadcastMutation,
  useBroadcastMessagesQuery,
} = chatSystemApi;
