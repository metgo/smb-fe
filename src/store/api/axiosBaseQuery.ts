import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import axiosInstance from "@/lib/axios";

export const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string;
      method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
      data?: any;
      params?: any;
    },
    unknown,
    unknown
  > =>
  async ({ url, method, data, params }) => {
    try {
      const result = await axiosInstance({
        url,
        method,
        data,
        params,
      });
      return { data: result.data };
    } catch (axiosError: any) {
      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        },
      };
    }
  };
