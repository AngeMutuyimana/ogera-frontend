import { apiSlice } from "./apiSlice";
import type { UserProfile } from "./profileApi";

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UsersListResponse {
  success: boolean;
  status: number;
  data: UserProfile[];
  message: string;
  pagination?: PaginationMeta;
  counts?: {
    students: number;
    employers: number;
  };
}

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all users (admin / superadmin)
    getAllUsers: builder.query<UsersListResponse, PaginationParams | void>({
      query: (params = {}) => {
        const { page = 1, limit = 10 } = params || {};
        return {
          url: "/auth/get-user",
          method: "GET",
          params: {
            page,
            limit,
          },
        };
      },
      providesTags: ["User"],
    }),

    // Get all students
    getAllStudents: builder.query<UsersListResponse, PaginationParams | void>({
      query: (params = {}) => {
        const { page = 1, limit = 10 } = params || {};
        return {
          url: "/auth/get-students",
          method: "GET",
          params: {
            page,
            limit,
          },
        };
      },
      providesTags: ["User"],
    }),

    // Get all employers
    getAllEmployers: builder.query<UsersListResponse, PaginationParams | void>({
      query: (params = {}) => {
        const { page = 1, limit = 10 } = params || {};
        return {
          url: "/auth/get-employers",
          method: "GET",
          params: {
            page,
            limit,
          },
        };
      },
      providesTags: ["User"],
    }),

    // Get user by ID (admin/superadmin only)
    getUserById: builder.query<
      { success: boolean; status: number; data: UserProfile; message: string },
      string
    >({
      query: (id) => ({
        url: `/auth/users/${id}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    // Update user by ID (admin/superadmin only)
    updateUserById: builder.mutation<
      { success: boolean; status: number; data: UserProfile; message: string },
      { id: string; data: Partial<UserProfile> }
    >({
      query: ({ id, data }) => ({
        url: `/auth/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Delete user (admin/superadmin only)
    deleteUser: builder.mutation<
      { success: boolean; status: number; message: string },
      string
    >({
      query: (id) => ({
        url: `/auth/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetAllStudentsQuery,
  useGetAllEmployersQuery,
  useGetUserByIdQuery,
  useUpdateUserByIdMutation,
  useDeleteUserMutation,
} = usersApi;
