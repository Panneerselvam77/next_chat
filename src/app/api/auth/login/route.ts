import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://dummyjson.com";

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

    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.trim(),
        password,
        expiresInMins: 30,
      }),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message ?? "Invalid credentials." },
        { status: response.status },
      );
    }

    const result = NextResponse.json({
      user: {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        image: data.image,
      },
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 30,
    };

    result.cookies.set("accessToken", data.accessToken, cookieOptions);

    result.cookies.set("refreshToken", data.refreshToken, cookieOptions);

    return result;
  } catch {
    return NextResponse.json(
      { message: "Unable to log in. Please try again." },
      { status: 500 },
    );
  }
}
