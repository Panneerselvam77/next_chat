import type { AuthUser } from "@/features/auth/auth.types";

export async function getAuthenticatedUser(
  accessToken: string,
): Promise<AuthUser | null> {
  const response = await fetch("https://dummyjson.com/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const user = await response.json();

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    gender: user.gender,
    image: user.image,
  };
}
