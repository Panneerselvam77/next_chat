import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api/config";
import { getAuthenticatedUser } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return NextResponse.json(
        { message: "Username and password are required." },
        { status: 400 },
      );
    }

    const form = new URLSearchParams({
      username: username.trim(),
      password,
    });
    const response = await fetch(`${API_BASE_URL}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail ?? "Invalid credentials." },
        { status: response.status },
      );
    }

    if (typeof data.access_token !== "string" || !data.access_token) {
      return NextResponse.json(
        { detail: "The login response did not include an access token." },
        { status: 502 },
      );
    }

    const user = await getAuthenticatedUser(data.access_token);
    if (!user) {
      return NextResponse.json(
        { detail: "Unable to retrieve the authenticated user." },
        { status: 502 },
      );
    }

    const result = NextResponse.json({ user });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge:
        typeof data.expires_in === "number" && data.expires_in > 0
          ? data.expires_in
          : 60 * 30,
    };

    result.cookies.set("accessToken", data.access_token, cookieOptions);

    return result;
  } catch {
    return NextResponse.json(
      { detail: "Unable to log in. Please try again." },
      { status: 502 },
    );
  }
}
