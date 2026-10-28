import Link from "next/link";
import type { Post } from "../posts.types";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">
            <Link
              href={`/users/${post.userId}`}
              className="text-sm font-semibold hover:underline"
            >
              User #{post.userId}
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            {post.views.toLocaleString()} views
          </p>
        </div>

        <span className="text-sm text-muted-foreground">#{post.id}</span>
      </div>

      <h2 className="mb-2 text-lg font-semibold">{post.title}</h2>

      <p className="text-sm leading-6 text-muted-foreground">{post.body}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-secondary px-3 py-1 text-xs"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <p className="text-sm">
          👍 {post.reactions.likes}
          <span className="mx-2 text-muted-foreground">·</span>
          👎 {post.reactions.dislikes}
        </p>
        <Link
          href={`/posts/${post.id}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          View post →
        </Link>
      </div>
    </article>
  );
}
