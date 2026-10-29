import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  fetchPosts,
  searchPosts as searchPostsApi,
  likePost as likePostApi,
} from "./posts.api";
import type { Post, PostsState } from "./posts.types";

interface FetchPostsArgs {
  skip?: number;
  limit?: number;
}

interface SearchPostsArgs {
  query: string;
  skip?: number;
  limit?: number;
}

export const getPosts = createAsyncThunk<
  { posts: Post[]; total: number; skip: number; limit: number },
  FetchPostsArgs | undefined,
  { rejectValue: string }
>("posts/fetchPosts", async (args, { rejectWithValue, signal }) => {
  try {
    return await fetchPosts(args?.skip ?? 0, args?.limit ?? 10, signal);
  } catch {
    return rejectWithValue("Unable to load posts. Please try again.");
  }
});

export const searchPosts = createAsyncThunk<
  { posts: Post[]; total: number; skip: number; limit: number },
  SearchPostsArgs,
  { rejectValue: string }
>(
  "posts/searchPosts",
  async ({ query, skip = 0, limit = 10 }, { rejectWithValue, signal }) => {
    try {
      return await searchPostsApi(query, skip, limit, signal);
    } catch {
      return rejectWithValue("Unable to search posts. Please try again.");
    }
  },
);

interface ToggleLikeArgs {
  postId: number;
  liked: boolean;
  currentLikes: number;
}

export const togglePostLike = createAsyncThunk<
  { postId: number; likes: number },
  ToggleLikeArgs,
  { rejectValue: string }
>(
  "posts/toggleLike",
  async ({ postId, liked, currentLikes }, { rejectWithValue, signal }) => {
    const likes = Math.max(0, currentLikes + (liked ? 1 : -1));

    try {
      await likePostApi(postId, likes, signal);
      return { postId, likes };
    } catch {
      return rejectWithValue("Unable to update like. Please try again.");
    }
  },
);

const initialState: PostsState = {
  feedItems: [],
  feedTotal: 0,
  feedSkip: 0,
  feedLoading: false,
  feedError: null,

  searchItems: [],
  searchTotal: 0,
  searchSkip: 0,
  searchQuery: "",
  searchLoading: false,
  searchError: null,
  searchRequestId: null,

  limit: 10,

  likedPostIds: [],
  likeLoadingIds: [],
  likeSnapshots: {},
  likeError: null as string | null,
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearPostsError(state) {
      state.feedError = null;
      state.searchError = null;
    },

    resetSearch(state) {
      state.searchItems = [];
      state.searchTotal = 0;
      state.searchSkip = 0;
      state.searchQuery = "";
      state.searchLoading = false;
      state.searchError = null;
      state.searchRequestId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Feed
      .addCase(getPosts.pending, (state) => {
        state.feedLoading = true;
        state.feedError = null;
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.feedLoading = false;

        if (action.payload.skip === 0) {
          state.feedItems = action.payload.posts;
        } else {
          const existingIds = new Set(state.feedItems.map((post) => post.id));
          state.feedItems.push(
            ...action.payload.posts.filter((post) => !existingIds.has(post.id)),
          );
        }

        state.feedTotal = action.payload.total;
        state.feedSkip = action.payload.skip;
        state.limit = action.payload.limit;
      })
      .addCase(getPosts.rejected, (state, action) => {
        state.feedLoading = false;

        if (action.meta.aborted) return;

        state.feedError =
          action.payload ?? action.error.message ?? "Something went wrong.";
      })

      // Search
      .addCase(searchPosts.pending, (state, action) => {
        state.searchQuery = action.meta.arg.query;
        state.searchRequestId = action.meta.requestId;
        state.searchLoading = true;
        state.searchError = null;

        if ((action.meta.arg.skip ?? 0) === 0) {
          state.searchItems = [];
          state.searchTotal = 0;
          state.searchSkip = 0;
        }
      })
      .addCase(searchPosts.fulfilled, (state, action) => {
        if (state.searchRequestId !== action.meta.requestId) return;

        state.searchLoading = false;
        state.searchError = null;

        const { posts, total, skip } = action.payload;

        if (skip === 0) {
          // First page: replace the previous results
          state.searchItems = posts;
        } else {
          // Next page: append posts without duplicates
          const existingIds = new Set(state.searchItems.map((post) => post.id));

          state.searchItems.push(
            ...posts.filter((post) => !existingIds.has(post.id)),
          );
        }

        state.searchTotal = total;
        state.searchSkip = skip;
      })
      .addCase(searchPosts.rejected, (state, action) => {
        if (state.searchRequestId !== action.meta.requestId) return;

        state.searchLoading = false;

        if (action.meta.aborted) return;

        state.searchError = action.payload ?? "Unable to search posts.";
      })
      .addCase(togglePostLike.pending, (state, action) => {
        const { postId, liked } = action.meta.arg;

        if (state.likeLoadingIds.includes(postId)) return;

        const post =
          state.feedItems.find((item) => item.id === postId) ??
          state.searchItems.find((item) => item.id === postId);

        if (!post) return;

        // Save the original values for rollback.
        state.likeSnapshots[postId] = {
          likes: post.reactions.likes,
          liked: state.likedPostIds.includes(postId),
        };

        state.likeLoadingIds.push(postId);

        // Update the UI immediately.
        const nextLikes = Math.max(0, post.reactions.likes + (liked ? 1 : -1));

        for (const item of state.feedItems) {
          if (item.id === postId) item.reactions.likes = nextLikes;
        }

        for (const item of state.searchItems) {
          if (item.id === postId) item.reactions.likes = nextLikes;
        }

        if (liked && !state.likedPostIds.includes(postId)) {
          state.likedPostIds.push(postId);
        } else if (!liked) {
          state.likedPostIds = state.likedPostIds.filter((id) => id !== postId);
        }
      })
      .addCase(togglePostLike.fulfilled, (state, action) => {
        const { postId, likes } = action.payload;

        for (const item of state.feedItems) {
          if (item.id === postId) item.reactions.likes = likes;
        }

        for (const item of state.searchItems) {
          if (item.id === postId) item.reactions.likes = likes;
        }

        state.likeLoadingIds = state.likeLoadingIds.filter(
          (id) => id !== postId,
        );

        delete state.likeSnapshots[postId];
      })
      .addCase(togglePostLike.rejected, (state, action) => {
        const { postId } = action.meta.arg;
        const snapshot = state.likeSnapshots[postId];

        if (snapshot) {
          for (const item of state.feedItems) {
            if (item.id === postId) item.reactions.likes = snapshot.likes;
          }

          for (const item of state.searchItems) {
            if (item.id === postId) item.reactions.likes = snapshot.likes;
          }

          if (snapshot.liked && !state.likedPostIds.includes(postId)) {
            state.likedPostIds.push(postId);
          } else if (!snapshot.liked) {
            state.likedPostIds = state.likedPostIds.filter(
              (id) => id !== postId,
            );
          }

          delete state.likeSnapshots[postId];
        }

        state.likeLoadingIds = state.likeLoadingIds.filter(
          (id) => id !== postId,
        );
        state.likeError = action.payload ?? "Unable to update like.";
      });
  },
});

export const { clearPostsError, resetSearch } = postsSlice.actions;
export default postsSlice.reducer;
