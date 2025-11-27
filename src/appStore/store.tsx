import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";

// Load state from localStorage (WITHOUT access token for security)
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("authState");
    if (serializedState === null) {
      return undefined;
    }
    const parsedState = JSON.parse(serializedState);

    // Return state but keep accessToken as null (will be fetched via refresh)
    return {
      auth: {
        ...parsedState,
        accessToken: null, // Never store token in localStorage (XSS protection)
      },
    };
  } catch (err) {
    console.error("Could not load state", err);
    return undefined;
  }
};

// Save state to localStorage (WITHOUT access token for security)
const saveState = (state: any) => {
  try {
    // Only save user and role, NOT accessToken
    const stateToSave = {
      user: state.auth.user,
      role: state.auth.role,
      accessToken: null, // Never persist token
    };
    const serializedState = JSON.stringify(stateToSave);
    localStorage.setItem("authState", serializedState);
  } catch (err) {
    console.error("Could not save state", err);
  }
};

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: loadState(), // Load persisted state on app start
});

// Subscribe to store changes and save to localStorage
store.subscribe(() => {
  saveState(store.getState());
});

export default store;
