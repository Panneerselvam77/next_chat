"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { clearComments, getPostComments } from "../comments.slice";
import CommentCard from "./CommentCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MessageSquareText } from "lucide-react";

interface CommentsListProps {
  postId: number;
}

export default function CommentsList({ postId }: CommentsListProps) {
  const dispatch = useAppDispatch();

  const { items, loading, error, currentPostId } = useAppSelector(
    (state) => state.comments,
  );

  useEffect(() => {
    void dispatch(getPostComments(postId));

    return () => {
      dispatch(clearComments());
    };
  }, [dispatch, postId]);

  const isCurrentPost = currentPostId === postId;

  if (loading && !isCurrentPost) {
    return (
      <p
        role="status"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        Loading discussion...
      </p>
    );
  }

  if (loading && items.length === 0) {
    return (
      <p
        role="status"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        Loading discussion...
      </p>
    );
  }

  if (error && isCurrentPost) {
    return (
      <Card className="border-destructive/20 shadow-none">
        <CardContent className="items-start gap-3 p-4">
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
          <Button
          type="button"
            variant="outline"
            size="sm"
            onClick={() => void dispatch(getPostComments(postId))}
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="border-dashed bg-transparent shadow-none">
        <CardContent className="items-center gap-2 py-8 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <MessageSquareText aria-hidden="true" className="size-5" />
          </div>
          <p className="font-medium">No replies yet</p>
          <p className="text-sm text-muted-foreground">
            Start the conversation by sharing your thoughts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
