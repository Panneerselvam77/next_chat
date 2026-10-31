import type { AuthUser } from "@/features/auth/auth.types";
import { API_BASE_URL } from "@/lib/api/config";

export async function getAuthenticatedUser(
  accessToken: string,
): Promise<AuthUser | null> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}
