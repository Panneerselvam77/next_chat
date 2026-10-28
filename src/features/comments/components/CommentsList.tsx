"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { clearComments, getPostComments } from "../comments.slice";
import CommentCard from "./CommentCard";

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
    return <p>Loading comments...</p>;
  }

  if (loading && items.length === 0) {
    return <p>Loading comments...</p>;
  }

  if (error && isCurrentPost) {
    return (
      <div className="space-y-3">
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>

        <button
          type="button"
          className="rounded-md border px-4 py-2"
          onClick={() => void dispatch(getPostComments(postId))}
        >
          Retry
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No comments yet.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
