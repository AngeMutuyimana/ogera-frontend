import axios from "axios";
import store from "../../appStore/store";
import { setAccessToken, logout } from "../../features/auth/authSlice";

// Refresh token response interface
interface RefreshResponse {
  data: {
    accessToken: string;
  };
}

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // HttpOnly cookies
});

// -----------------------------------
// REQUEST INTERCEPTOR (attach token)
// -----------------------------------
api.interceptors.request.use((config: any) => {
  const token = store.getState().auth.accessToken;

  if (!config.headers) config.headers = {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// -----------------------------------
// RESPONSE INTERCEPTOR (auto refresh)
// -----------------------------------
api.interceptors.response.use(
  (res) => res,

  async (error: any) => {
    const originalRequest = error.config;

    // Handle expired access token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh API
        const refreshResponse = await axios.get<RefreshResponse>(
          "http://localhost:5000/api/auth/refresh",
          { withCredentials: true }
        );

        const newToken = refreshResponse.data.data.accessToken;

        // Update Redux
        store.dispatch(setAccessToken(newToken));

        // Attach new token and retry
        if (!originalRequest.headers) originalRequest.headers = {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);

      } catch (err) {
        // Logout if refresh failed
        store.dispatch(logout());
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
