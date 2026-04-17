import { apiSlice } from "./apiSlice";

export interface AcademicRecord {
  record_id: string;
  user_id: string;
  academic_profile: "schooling" | "college";
  class_name?: string | null;
  board?: string | null;
  degree?: string | null;
  university?: string | null;
  percentage: number;
  grade?: string | null;
  certificate_path?: string | null;
  storage_type?: "local" | "s3" | null;
  created_at: string;
  updated_at: string;
  user?: {
    user_id: string;
    full_name: string;
    email: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  status: number;
  data: T;
  message: string;
}

export const academicRecordsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addAcademicRecord: builder.mutation<
      ApiResponse<AcademicRecord>,
      FormData
    >({
      query: (body) => ({
        url: "/academic-records",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AcademicRecord", "TrustScore"],
    }),
    getMyAcademicRecords: builder.query<ApiResponse<AcademicRecord[]>, void>({
      query: () => "/academic-records/my",
      providesTags: ["AcademicRecord"],
    }),
    getAllAcademicRecords: builder.query<ApiResponse<AcademicRecord[]>, void>({
      query: () => "/academic-records",
      providesTags: ["AcademicRecord"],
    }),
    deleteAcademicRecord: builder.mutation<ApiResponse<{ record_id: string }>, string>({
      query: (recordId) => ({
        // Use POST fallback to avoid DELETE method blocking in some deployments.
        url: `/academic-records/${recordId}/delete`,
        method: "POST",
      }),
      invalidatesTags: ["AcademicRecord", "TrustScore"],
    }),
  }),
});

export const {
  useAddAcademicRecordMutation,
  useGetMyAcademicRecordsQuery,
  useGetAllAcademicRecordsQuery,
  useDeleteAcademicRecordMutation,
} = academicRecordsApi;
