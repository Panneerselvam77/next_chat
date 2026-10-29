"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { togglePostLike } from "../post.slice";
import Link from "next/link";
import type { Post } from "../posts.types";
import { Eye, Heart, MessageCircle, ThumbsDown, UserRound } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
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

  const liked = useAppSelector((state) =>
    state.posts.likedPostIds.includes(post.id),
  );

  const liking = useAppSelector((state) =>
    state.posts.likeLoadingIds.includes(post.id),
  );

  const likeError = useAppSelector((state) => state.posts.likeError);

  function handleLike() {
    if (liking) return;

    dispatch(
      togglePostLike({
        postId: post.id,
        liked: !liked,
        currentLikes: post.reactions.likes,
      }),
    );
  }

  return (
    <Card className="gap-0 rounded-2xl border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between gap-3 px-5 pb-3 pt-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound aria-hidden="true" className="size-5" />
          </div>
          <div className="min-w-0">
            <Link
              href={`/users/${post.userId}`}
              className="text-sm font-semibold hover:text-primary hover:underline"
            >
              Community member
            </Link>
            <p className="text-xs text-muted-foreground">
              Member #{post.userId}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          <Eye aria-hidden="true" className="size-3.5" />
          <span>{post.views.toLocaleString()} views</span>
        </div>
      </CardHeader>

      <CardContent className="gap-0 px-5 pb-5 sm:px-6">
        <h2 className="text-lg font-semibold tracking-tight">{post.title}</h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
          {post.body}
        </p>

        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {likeError && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {likeError}
          </p>
        )}
      </CardContent>

      <CardFooter className="justify-between gap-2 border-t border-border/70 px-4 py-2.5 sm:px-5">
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
            {post.reactions.likes}
          </Button>
          <span
            className="inline-flex h-8 items-center gap-1.5 px-2 text-sm text-muted-foreground"
            aria-label={`${post.reactions.dislikes} dislikes`}
          >
            <ThumbsDown aria-hidden="true" className="size-4" />
            {post.reactions.dislikes}
          </span>
        </div>

        <Link
          href={`/posts/${post.id}`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <MessageCircle aria-hidden="true" />
          View discussion
        </Link>
      </CardFooter>
    </Card>
  );
}
