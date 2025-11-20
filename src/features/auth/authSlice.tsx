import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  user: any | null;
  accessToken: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },

    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
    },
  },
});

export const { setCredentials, setAccessToken, logout } =
  authSlice.actions;

export default authSlice.reducer;
