import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 },
      );
    }

    const response = await fetch("https://dummyjson.com/auth/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Session expired. Please log in again." },
        { status: 401 },
      );
    }

    const user = await response.json();

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        image: user.image,
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to retrieve session." },
      { status: 500 },
    );
  }
}
