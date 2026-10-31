"use client";

import { useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { deletePost, togglePostLike, updatePost } from "../post.slice";
import Link from "next/link";
import type { Post } from "../posts.types";
import {
  Heart,
  Loader2,
  MessageCircle,
  Pencil,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [updatedPost, setUpdatedPost] = useState<Post | null>(null);
  const [mutationLoading, setMutationLoading] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);
  const displayedPost = updatedPost ?? post;
  const isOwner = currentUserId === displayedPost.author.id;

  const liked = useAppSelector(
    (state) =>
      state.posts.likeStates[displayedPost.id] ?? displayedPost.liked_by_me,
  );
  const likesCount = useAppSelector(
    (state) =>
      state.posts.likeCounts[displayedPost.id] ?? displayedPost.likes_count,
  );

  const liking = useAppSelector((state) =>
    state.posts.likeLoadingIds.includes(displayedPost.id),
  );

  const likeError = useAppSelector((state) => state.posts.likeError);

  function getErrorMessage(reason: unknown, fallback: string) {
    return typeof reason === "string"
      ? reason
      : reason instanceof Error
        ? reason.message
        : fallback;
  }

  function handleLike() {
    if (liking) return;

    dispatch(
      togglePostLike({
        postId: displayedPost.id,
        liked: !liked,
        currentLikes: likesCount,
        currentLiked: liked,
      }),
    );
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = editedContent.trim();
    if (!content || mutationLoading) return;

    if (content === displayedPost.content) {
      setEditing(false);
      setMutationError(null);
      return;
    }

    setMutationLoading(true);
    setMutationError(null);
    try {
      const result = await dispatch(
        updatePost({ postId: displayedPost.id, content }),
      ).unwrap();
      setUpdatedPost(result);
      setEditedContent(result.content);
      setEditing(false);
    } catch (reason) {
      setMutationError(getErrorMessage(reason, "Unable to update post."));
    } finally {
      setMutationLoading(false);
    }
  }

  async function handleDelete() {
    if (
      mutationLoading ||
      !window.confirm("Delete this post? This action cannot be undone.")
    ) {
      return;
    }

    setMutationLoading(true);
    setMutationError(null);
    try {
      await dispatch(deletePost(displayedPost.id)).unwrap();
      setDeleted(true);
      if (pathname === `/posts/${displayedPost.id}`) {
        router.replace("/feed");
      }
    } catch (reason) {
      setMutationError(getErrorMessage(reason, "Unable to delete post."));
    } finally {
      setMutationLoading(false);
    }
  }

  if (deleted) return null;

  return (
    <Card className="group/post gap-0 rounded-none border-0 border-b border-border bg-background py-0 text-foreground shadow-none ring-0 transition-colors hover:bg-muted/30">
      <CardHeader className="flex flex-row items-start justify-between gap-3 px-4 pb-1 pt-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
            {displayedPost.author.username.charAt(0).toUpperCase() || (
              <UserRound aria-hidden="true" className="size-5" />
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/users/${encodeURIComponent(displayedPost.author.username)}`}
              className="text-[15px] font-bold hover:underline"
            >
              {displayedPost.author.username}
            </Link>
            <p className="truncate text-sm text-muted-foreground">
              <span>@{displayedPost.author.username}</span>
              <span aria-hidden="true"> · </span>
              <time dateTime={displayedPost.updated_at}>
                {displayedPost.updated_at !== displayedPost.created_at
                  ? `Edited ${new Date(displayedPost.updated_at).toLocaleDateString()}`
                  : new Date(displayedPost.created_at).toLocaleDateString()}
              </time>
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="text-xs text-muted-foreground">
            Post #{displayedPost.id}
          </span>
          {isOwner && !editing && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Edit post"
                onClick={() => {
                  setEditedContent(displayedPost.content);
                  setMutationError(null);
                  setEditing(true);
                }}
                disabled={mutationLoading}
              >
                <Pencil aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Delete post"
                className="text-destructive hover:text-destructive"
                onClick={() => void handleDelete()}
                disabled={mutationLoading}
              >
                {mutationLoading ? (
                  <Loader2 aria-hidden="true" className="animate-spin" />
                ) : (
                  <Trash2 aria-hidden="true" />
                )}
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="gap-0 px-4 pb-3 pl-[4.5rem] sm:px-5 sm:pl-[4.75rem]">
        {editing ? (
          <form onSubmit={handleEdit} className="space-y-3">
            <label className="sr-only" htmlFor={`edit-post-${displayedPost.id}`}>
              Edit post content
            </label>
            <Textarea
              id={`edit-post-${displayedPost.id}`}
              value={editedContent}
              onChange={(event) => setEditedContent(event.target.value)}
              maxLength={5000}
              required
              rows={4}
              className="resize-y bg-background text-sm"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {editedContent.length}/5000
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditing(false);
                    setEditedContent(displayedPost.content);
                    setMutationError(null);
                  }}
                  disabled={mutationLoading}
                >
                  <X aria-hidden="true" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={mutationLoading || !editedContent.trim()}
                >
                  {mutationLoading && (
                    <Loader2 aria-hidden="true" className="animate-spin" />
                  )}
                  Save changes
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <p className="whitespace-pre-line text-sm leading-6">
            {displayedPost.content}
          </p>
        )}

        {mutationError && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {mutationError}
          </p>
        )}
        {!mutationError && likeError && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {likeError}
          </p>
        )}
      </CardContent>

      <CardFooter className="justify-between gap-2 px-4 pb-3 pl-[4.5rem] sm:px-5 sm:pl-[4.75rem]">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={liking}
            aria-pressed={liked}
            aria-label={liked ? "Unlike post" : "Like post"}
            className={liked ? "text-primary hover:text-primary" : ""}
          >
            <Heart aria-hidden="true" className={liked ? "fill-current" : ""} />
            {likesCount}
          </Button>
        </div>

        <Link
          href={`/posts/${displayedPost.id}`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <MessageCircle aria-hidden="true" />
          {displayedPost.comments_count} comments · View discussion
        </Link>
      </CardFooter>
    </Card>
  );
}
