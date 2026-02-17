import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse, AuthResponse, UserRole } from "../../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const authApi = createApi({
  reducerPath: "authApi",
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
    register: builder.mutation<
      ApiResponse<AuthResponse>,
      { name: string; email: string; password: string; role: UserRole }
    >({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
    }),
    login: builder.mutation<
      ApiResponse<AuthResponse>,
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    logout: builder.mutation<ApiResponse<void>, { refreshToken: string }>({
      query: (body) => ({
        url: "/auth/logout",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation, useLogoutMutation } =
  authApi;
