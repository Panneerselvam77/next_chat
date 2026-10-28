import { notFound } from "next/navigation";
import { fetchUserById, fetchUserPosts } from "@/features/users/users.api";
import UserProfile from "@/features/users/components/UserProfile";
import UserPosts from "@/features/users/components/UserPosts";

interface UserPageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { userId } = await params;
  const id = Number(userId);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const [userResult, postsResult] = await Promise.allSettled([
    fetchUserById(id),
    fetchUserPosts(id),
  ]);

  if (userResult.status === "rejected" || postsResult.status === "rejected") {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <UserProfile user={userResult.value} />
      <UserPosts posts={postsResult.value.posts} />
    </main>
  );
}
