import api from "./axiosInstance";
import { setCredentials } from "../../features/auth/authSlice";

interface LoginResponse {
  data: {
    user: any;
    accessToken: string;
  };
}

export const loginApi = (values: any) => async (dispatch: any) => {
  const res = await api.post<LoginResponse>("/auth/login", values);

  dispatch(
    setCredentials({
      user: res.data.data.user,
      accessToken: res.data.data.accessToken,
    })
  );

  return res.data;
};
