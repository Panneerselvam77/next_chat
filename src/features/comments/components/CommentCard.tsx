import type { Comment } from "../comments.types";

interface CommentCardProps {
  comment: Comment;
}

export default function CommentCard({ comment }: CommentCardProps) {
  return (
    <article className="rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">{comment.user.fullName}</p>

        <span className="text-xs text-muted-foreground">
          @{comment.user.username}
        </span>
      </div>

      <p className="mt-2 text-sm leading-6">{comment.body}</p>

      <p className="mt-3 text-xs text-muted-foreground">👍 {comment.likes}</p>
    </article>
  );
}
