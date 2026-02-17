import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse, User } from "../../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getApprovers: builder.query<
      ApiResponse<Array<{ id: string; name: string; email: string }>>,
      void
    >({
      query: () => "/users/approvers",
    }),
    getAllUsers: builder.query<ApiResponse<User[]>, void>({
      query: () => "/users",
    }),
  }),
});

export const { useGetApproversQuery, useGetAllUsersQuery } = userApi;
