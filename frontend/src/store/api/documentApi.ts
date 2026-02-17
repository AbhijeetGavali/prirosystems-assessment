import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  ApiResponse,
  Document,
  PaginatedResponse,
  DashboardStats,
  DocumentStatus,
} from "../../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const documentApi = createApi({
  reducerPath: "documentApi",
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
  tagTypes: ["Document", "Dashboard"],
  endpoints: (builder) => ({
    createDocument: builder.mutation<
      ApiResponse<Document>,
      {
        title: string;
        description: string;
        fileLink: string;
        approverIds: string[];
      }
    >({
      query: (body) => ({
        url: "/documents",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Document", "Dashboard"],
    }),
    getDocuments: builder.query<
      ApiResponse<PaginatedResponse<Document>>,
      { page?: number; limit?: number; status?: DocumentStatus }
    >({
      query: ({ page = 1, limit = 10, status }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (status) params.append("status", status);
        return `/documents?${params.toString()}`;
      },
      providesTags: ["Document"],
    }),
    getDocumentById: builder.query<ApiResponse<Document>, string>({
      query: (id) => `/documents/${id}`,
      providesTags: ["Document"],
    }),
    getPendingDocuments: builder.query<ApiResponse<Document[]>, void>({
      query: () => "/documents/pending",
      providesTags: ["Document"],
    }),
    approveDocument: builder.mutation<
      ApiResponse<Document>,
      { id: string; comment?: string }
    >({
      query: ({ id, comment }) => ({
        url: `/documents/${id}/approve`,
        method: "POST",
        body: { comment },
      }),
      invalidatesTags: ["Document", "Dashboard"],
    }),
    rejectDocument: builder.mutation<
      ApiResponse<Document>,
      { id: string; comment?: string }
    >({
      query: ({ id, comment }) => ({
        url: `/documents/${id}/reject`,
        method: "POST",
        body: { comment },
      }),
      invalidatesTags: ["Document", "Dashboard"],
    }),
    getDashboard: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => "/documents/dashboard",
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useCreateDocumentMutation,
  useGetDocumentsQuery,
  useGetDocumentByIdQuery,
  useGetPendingDocumentsQuery,
  useApproveDocumentMutation,
  useRejectDocumentMutation,
  useGetDashboardQuery,
} = documentApi;
