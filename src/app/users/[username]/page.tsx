import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetchUserByUsername, fetchUserPosts } from "@/features/users/users.api";
import type { User } from "@/features/users/users.types";
import type { Post } from "@/features/post/posts.types";
import UserProfile from "@/features/users/components/UserProfile";
import UserPosts from "@/features/users/components/UserPosts";
import { buttonVariants } from "@/components/ui/button";

interface UserPageProps {
  params: Promise<{ username: string }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;
  if (!username) {
    notFound();
  }

  let user: User;
  let posts: Post[];

  try {
    user = await fetchUserByUsername(username);
    posts = await fetchUserPosts(user.id);
  } catch {
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
      <UserProfile user={user} />
      <UserPosts posts={posts} />
    </main>
  );
}
