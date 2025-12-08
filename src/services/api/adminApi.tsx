import { apiSlice } from "./apiSlice";

export interface CreateAdminRequest {
  email: string;
  password: string;
  role: string; // roleName from the roles table
  full_name?: string;
  mobile_number?: string;
}

export interface AdminProfile {
  user_id: string;
  email: string;
  full_name: string;
  mobile_number?: string;
  role: {
    roleName: "admin" | "subadmin";
  };
  created_at: string;
  updated_at: string;
}

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

export interface CreateAdminResponse {
  success: boolean;
  status: number;
  data: AdminProfile;
  message: string;
}

export interface AdminsListResponse {
  success: boolean;
  status: number;
  data: AdminProfile[];
  message: string;
  pagination?: PaginationMeta;
}

export interface AdminDetailResponse {
  success: boolean;
  status: number;
  data: AdminProfile;
  message: string;
}

export interface UpdateAdminRequest {
  full_name?: string;
  email?: string;
  mobile_number?: string;
  password?: string;
  role?: string;
}

export interface Role {
  id: string;
  roleName: string;
  roleType: string;
  permission_json: any;
  created_at?: string;
  updated_at?: string;
}

export interface RolesResponse {
  success?: boolean;
  status?: number;
  data?: Role[];
  message?: string;
}

export interface CreateRoleRequest {
  roleName: string;
  roleType: "student" | "employer" | "superAdmin" | "admin";
  permission_json?: any[];
}

export interface CreateRoleResponse {
  message: string;
  data: Role;
}

export interface UpdateRoleRequest {
  roleName?: string;
  permission_json?: any[];
}

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create admin or subadmin (superadmin only)
    createAdmin: builder.mutation<CreateAdminResponse, CreateAdminRequest>({
      query: (data) => ({
        url: "/auth/create-subadmin",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Get all admins/subadmins (superadmin only)
    getAllAdmins: builder.query<AdminsListResponse, PaginationParams | void>({
      query: (params = {}) => {
        const { page = 1, limit = 10 } = params || {};
        return {
          url: "/auth/subadmins",
          method: "GET",
          params: {
            page,
            limit,
          },
        };
      },
      providesTags: ["User"],
    }),

    // Get admin/subadmin by ID (superadmin only)
    getAdminById: builder.query<AdminDetailResponse, string>({
      query: (id) => ({
        url: `/auth/subadmins/${id}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    // Update admin/subadmin (superadmin only)
    updateAdmin: builder.mutation<
      AdminDetailResponse,
      { id: string; data: UpdateAdminRequest }
    >({
      query: ({ id, data }) => ({
        url: `/auth/subadmins/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Delete admin/subadmin (superadmin only)
    deleteAdmin: builder.mutation<
      { success: boolean; status: number; message: string },
      string
    >({
      query: (id) => ({
        url: `/auth/subadmins/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    // Get all roles (for dropdown selection)
    getAllRoles: builder.query<Role[], void>({
      query: () => ({
        url: "/roles",
        method: "GET",
      }),
      providesTags: ["Role"],
    }),

    // Get role by ID
    getRoleById: builder.query<Role, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "GET",
      }),
      providesTags: ["Role"],
    }),

    // Create role (superadmin only)
    createRole: builder.mutation<CreateRoleResponse, CreateRoleRequest>({
      query: (data) => ({
        url: "/roles/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Role"],
    }),

    // Update role (superadmin only)
    updateRole: builder.mutation<
      { message: string; data: Role },
      { id: string; data: UpdateRoleRequest }
    >({
      query: ({ id, data }) => ({
        url: `/roles/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Role"],
    }),

    // Delete role (superadmin only)
    deleteRole: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Role"],
    }),
  }),
});

export const {
  useCreateAdminMutation,
  useGetAllAdminsQuery,
  useGetAdminByIdQuery,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useGetAllRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = adminApi;
