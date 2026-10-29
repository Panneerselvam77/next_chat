import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetchUserById, fetchUserPosts } from "@/features/users/users.api";
import UserProfile from "@/features/users/components/UserProfile";
import UserPosts from "@/features/users/components/UserPosts";
import { buttonVariants } from "@/components/ui/button";

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
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:py-10">
      <Link
        href="/feed"
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        <ArrowLeft aria-hidden="true" />
        Back to feed
      </Link>
      <UserProfile user={userResult.value} />
      <UserPosts posts={postsResult.value.posts} />
    </main>
  );
}
