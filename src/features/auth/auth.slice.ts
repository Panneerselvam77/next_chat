import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  getCurrentUserApi,
  loginApi,
  logoutApi,
  registerApi,
} from "@/lib/api/auth-api";

import type {
  AuthState,
  AuthUser,
  LoginCredentials,
  RegisterDetails,
} from "./auth.types";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  initialized: false,
};

export const login = createAsyncThunk<
  AuthUser,
  LoginCredentials,
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    return await loginApi(credentials);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Login failed.",
    );
  }
});

export const register = createAsyncThunk<
  void,
  RegisterDetails,
  { rejectValue: string }
>("auth/register", async (details, { rejectWithValue }) => {
  try {
    await registerApi(details);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Registration failed.",
    );
  }
});

export const getCurrentUser = createAsyncThunk<
  AuthUser,
  void,
  { rejectValue: string }
>("auth/getCurrentUser", async (_, { rejectWithValue }) => {
  try {
    return await getCurrentUserApi();
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Session check failed.",
    );
  }
});

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Logout failed.",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Login failed.";
        state.initialized = true;
      })

      // Registration
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Registration failed.";
      })

      // Restore session
      .addCase(getCurrentUser.pending, (state) => {
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        if (state.isAuthenticated) return;

        state.user = action.payload;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        if (state.isAuthenticated) return;

        state.user = null;
        state.isAuthenticated = false;
        state.initialized = true;

        if (action.payload !== "Not authenticated.") {
          state.error = action.payload ?? null;
        }
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.initialized = true;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Logout failed.";
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
