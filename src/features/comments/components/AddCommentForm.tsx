"use client";

import { FormEvent, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { addPostComment } from "../comments.slice";

interface AddCommentFormProps {
  postId: number;
}

export default function AddCommentForm({ postId }: AddCommentFormProps) {
  const dispatch = useAppDispatch();
  const [body, setBody] = useState("");

  const { adding, addError } = useAppSelector((state) => state.comments);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedBody = body.trim();
    if (!trimmedBody || adding) return;

    try {
      await dispatch(addPostComment({ postId, body: trimmedBody })).unwrap();

      setBody("");
    } catch {
      // The error is displayed from Redux state.
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Write a comment..."
        maxLength={2000}
        required
        rows={3}
        className="w-full rounded-md border bg-background p-3 text-sm"
      />

      {addError && (
        <p role="alert" className="text-sm text-destructive">
          {addError}
        </p>
      )}

      <button
        type="submit"
        disabled={adding || !body.trim()}
        className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
      >
        {adding ? "Posting..." : "Post comment"}
      </button>
    </form>
  );
}
