import type {
  AuthUser,
  LoginCredentials,
  RegisterDetails,
} from "@/features/auth/auth.types";

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Something went wrong.");
  }

  return data as T;
}

export async function loginApi(
  credentials: LoginCredentials,
): Promise<AuthUser> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(credentials),
  });

  const data = await parseResponse<{ user: AuthUser }>(response);
  return data.user;
}

export async function registerApi(details: RegisterDetails): Promise<void> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details),
  });

  await parseResponse<{ message: string }>(response);
}

export async function getCurrentUserApi(): Promise<AuthUser> {
  const response = await fetch("/api/auth/me", {
    credentials: "same-origin",
    cache: "no-store",
  });

  const data = await parseResponse<{ user: AuthUser }>(response);
  return data.user;
}

export async function logoutApi(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin",
  });

  await parseResponse<{ message: string }>(response);
}
