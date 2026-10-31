"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { togglePostLike } from "../post.slice";
import Link from "next/link";
import type { Post } from "../posts.types";
import { Heart, MessageCircle, UserRound } from "lucide-react";
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

  const liked = useAppSelector(
    (state) => state.posts.likeStates[post.id] ?? post.liked_by_me,
  );
  const likesCount = useAppSelector(
    (state) => state.posts.likeCounts[post.id] ?? post.likes_count,
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
        currentLikes: likesCount,
        currentLiked: liked,
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
              href={`/users/${encodeURIComponent(post.author.username)}`}
              className="text-sm font-semibold hover:text-primary hover:underline"
            >
              {post.author.username}
            </Link>
            <p className="text-xs text-muted-foreground">
              {new Date(post.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          Post #{post.id}
        </span>
      </CardHeader>

      <CardContent className="gap-0 px-5 pb-5 sm:px-6">
        <p className="whitespace-pre-line text-sm leading-6">{post.content}</p>

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
            {likesCount}
          </Button>
        </div>

        <Link
          href={`/posts/${post.id}`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <MessageCircle aria-hidden="true" />
          {post.comments_count} comments · View discussion
        </Link>
      </CardFooter>
    </Card>
  );
}
