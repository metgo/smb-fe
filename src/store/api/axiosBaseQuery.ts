import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import axiosInstance from "@/lib/axios";

const cleanParams = (params?: Record<string, any>) => {
  if (!params) return undefined;

  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
};

export const axiosBaseQuery =
  (): BaseQueryFn<
    {
      url: string;
      method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
      data?: any;
      params?: Record<string, any>;
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
        params: cleanParams(params),
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
