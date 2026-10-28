import { notFound } from "next/navigation";
import { fetchPostById } from "@/features/post/posts.api";
import PostCard from "@/features/post/components/PostCard";
import CommentsList from "@/features/comments/components/CommentsList";

interface PostPageProps {
  params: Promise<{ postId: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params;
  const id = Number(postId);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  let post;

  try {
    post = await fetchPostById(id);
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <PostCard post={post} />
      {/* We'll add the comments component here next. */}
      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-bold">Comments</h2>
        <CommentsList postId={id} />
      </section>
    </main>
  );
}
