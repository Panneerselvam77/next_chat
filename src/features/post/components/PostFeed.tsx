"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { getPosts } from "../post.slice";
import PostCard from "./PostCard";

export default function PostFeed() {
  const dispatch = useAppDispatch();

  const { feedItems, feedLoading, feedError } = useAppSelector(
    (state) => state.posts,
  );
  useEffect(() => {
    if (feedItems.length === 0) {
      void dispatch(getPosts({ skip: 0, limit: 10 }));
    }
  }, [dispatch, feedItems.length]);

  if (feedLoading && feedItems.length === 0) {
    return <p className="py-10 text-center">Loading posts...</p>;
  }

  if (feedError && feedItems.length === 0) {
    return (
      <div className="space-y-3 py-10 text-center">
        <p>{feedError}</p>
        <button
          type="button"
          className="rounded-md border px-4 py-2"
          onClick={() => void dispatch(getPosts({ skip: 0, limit: 10 }))}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {feedError && (
        <p role="alert" className="text-sm text-destructive">
          {feedError}
        </p>
      )}

      {feedItems.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </section>
  );
}
