import { createApi } from '@reduxjs/toolkit/query/react';
import { ApiResponse, User } from '../../types';
import { baseQueryWithReauth } from './baseQuery';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithReauth,
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
