import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

interface IDynamicPageBody {
  status: "DRAFT" | "APPROVED";
  externalApiId: string;
  type: "terms_and_condition" | "privacy" | "business_regulation";
  title: string;
  subTitle?: string;
  description: string;
}

interface IDynamicPageRes {
  _id: string;
  message: string;
}

interface IDynamicPageData {
  data: {
    _id: string;
    type: "terms_and_condition" | "privacy" | "business_regulation";
    title: string;
    subTitle?: string;
    description: string;
    status: "DRAFT" | "APPROVED";
  }[];
  totalData: number;
  meta: {
    page: number;
    limit: number;
  };
}

interface IDynamicPageGetParams {
  externalApiId: string;
}

export const dynamicPageApi = createApi({
  reducerPath: "dynamicPageApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["dynamicPageData"],

  endpoints: (builder) => ({
    createDynamicPage: builder.mutation<IDynamicPageRes, IDynamicPageBody>({
      query: (body) => ({
        url: endpoints.dynamicPage,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["dynamicPageData"],
    }),

    updateDynamicPage: builder.mutation<
      IDynamicPageRes,
      { body: IDynamicPageBody; _id: string }
    >({
      query: ({ body, _id }) => ({
        url: `${endpoints.dynamicPage}/${_id}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["dynamicPageData"],
    }),

    getDynamicPages: builder.query<
      IDynamicPageData | null,
      IDynamicPageGetParams
    >({
      query: ({ externalApiId }) => ({
        url: `${endpoints.dynamicPage}?externalApiId=${externalApiId}`,
        method: "GET",
      }),
      providesTags: ["dynamicPageData"],
    }),
  }),
});

export const {
  useCreateDynamicPageMutation,
  useUpdateDynamicPageMutation,
  useGetDynamicPagesQuery,
} = dynamicPageApi;
