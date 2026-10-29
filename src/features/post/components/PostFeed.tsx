"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { getPosts } from "../post.slice";
import PostCard from "./PostCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Newspaper } from "lucide-react";

export default function PostFeed() {
  const dispatch = useAppDispatch();

  const { feedItems, feedLoading, feedError, feedTotal } = useAppSelector(
    (state) => state.posts,
  );
  useEffect(() => {
    if (feedItems.length === 0) {
      void dispatch(getPosts({ skip: 0, limit: 10 }));
    }
  }, [dispatch, feedItems.length]);

  if (feedLoading && feedItems.length === 0) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading posts">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border bg-card p-6"
          >
            <div className="h-4 w-36 rounded bg-muted" />
            <div className="mt-5 h-5 w-3/4 rounded bg-muted" />
            <div className="mt-3 h-4 w-full rounded bg-muted" />
            <div className="mt-2 h-4 w-2/3 rounded bg-muted" />
          </div>
        ))}
        <span className="sr-only">Loading the latest posts...</span>
      </div>
    );
  }

  if (feedError && feedItems.length === 0) {
    return (
      <Card className="border-destructive/20 shadow-none">
        <CardContent className="items-center gap-3 py-10 text-center">
          <p role="alert" className="text-sm text-destructive">
            {feedError}
          </p>
          <Button
          type="button"
            variant="outline"
            onClick={() => void dispatch(getPosts({ skip: 0, limit: 10 }))}
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      {feedItems.length === 0 && !feedLoading && (
        <Card className="border-dashed bg-transparent shadow-none">
          <CardContent className="items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Newspaper aria-hidden="true" className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold">Your feed is ready for a first post</p>
              <p className="text-sm text-muted-foreground">
                Check back soon to see what the community is sharing.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {feedError && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {feedError}
        </p>
      )}

      {feedItems.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {feedItems.length > 0 && feedItems.length < feedTotal && (
        <div className="flex flex-col items-center gap-2 pt-2">
          <p className="text-xs text-muted-foreground">
            Showing {feedItems.length} of {feedTotal} posts
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              void dispatch(
                getPosts({ skip: feedItems.length, limit: 10 }),
              )
            }
            disabled={feedLoading}
          >
            {feedLoading ? (
              <>
                <Loader2 aria-hidden="true" className="animate-spin" />
                Loading posts...
              </>
            ) : feedError ? (
              "Try loading more"
            ) : (
              "Load more posts"
            )}
          </Button>
        </div>
      )}
    </section>
  );
}
