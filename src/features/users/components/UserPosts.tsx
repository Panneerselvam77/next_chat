import type { Post } from "@/features/post/posts.types";
import PostCard from "@/features/post/components/PostCard";

interface UserPostsProps {
  posts: Post[];
}

export default function UserPosts({ posts }: UserPostsProps) {
  if (posts.length === 0) {
    return (
      <p className="rounded-lg border p-6 text-muted-foreground">
        This user hasn't published any posts yet.
      </p>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">Posts</h2>

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </section>
  );
}
