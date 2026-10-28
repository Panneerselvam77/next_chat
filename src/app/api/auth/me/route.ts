import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";

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

    const user = await getAuthenticatedUser(accessToken);
    if (!user) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 },
      );
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { message: "Unable to retrieve session." },
      { status: 500 },
    );
  }
}
