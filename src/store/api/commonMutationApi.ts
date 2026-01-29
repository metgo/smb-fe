import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

interface WebsiteAccessItemProps {
  blacklist: {
    allItems: string[];
    selectedItems: string[];
  };
  whitelist: {
    allItems: string[];
    selectedItems: string[];
  };
  purpose: string;
}

export const commonMutationApi = createApi({
  reducerPath: "commonMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["common"],
  endpoints: (builder) => ({
    createWebsiteAccessItem: builder.mutation<
      any,
      { body: WebsiteAccessItemProps; itemId: string }
    >({
      query: ({ body, itemId }) => ({
        url: `${endpoints.websiteAccessItem}/${itemId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["common"],
    }),
  }),
});

export const { useCreateWebsiteAccessItemMutation } = commonMutationApi;
