import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const blogMutationApi = createApi({
  reducerPath: "blogMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Blog"],
  endpoints: (builder) => ({
    // POST /blogs - Create a new blog
    createBlog: builder.mutation<any, any>({
      query: (body) => ({
        url: `${endpoints.blogs}`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Blog"],
    }),

    // PATCH /blogs/{blogId} - Update a blog
    updateBlog: builder.mutation<any, { body: any; blogId: string }>({
      query: ({ body, blogId }) => ({
        url: `${endpoints.blogs}/${blogId}`,
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
  }),
});

export const {
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useGenerateBlogSeoMutation,
} = blogMutationApi;
