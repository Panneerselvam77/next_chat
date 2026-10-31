"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Send, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch } from "@/hooks/hooks";
import {
  createPost,
  ensurePostVisible,
  getPosts,
} from "../post.slice";
import { getApiRequestErrorMessage } from "@/lib/api/errors";

interface CreatePostFormProps {
  username: string;
}

export default function CreatePostForm({ username }: CreatePostFormProps) {
  const dispatch = useAppDispatch();
  const avatarLabel = username?.charAt(0).toUpperCase() ?? "";
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const post = await dispatch(createPost(trimmedContent)).unwrap();
      setContent("");
      try {
        await dispatch(getPosts({ limit: 20 })).unwrap();
      } catch (reason) {
        setError(
          `Post published, but the feed could not be refreshed: ${getApiRequestErrorMessage(
            reason,
            "Unable to refresh the feed.",
          )}`,
        );
      } finally {
        dispatch(ensurePostVisible(post));
      }
    } catch (reason) {
      setError(
        typeof reason === "string"
          ? reason
          : reason instanceof Error
            ? reason.message
            : "Unable to create post.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="compose"
      aria-label="Create a post"
      className="border-b border-border px-4 py-4 sm:px-5"
    >
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary"
        >
          {avatarLabel || <UserRound className="size-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <label className="sr-only" htmlFor="new-post-content">
            Post content
          </label>
          <Textarea
            id="new-post-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="What is happening?!"
            maxLength={5000}
            required
            rows={3}
            aria-describedby="new-post-count"
            className="min-h-24 resize-y rounded-none border-0 bg-transparent px-0 py-2 text-lg shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
          />
          <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-3">
            <p id="new-post-count" className="text-xs text-muted-foreground">
              {content.length} / 5000
            </p>
            <Button
              type="submit"
              size="sm"
              className="min-w-24 rounded-full px-5 font-bold"
              disabled={submitting || !content.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 aria-hidden="true" className="animate-spin" />
                  Posting
                </>
              ) : (
                <>
                  <Send aria-hidden="true" />
                  Post
                </>
              )}
            </Button>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
