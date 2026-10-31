import { notFound } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { ArrowLeft, MessageSquareText } from "lucide-react";
import { fetchPostById } from "@/features/post/posts.api";
import PostCard from "@/features/post/components/PostCard";
import CommentsList from "@/features/comments/components/CommentsList";
import { buttonVariants } from "@/components/ui/button";
import AddCommentForm from "@/features/comments/components/AddCommentForm";

export const instant = false;

interface PostPageProps {
  params: Promise<{ postId: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params;
  const id = Number(postId);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  await connection();

  let post;

  try {
    post = await fetchPostById(id);
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
      <PostCard post={post} />
      <section className="space-y-4" aria-labelledby="discussion-heading">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageSquareText aria-hidden="true" className="size-5" />
          </div>
          <div>
            <h2 id="discussion-heading" className="text-xl font-semibold">
              Discussion
            </h2>
            <p className="text-sm text-muted-foreground">
              Join the conversation around this post.
            </p>
          </div>
        </div>
        <AddCommentForm postId={id} />
        <CommentsList postId={id} />
      </section>
    </main>
  );
}
