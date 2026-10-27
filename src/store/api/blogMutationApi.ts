import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const blogMutationApi = createApi({
  reducerPath: "blogMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Blog"],
  endpoints: (builder) => ({
    // POST /blogs - Create a new blog
    createBlog: builder.mutation<any, { body: any; language: Language }>({
      query: ({ body, language }) => ({
        url: `${endpoints.blogs}?locale=${language}`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Blog"],
    }),

    // PATCH /blogs/{blogId} - Update a blog
    updateBlog: builder.mutation<
      any,
      { body: any; blogId: string; language: Language }
    >({
      query: ({ body, blogId, language }) => ({
        url: `${endpoints.blogs}/${blogId}?locale=${language}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Blog"],
    }),

    // POST /blogs/generate-seo - Generate SEO for blog
    generateBlogSeo: builder.mutation<any, any>({
      query: (body) => ({
        url: endpoints.blogGenerateSeo,
        method: "POST",
        data: body,
      }),
    }),

    // Delete blog
    deleteBlog: builder.mutation<any, string[]>({
      query: (blogIds) => ({
        url: endpoints.blogs,
        method: "DELETE",
        data: blogIds,
      }),
    }),
  }),
});

export const {
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useGenerateBlogSeoMutation,
} = blogMutationApi;
