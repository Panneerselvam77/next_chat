"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { searchPosts, resetSearch } from "../post.slice";
import PostCard from "./PostCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function PostSearch() {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState("");

  const { searchItems, searchLoading, searchError, searchTotal } =
    useAppSelector((state) => state.posts);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      dispatch(resetSearch());
      return;
    }

    const timer = setTimeout(() => {
      void dispatch(
        searchPosts({
          query: trimmedQuery,
          skip: 0,
          limit: 10,
        }),
      );
    }, 300);

    return () => clearTimeout(timer);
  }, [query, dispatch]);

  return (
    <section className="space-y-4">
      <Card className="rounded-2xl border-border/70 shadow-sm">
        <CardContent className="gap-2 p-4 sm:p-5">
          <Label htmlFor="post-search" className="text-sm font-semibold">
            Find something to explore
          </Label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="post-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search posts by keyword or topic..."
              aria-label="Search posts"
              aria-describedby="post-search-hint"
              className="h-11 pl-10 pr-11"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2"
              >
                <X aria-hidden="true" />
              </Button>
            )}
          </div>
          <p id="post-search-hint" className="text-xs text-muted-foreground">
            Results update as you type.
          </p>
        </CardContent>
      </Card>

      {query.trim() && (
        <div className="space-y-4" aria-live="polite">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">
              Search results
              {!searchLoading && searchItems.length > 0 && (
                <span className="ml-2 font-normal text-muted-foreground">
                  {searchTotal} {searchTotal === 1 ? "post" : "posts"}
                </span>
              )}
            </h2>
            {searchLoading && (
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
                Searching
              </span>
            )}
          </div>

          {searchError && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {searchError}
            </p>
          )}

          {!searchLoading &&
            !searchError &&
            searchItems.length === 0 && (
              <Card className="border-dashed bg-transparent shadow-none">
                <CardContent className="items-center gap-1 py-8 text-center">
                  <p className="font-medium">No posts found</p>
                  <p className="text-sm text-muted-foreground">
                    Try another keyword or topic.
                  </p>
                </CardContent>
              </Card>
            )}

          {searchItems.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {!searchLoading &&
            searchItems.length > 0 &&
            searchItems.length < searchTotal && (
              <div className="flex justify-center pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    void dispatch(
                      searchPosts({
                        query: query.trim(),
                        skip: searchItems.length,
                        limit: 10,
                      }),
                    );
                  }}
                  disabled={searchLoading}
                >
                  Load more results
                </Button>
              </div>
            )}
        </div>
      )}
    </section>
  );
}
