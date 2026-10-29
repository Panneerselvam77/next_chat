import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/session";

export default async function HomePage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const user = accessToken ? await getAuthenticatedUser(accessToken) : null;

  redirect(user ? "/feed" : "/login");
}
