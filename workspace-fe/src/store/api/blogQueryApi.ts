import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export const blogQueryApi = createApi({
  reducerPath: "blogQueryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Blog"],
  endpoints: (builder) => ({
    // GET /blogs
    getAllBlogs: builder.query<any, any>({
      query: (params) => ({
        url: endpoints.blogs,
        method: "GET",
        params,
      }),
    }),

    // GET /blogs/{blogId}
    getBlogById: builder.query<
      any,
      { blogId: string | null; language: Language }
    >({
      query: ({ blogId, language }) => ({
        url: `${endpoints.blogs}/${blogId}?locale=${language}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
    }),

    // // POST /blogs
    // createBlog: builder.mutation<any, any>({
    //   query: (data) => ({
    //     url: endpoints.blogs,
    //     method: "POST",
    //     data,
    //   }),
    // }),

    // PATCH /blogs/{blogId}
    // updateBlog: builder.mutation<any, { blogId: string; data: any }>({
    //   query: ({ blogId, data }) => ({
    //     url: `${endpoints.blogs}/${blogId}`,
    //     method: "PATCH",
    //     data,
    //   }),
    // }),

    // POST /blogs/generate-seo
    generateSeo: builder.mutation<any, any>({
      query: (data) => ({
        url: `${endpoints.blogs}/generate-seo`,
        method: "POST",
        data,
      }),
    }),

    generateBlogName: builder.mutation<any, any>({
      query: (data) => ({
        url: `${endpoints.blogs}/generate-blog-name`,
        method: "POST",
        data,
      }),
    }),
  }),
});

export const {
  useGetAllBlogsQuery,
  useGetBlogByIdQuery,
  useLazyGetBlogByIdQuery,
  // useCreateBlogMutation,
  // useUpdateBlogMutation,
  useGenerateSeoMutation,
  useGenerateBlogNameMutation,
} = blogQueryApi;
