"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { searchPosts, resetSearch } from "../post.slice";
import PostCard from "./PostCard";

export default function PostSearch() {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState("");

  const { feedItems, searchLoading, searchError } = useAppSelector(
    (state) => state.posts,
  );

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      dispatch(resetSearch());
      return;
    }

    const timer = setTimeout(() => {
      const request = dispatch(
        searchPosts({
          query: trimmedQuery,
          skip: 0,
          limit: 10,
        }),
      );

      // The next effect cleanup cancels this request.
      // Store the request in a ref if you need to cancel it
      // after the timer callback has already executed.
    }, 300);

    return () => clearTimeout(timer);
  }, [query, dispatch]);

  return (
    <section className="space-y-4">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search posts..."
        aria-label="Search posts"
      />

      {searchLoading && <p>Searching posts...</p>}

      {searchError && (
        <p role="alert" className="text-sm text-destructive">
          {searchError}
        </p>
      )}

      {!searchLoading &&
        !searchError &&
        query.trim() &&
        feedItems.length === 0 && <p>No posts found.</p>}

      {feedItems.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </section>
  );
}
