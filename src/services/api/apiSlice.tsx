import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    credentials: "include", // For HttpOnly cookie
  }),
  tagTypes: ["Auth", "User"],
  endpoints: () => ({}),
});
