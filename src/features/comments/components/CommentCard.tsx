import type { Comment } from "../comments.types";
import { UserRound } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface CommentCardProps {
  comment: Comment;
}

export default function CommentCard({ comment }: CommentCardProps) {
  return (
    <Card className="gap-0 rounded-xl border-border/70 shadow-none">
      <CardHeader className="flex flex-row items-center gap-3 px-4 pb-2 pt-4">
        <div className="flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <UserRound aria-hidden="true" className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{comment.author.username}</p>
          <p className="truncate text-xs text-muted-foreground">
            {new Date(comment.created_at).toLocaleString()}
          </p>
        </div>
      </CardHeader>
      <CardContent className="gap-3 px-4 pb-4 pl-16">
        <p className="text-sm leading-6">{comment.body}</p>
      </CardContent>
    </Card>
  );
}
