import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api/config";

export async function POST(request: NextRequest) {
  let details: unknown;

  try {
    details = await request.json();
  } catch {
    return NextResponse.json(
      { message: "A valid registration request is required." },
      { status: 400 },
    );
  }

  if (
    typeof details !== "object" ||
    details === null ||
    !("username" in details) ||
    !("email" in details) ||
    !("password" in details) ||
    typeof details.username !== "string" ||
    typeof details.email !== "string" ||
    typeof details.password !== "string" ||
    !details.username.trim() ||
    !details.email.trim() ||
    !details.password
  ) {
    return NextResponse.json(
      { message: "Username, email, and password are required." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: details.username.trim(),
        email: details.email.trim(),
        password: details.password,
      }),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail ?? "Unable to register." },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { detail: "Unable to register. Please try again." },
      { status: 502 },
    );
  }
}
