import { apiSlice } from "./apiSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // register (kept if needed)
    registerUser: builder.mutation({
      query: (values) => ({
        url: "/auth/register",
        method: "POST",
        body: values,
      }),
    }),

    // 1) send forgot password -> returns resetToken in response.data.resetToken
    forgotPassword: builder.mutation({
      query: (values) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: values,
      }),
    }),

    // 2) verify OTP -> body: { otp, resetToken }
    verifyOtp: builder.mutation({
      query: (values) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body: values,
      }),
    }),

    // 3) reset password -> body: { newPassword, resetToken }
    resetPassword: builder.mutation({
      query: (values) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: values,
      }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
} = authApi;
