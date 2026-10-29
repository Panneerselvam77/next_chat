import type { Post } from "@/features/post/posts.types";
import PostCard from "@/features/post/components/PostCard";
import { Card, CardContent } from "@/components/ui/card";
import { Newspaper } from "lucide-react";

interface UserPostsProps {
  posts: Post[];
}

export default function UserPosts({ posts }: UserPostsProps) {
  if (posts.length === 0) {
    return (
      <Card className="border-dashed bg-transparent shadow-none">
        <CardContent className="items-center gap-2 py-10 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Newspaper aria-hidden="true" className="size-5" />
          </div>
          <p className="font-medium">No posts yet</p>
          <p className="text-sm text-muted-foreground">
            This member hasn&apos;t shared anything with the community yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Posts</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {posts.length} {posts.length === 1 ? "post" : "posts"} shared
        </p>
      </div>

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </section>
  );
}
