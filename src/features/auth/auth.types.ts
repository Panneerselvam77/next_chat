import type { User } from "@/features/users/users.types";

export type AuthUser = User;

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterDetails {
  username: string;
  email: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
}
